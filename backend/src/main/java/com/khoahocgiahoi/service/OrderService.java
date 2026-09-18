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
import org.springframework.scheduling.annotation.Async;
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
    private final WalletService walletService;
    private final GoogleDriveService googleDriveService;

    @Value("${payment.bank.name}")
    private String bankName;

    @Value("${payment.bank.account-number}")
    private String bankAccountNumber;

    @Value("${payment.bank.account-name}")
    private String bankAccountName;

    @Value("${payment.order-code-prefix:KHGH}")
    private String orderCodePrefix;

    @Value("${payment.deposit-code-prefix:NAP}")
    private String depositCodePrefix;

    /**
     * Tạo đơn hàng mới từ giỏ hàng của khách (Hỗ trợ Ví hoặc VietQR)
     */
    @Transactional
    public CheckoutResponse checkout(CheckoutRequest request, String userEmail) {
        // 1. Tìm các khóa học
        List<Course> courses = courseRepository.findAllById(request.getCourseIds());
        if (courses.size() != request.getCourseIds().size()) {
            throw new BadRequestException("Một hoặc nhiều khóa học không tồn tại");
        }

        // 2. Tìm User nếu đã đăng nhập & Kiểm tra khóa học đã sở hữu
        User currentUser = null;
        if (userEmail != null) {
            currentUser = userRepository.findByEmail(userEmail).orElse(null);
            if (currentUser != null) {
                for (Course course : courses) {
                    if (purchasedCourseRepository.existsByUserIdAndCourseId(currentUser.getId(), course.getId())) {
                        throw new BadRequestException("Bạn đã sở hữu khóa học: " + course.getTitle());
                    }
                }
            }
        }

        // 3. XÁC THỰC GMAIL NHẬN QUYỀN GOOGLE DRIVE
        // Bắt buộc phải có tài khoản Gmail để hệ thống tự động share Drive
        String driveEmail = request.getDriveEmail();
        if (driveEmail == null || driveEmail.isBlank()) {
            if (currentUser != null && currentUser.getDriveEmail() != null && !currentUser.getDriveEmail().isBlank()) {
                driveEmail = currentUser.getDriveEmail();
            } else if (request.getCustomerEmail() != null && request.getCustomerEmail().toLowerCase().endsWith("@gmail.com")) {
                driveEmail = request.getCustomerEmail().toLowerCase().trim();
            }
        }

        if (driveEmail == null || !driveEmail.toLowerCase().endsWith("@gmail.com")) {
            throw new BadRequestException("Vui lòng cung cấp tài khoản Gmail (kết thúc bằng @gmail.com) để được cấp quyền xem khóa học trên Google Drive.");
        }

        driveEmail = driveEmail.toLowerCase().trim();

        // Cập nhật Gmail vào tài khoản nếu chưa có
        if (currentUser != null && (currentUser.getDriveEmail() == null || currentUser.getDriveEmail().isBlank())) {
            currentUser.setDriveEmail(driveEmail);
            userRepository.save(currentUser);
        }

        // 4. Tính tổng tiền & giảm giá
        BigDecimal subtotal = courses.stream()
                .map(Course::getEffectivePrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal discountAmount = BigDecimal.ZERO;
        String couponCodeUsed = null;

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

        // 6. Kiểm tra phương thức thanh toán: Ví số dư (WALLET) hay Ngân hàng (BANK_TRANSFER)
        boolean isWalletPayment = "WALLET".equalsIgnoreCase(request.getPaymentMethod());

        Order order = Order.builder()
                .orderCode(orderCode)
                .customerName(request.getCustomerName())
                .customerEmail(request.getCustomerEmail().toLowerCase().trim())
                .customerPhone(request.getCustomerPhone())
                .totalAmount(totalAmount)
                .discountAmount(discountAmount)
                .couponCode(couponCodeUsed)
                .status(isWalletPayment ? Order.OrderStatus.PAID : Order.OrderStatus.PENDING)
                .paidAt(isWalletPayment ? LocalDateTime.now() : null)
                .referenceCode(isWalletPayment ? "WALLET-" + orderCode : null)
                .user(currentUser)
                .build();

        // Tạo OrderItems
        for (Course course : courses) {
            OrderItem item = OrderItem.builder()
                    .course(course)
                    .price(course.getEffectivePrice())
                    .courseTitle(course.getTitle())
                    .courseThumbnail(course.getThumbnail())
                    .build();
            order.addItem(item);
        }

        // 7. Xử lý thanh toán Ví
        if (isWalletPayment) {
            if (currentUser == null) {
                throw new BadRequestException("Vui lòng đăng nhập để thanh toán bằng Số dư Ví.");
            }

            // Trừ tiền trong ví
            walletService.deductForPurchase(currentUser, totalAmount, orderCode);
            orderRepository.save(order);

            // Cấp quyền và chia sẻ Google Drive tự động ngay lập tức
            for (OrderItem item : order.getItems()) {
                grantCourseAccessAndShareDrive(order, item.getCourse(), UserPurchasedCourse.ClaimType.PURCHASE, driveEmail);
                courseRepository.incrementRegisteredCount(item.getCourse().getId());
            }

            // Bắn event gửi email xác nhận
            orderEventProducer.publishSendEmailEvent(order.getOrderCode());

            return CheckoutResponse.builder()
                    .orderId(order.getId())
                    .orderCode(orderCode)
                    .totalAmount(totalAmount)
                    .discountAmount(discountAmount)
                    .status(Order.OrderStatus.PAID.name())
                    .paidAt(order.getPaidAt())
                    .driveShared(true)
                    .build();
        }

        // 8. Nếu thanh toán VietQR: lưu đơn PENDING và trả link QR
        orderRepository.save(order);
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
     * Xử lý Webhook từ SePay/PayOS khi ngân hàng xác nhận nhận tiền
     * Tự động phân luồng: Nạp ví (NAPxxxxx) hoặc Mua khóa học (KHGHxxxxx)
     */
    @Transactional
    public void processPaymentWebhook(String orderCode, String referenceCode, String rawWebhookData) {
        log.info("Processing payment webhook for code: {}, ref: {}", orderCode, referenceCode);

        if (orderCode == null || orderCode.isBlank()) {
            log.warn("Empty orderCode received in webhook.");
            return;
        }

        // Phân luồng: Nếu là đơn nạp tiền vào ví
        if (orderCode.startsWith(depositCodePrefix)) {
            walletService.processDepositPayment(orderCode, referenceCode);
            return;
        }

        // Phân luồng: Đơn mua khóa học
        Order order = orderRepository.findByOrderCode(orderCode).orElse(null);
        if (order == null) {
            log.warn("Order not found for orderCode: {}", orderCode);
            return;
        }

        if (order.getStatus() == Order.OrderStatus.PAID) {
            log.info("Order {} already PAID. Skipping duplicate webhook.", orderCode);
            return;
        }

        order.setStatus(Order.OrderStatus.PAID);
        order.setPaidAt(LocalDateTime.now());
        order.setReferenceCode(referenceCode);
        order.setWebhookRawData(rawWebhookData);
        orderRepository.save(order);

        // Xác định Gmail nhận quyền Google Drive
        String targetGmail = null;
        if (order.getUser() != null && order.getUser().getDriveEmail() != null && !order.getUser().getDriveEmail().isBlank()) {
            targetGmail = order.getUser().getDriveEmail();
        } else if (order.getCustomerEmail() != null && order.getCustomerEmail().endsWith("@gmail.com")) {
            targetGmail = order.getCustomerEmail();
        }

        // Cấp quyền sở hữu và tự động chia sẻ Google Drive
        for (OrderItem item : order.getItems()) {
            grantCourseAccessAndShareDrive(order, item.getCourse(), UserPurchasedCourse.ClaimType.PURCHASE, targetGmail);
            courseRepository.incrementRegisteredCount(item.getCourse().getId());
        }

        // Bắn sự kiện sang RabbitMQ để gửi email bất đồng bộ
        orderEventProducer.publishSendEmailEvent(order.getOrderCode());
        log.info("Order {} activated successfully via Webhook with Idempotency Key {}.", orderCode, referenceCode);
    }

    public void processPaymentWebhook(String orderCode, String rawWebhookData) {
        processPaymentWebhook(orderCode, null, rawWebhookData);
    }

    /**
     * Cấp quyền sở hữu và chia sẻ Google Drive tự động
     */
    private void grantCourseAccessAndShareDrive(Order order, Course course, UserPurchasedCourse.ClaimType claimType, String targetGmail) {
        User user = order.getUser();
        boolean alreadyOwned = user != null && purchasedCourseRepository.existsByUserIdAndCourseId(user.getId(), course.getId());

        UserPurchasedCourse upc;
        if (!alreadyOwned) {
            upc = UserPurchasedCourse.builder()
                    .user(user)
                    .course(course)
                    .order(order)
                    .claimType(claimType)
                    .driveShared(false)
                    .build();
        } else {
            upc = purchasedCourseRepository.findByUserIdWithCourse(user.getId()).stream()
                    .filter(p -> p.getCourse().getId().equals(course.getId()))
                    .findFirst()
                    .orElse(null);
        }

        if (upc != null) {
            // Tự động phân quyền trên Google Drive cho người dùng
            String folderId = course.resolveDriveFolderId();
            if (folderId != null && targetGmail != null && !targetGmail.isBlank()) {
                try {
                    String permId = googleDriveService.shareFolderOrFile(folderId, targetGmail);
                    upc.setDriveShared(true);
                    upc.setDrivePermissionId(permId);
                    upc.setDriveSharedAt(LocalDateTime.now());
                    upc.setDriveShareError(null);
                    log.info("✅ Granted Google Drive access for course '{}' (ID: {}) to {}",
                            course.getTitle(), folderId, targetGmail);
                } catch (Exception e) {
                    log.error("⚠️ Failed to share Google Drive for course '{}' with {}: {}",
                            course.getTitle(), targetGmail, e.getMessage());
                    upc.setDriveShareError(e.getMessage());
                }
            } else {
                log.warn("Course {} has no resolveable driveFolderId or targetGmail is missing.", course.getTitle());
            }

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
        String bankId = "MB";
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
