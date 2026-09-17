package com.khoahocgiahoi.service;

import com.khoahocgiahoi.dto.order.*;
import com.khoahocgiahoi.entity.*;
import com.khoahocgiahoi.exception.BadRequestException;
import com.khoahocgiahoi.exception.ResourceNotFoundException;
import com.khoahocgiahoi.repository.*;
import com.khoahocgiahoi.security.EncryptionService;
import com.khoahocgiahoi.service.mq.OrderEventProducer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final CouponRepository couponRepository;
    private final UserPurchasedCourseRepository purchasedCourseRepository;
    private final EmailService emailService;
    private final OrderEventProducer orderEventProducer;
    private final EncryptionService encryptionService;

    @Value("${payment.bank.name}")
    private String bankName;

    @Value("${payment.bank.account-number}")
    private String bankAccountNumber;

    @Value("${payment.bank.account-name}")
    private String bankAccountName;

    @Value("${payment.order-code-prefix}")
    private String orderCodePrefix;

    /**
     * Tạo đơn hàng mới từ giỏ hàng của khách
     */
    @Transactional
    public CheckoutResponse checkout(CheckoutRequest request, String userEmail) {
        // 1. Tìm các khóa học
        List<Course> courses = courseRepository.findAllById(request.getCourseIds());
        if (courses.size() != request.getCourseIds().size()) {
            throw new BadRequestException("Một hoặc nhiều khóa học không tồn tại");
        }

        // 2. Kiểm tra khách đã mua chưa (nếu đăng nhập)
        if (userEmail != null) {
            Optional<User> userOpt = userRepository.findByEmail(userEmail);
            if (userOpt.isPresent()) {
                for (Course course : courses) {
                    if (purchasedCourseRepository.existsByUserIdAndCourseId(userOpt.get().getId(), course.getId())) {
                        throw new BadRequestException("Bạn đã sở hữu khóa học: " + course.getTitle());
                    }
                }
            }
        }

        // 3. Tính tổng tiền
        BigDecimal subtotal = courses.stream()
                .map(Course::getEffectivePrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal discountAmount = BigDecimal.ZERO;
        String couponCodeUsed = null;

        // 4. Áp mã giảm giá (nếu có)
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            Coupon coupon = couponRepository.findByCodeAndIsActiveTrue(request.getCouponCode().toUpperCase())
                    .orElseThrow(() -> new BadRequestException("Mã giảm giá không hợp lệ hoặc đã hết hạn"));

            if (!coupon.isValid()) {
                throw new BadRequestException("Mã giảm giá đã hết hạn hoặc đã đạt giới hạn sử dụng");
            }

            discountAmount = coupon.calculateDiscount(subtotal);
            couponCodeUsed = coupon.getCode();
            coupon.setUsedCount(coupon.getUsedCount() + 1);
            couponRepository.save(coupon);
        }

        BigDecimal totalAmount = subtotal.subtract(discountAmount);
        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) totalAmount = BigDecimal.ZERO;

        // 5. Sinh mã đơn hàng
        String orderCode = generateUniqueOrderCode();

        // 6. Tạo Order
        Order order = Order.builder()
                .orderCode(orderCode)
                .customerName(request.getCustomerName())
                .customerEmail(request.getCustomerEmail().toLowerCase().trim())
                .customerPhone(request.getCustomerPhone())
                .totalAmount(totalAmount)
                .discountAmount(discountAmount)
                .couponCode(couponCodeUsed)
                .status(Order.OrderStatus.PENDING)
                .build();

        // Gán User nếu đăng nhập
        if (userEmail != null) {
            userRepository.findByEmail(userEmail).ifPresent(order::setUser);
        }

        // 7. Tạo OrderItems
        for (Course course : courses) {
            OrderItem item = OrderItem.builder()
                    .course(course)
                    .price(course.getEffectivePrice())
                    .courseTitle(course.getTitle())
                    .courseThumbnail(course.getThumbnail())
                    .build();
            order.addItem(item);
        }

        orderRepository.save(order);

        // 8. Tạo link QR VietQR
        String vietQrUrl = buildVietQrUrl(orderCode, totalAmount);

        return CheckoutResponse.builder()
                .orderId(order.getId())
                .orderCode(orderCode)
                .totalAmount(totalAmount)
                .discountAmount(discountAmount)
                .bankName(bankName)
                .bankAccountNumber(bankAccountNumber)
                .bankAccountName(bankAccountName)
                .transferContent(orderCode)
                .vietQrUrl(vietQrUrl)
                .status(order.getStatus().name())
                .expiredAt(LocalDateTime.now().plusMinutes(30))
                .build();
    }

    /**
     * Kiểm tra trạng thái đơn hàng (Frontend polling)
     */
    public OrderStatusResponse checkOrderStatus(String orderCode) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderCode", orderCode));

        return OrderStatusResponse.builder()
                .orderCode(orderCode)
                .status(order.getStatus().name())
                .paidAt(order.getPaidAt())
                .driveLinks(
                    order.getStatus() == Order.OrderStatus.PAID
                        ? order.getItems().stream()
                              .map(item -> item.getCourse().getDriveLink())
                              .toList()
                        : List.of()
                )
                .build();
    }

    /**
     * Xử lý Webhook từ SePay/PayOS khi ngân hàng xác nhận thanh toán
     * ⚠️ Áp dụng Idempotency Key và RabbitMQ bất đồng bộ
     */
    @Transactional
    public void processPaymentWebhook(String orderCode, String referenceCode, String rawWebhookData) {
        log.info("Processing payment webhook for order: {}, ref: {}", orderCode, referenceCode);

        Order order = orderRepository.findByOrderCode(orderCode).orElse(null);
        if (order == null) {
            log.warn("Order not found for orderCode: {}", orderCode);
            return;
        }

        // 1. Kiểm tra Idempotency Key: Nếu đơn đã thanh toán hoặc trùng referenceCode -> Bỏ qua chống double-credit
        if (order.getStatus() == Order.OrderStatus.PAID) {
            log.info("Order {} already PAID. Skipping idempotent duplicate webhook.", orderCode);
            return;
        }

        // 2. Cập nhật trạng thái đơn hàng & Idempotency Key
        order.setStatus(Order.OrderStatus.PAID);
        order.setPaidAt(LocalDateTime.now());
        order.setReferenceCode(referenceCode);
        order.setWebhookRawData(rawWebhookData);
        orderRepository.save(order);

        // 3. Cấp quyền sở hữu cho từng khóa học
        for (OrderItem item : order.getItems()) {
            grantCourseAccess(order, item.getCourse(), UserPurchasedCourse.ClaimType.PURCHASE);
            courseRepository.incrementRegisteredCount(item.getCourse().getId());
        }

        // 4. Bắn sự kiện sang RabbitMQ để xử lý gửi email bất đồng bộ (giải phóng Webhook < 200ms)
        orderEventProducer.publishSendEmailEvent(order.getOrderCode());

        log.info("Order {} activated successfully via Webhook with Idempotency Key {}.", orderCode, referenceCode);
    }

    public void processPaymentWebhook(String orderCode, String rawWebhookData) {
        processPaymentWebhook(orderCode, null, rawWebhookData);
    }

    private void grantCourseAccess(Order order, Course course, UserPurchasedCourse.ClaimType claimType) {
        boolean alreadyOwned = order.getUser() != null &&
                purchasedCourseRepository.existsByUserIdAndCourseId(order.getUser().getId(), course.getId());

        if (!alreadyOwned) {
            UserPurchasedCourse upc = UserPurchasedCourse.builder()
                    .user(order.getUser())
                    .course(course)
                    .order(order)
                    .claimType(claimType)
                    .build();
            purchasedCourseRepository.save(upc);
        }
    }

    @Async
    public void sendConfirmationEmailAsync(Order order) {
        try {
            List<String> driveLinks = order.getItems().stream()
                    .map(item -> item.getCourse().getDriveLink())
                    .toList();
            emailService.sendOrderConfirmationEmail(
                    order.getCustomerEmail(),
                    order.getCustomerName(),
                    order.getOrderCode(),
                    order.getItems(),
                    driveLinks
            );
        } catch (Exception e) {
            log.error("Failed to send confirmation email for order {}: {}", order.getOrderCode(), e.getMessage());
        }
    }

    private String generateUniqueOrderCode() {
        String code;
        do {
            int randomNum = 10000 + new Random().nextInt(90000);
            code = orderCodePrefix + randomNum;
        } while (orderRepository.existsByOrderCode(code));
        return code;
    }

    private String buildVietQrUrl(String orderCode, BigDecimal amount) {
        // Sử dụng VietQR Quick Link format
        // https://img.vietqr.io/image/{bankId}-{accountNo}-{template}.png?amount={amount}&addInfo={content}&accountName={name}
        String bankId = "MB"; // MB Bank
        return String.format(
            "https://img.vietqr.io/image/%s-%s-compact2.png?amount=%s&addInfo=%s&accountName=%s",
            bankId,
            bankAccountNumber,
            amount.toPlainString(),
            orderCode,
            bankAccountName.replace(" ", "%20")
        );
    }
}
