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
     * TẠO ĐƠN HÀNG (CHECKOUT)
     * Nhận yêu cầu mua khóa học từ giỏ hàng (Hỗ trợ 2 hình thức: Ví số dư hoặc Quét VietQR ngân hàng)
     */
    @Transactional // Đảm bảo toàn bộ thao tác ghi CSDL trong hàm này nằm trong 1 Transaction duy nhất (Rollback nếu lỗi)
    public CheckoutResponse checkout(CheckoutRequest request, String userEmail) {
        // Bước 1: Tìm danh sách các khóa học theo danh sách ID khách gửi lên
        List<Course> courses = courseRepository.findAllById(request.getCourseIds());
        // Kiểm tra nếu số lượng tìm thấy không khớp với số lượng ID yêu cầu (phòng trường hợp khóa học bị xóa)
        if (courses.size() != request.getCourseIds().size()) {
            throw new BadRequestException("Một hoặc nhiều khóa học không tồn tại trong hệ thống");
        }

        // Bước 2: Tìm thông tin User nếu đã đăng nhập & Kiểm tra xem đã sở hữu khóa học nào trong giỏ chưa
        User currentUser = null;
        if (userEmail != null) {
            currentUser = userRepository.findByEmail(userEmail).orElse(null);
            if (currentUser != null) {
                for (Course course : courses) {
                    // Nếu user đã mua khóa học này rồi -> chặn mua trùng lặp để bảo vệ khách không mất tiền oan
                    if (purchasedCourseRepository.existsByUserIdAndCourseId(currentUser.getId(), course.getId())) {
                        throw new BadRequestException("Bạn đã sở hữu khóa học: " + course.getTitle());
                    }
                }
            }
        }

        // Bước 3: XÁC THỰC VÀ BẢO LƯU GMAIL NHẬN QUYỀN GOOGLE DRIVE
        // Bắt buộc phải có tài khoản Gmail để hệ thống tự động share Drive phân quyền học tập
        String driveEmail = request.getDriveEmail();
        if (driveEmail == null || driveEmail.isBlank()) {
            if (currentUser != null && currentUser.getDriveEmail() != null && !currentUser.getDriveEmail().isBlank()) {
                driveEmail = currentUser.getDriveEmail();
            } else if (request.getCustomerEmail() != null && request.getCustomerEmail().toLowerCase().endsWith("@gmail.com")) {
                driveEmail = request.getCustomerEmail().toLowerCase().trim();
            }
        }

        // Kiểm tra bắt buộc đuôi email phải là @gmail.com
        if (driveEmail == null || !driveEmail.toLowerCase().endsWith("@gmail.com")) {
            throw new BadRequestException("Vui lòng cung cấp tài khoản Gmail (kết thúc bằng @gmail.com) để được cấp quyền xem khóa học trên Google Drive.");
        }

        driveEmail = driveEmail.toLowerCase().trim();

        // Tự động lưu Gmail này vào hồ sơ User nếu trước đó chưa lưu
        if (currentUser != null && (currentUser.getDriveEmail() == null || currentUser.getDriveEmail().isBlank())) {
            currentUser.setDriveEmail(driveEmail);
            userRepository.save(currentUser);
        }

        // Bước 4: Tính tổng tiền tạm tính (Subtotal) của tất cả khóa học
        BigDecimal subtotal = courses.stream()
                .map(Course::getEffectivePrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal discountAmount = BigDecimal.ZERO;
        String couponCodeUsed = null;

        // Xử lý mã giảm giá Coupon nếu khách có nhập
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            Coupon coupon = couponRepository.findByCodeAndIsActiveTrue(request.getCouponCode().toUpperCase())
                    .orElseThrow(() -> new BadRequestException("Mã giảm giá không hợp lệ hoặc đã hết hạn"));

            if (!coupon.isValid()) {
                throw new BadRequestException("Mã giảm giá đã hết hạn hoặc đã đạt giới hạn lượt sử dụng");
            }

            // Tính số tiền được giảm theo % hoặc theo số tiền cố định
            discountAmount = coupon.calculateDiscount(subtotal);
            couponCodeUsed = coupon.getCode();
            // Tăng số lượt đã dùng của coupon và lưu lại
            coupon.setUsedCount(coupon.getUsedCount() + 1);
            couponRepository.save(coupon);
        }

        // Số tiền thực tế khách cần thanh toán = Tạm tính - Giảm giá
        BigDecimal totalAmount = subtotal.subtract(discountAmount);
        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) totalAmount = BigDecimal.ZERO;

        // Bước 5: Sinh mã đơn hàng ngẫu nhiên duy nhất (ví dụ: KHGH91823)
        String orderCode = generateUniqueOrderCode();

        // Bước 6: Nhận diện phương thức thanh toán: Bằng Ví (WALLET) hay Ngân hàng (BANK_TRANSFER)
        boolean isWalletPayment = "WALLET".equalsIgnoreCase(request.getPaymentMethod());

        // Khởi tạo đối tượng đơn hàng Order
        Order order = Order.builder()
                .orderCode(orderCode)
                .customerName(request.getCustomerName())
                .customerEmail(request.getCustomerEmail().toLowerCase().trim())
                .customerPhone(request.getCustomerPhone())
                .totalAmount(totalAmount)
                .discountAmount(discountAmount)
                .couponCode(couponCodeUsed)
                // Nếu thanh toán bằng ví thì trạng thái là PAID ngay lập tức, ngược lại là PENDING chờ chuyển khoản
                .status(isWalletPayment ? Order.OrderStatus.PAID : Order.OrderStatus.PENDING)
                .paidAt(isWalletPayment ? LocalDateTime.now() : null)
                .referenceCode(isWalletPayment ? "WALLET-" + orderCode : null)
                .user(currentUser)
                .build();

        // Tạo chi tiết từng mục trong đơn hàng (OrderItems)
        for (Course course : courses) {
            OrderItem item = OrderItem.builder()
                    .course(course)
                    .price(course.getEffectivePrice())
                    .courseTitle(course.getTitle())
                    .courseThumbnail(course.getThumbnail())
                    .build();
            order.addItem(item);
        }

        // Bước 7: XỬ LÝ NẾU THANH TOÁN BẰNG SỐ DƯ VÍ
        if (isWalletPayment) {
            if (currentUser == null) {
                throw new BadRequestException("Vui lòng đăng nhập để thanh toán bằng Số dư Ví.");
            }

            // Trừ tiền trong ví của người dùng (nếu không đủ tiền sẽ throw Exception)
            walletService.deductForPurchase(currentUser, totalAmount, orderCode);
            orderRepository.save(order);

            // Tự động cấp quyền sở hữu và chia sẻ Google Drive ngay lập tức
            for (OrderItem item : order.getItems()) {
                grantCourseAccessAndShareDrive(order, item.getCourse(), UserPurchasedCourse.ClaimType.PURCHASE, driveEmail);
                courseRepository.incrementRegisteredCount(item.getCourse().getId());
            }

            // Bắn Message sang RabbitMQ để Worker gửi email xác nhận cho khách bất đồng bộ
            orderEventProducer.publishSendEmailEvent(order.getOrderCode());

            // Trả về kết quả hoàn tất đơn hàng
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

        // Bước 8: XỬ LÝ NẾU THANH TOÁN QUA VIETQR NGÂN HÀNG
        // Lưu đơn hàng trạng thái PENDING chờ khách quét mã thanh toán
        orderRepository.save(order);
        // Sinh đường dẫn ảnh mã QR ngân hàng chuẩn NAPAS 24/7 chứa sẵn số tiền và mã đơn
        String vietQrUrl = buildVietQrUrl(orderCode, totalAmount);

        // Trả về thông tin chuyển khoản và ảnh QR cho frontend hiển thị
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
                .expiredAt(LocalDateTime.now().plusMinutes(30)) // Mã thanh toán hết hạn sau 30 phút
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
     * XỬ LÝ WEBHOOK THANH TOÁN TỰ ĐỘNG TỪ NGÂN HÀNG
     * Khi ngân hàng nhận tiền chuyển khoản, SePay/PayOS sẽ gọi hàm này để kích hoạt tức thì trong 3 giây.
     * Tự động phân luồng: Nạp ví (mã bắt đầu bằng NAP/DEP) hoặc Mua khóa học (mã KHGH).
     */
    @Transactional // Đảm bảo tính toàn vẹn dữ liệu: toàn bộ cập nhật đơn hàng và cấp quyền thành công hoặc rollback nếu lỗi
    public void processPaymentWebhook(String orderCode, String referenceCode, String rawWebhookData) {
        log.info("Bắt đầu xử lý Webhook thanh toán cho mã: {}, Mã tham chiếu ngân hàng: {}", orderCode, referenceCode);

        // Kiểm tra an toàn: nếu không có mã thì dừng lại
        if (orderCode == null || orderCode.isBlank()) {
            log.warn("Webhook gửi lên không có orderCode hợp lệ.");
            return;
        }

        // BƯỚC 1: PHÂN LUỒNG NẠP VÍ
        // Nếu mã giao dịch bắt đầu bằng tiền tố nạp ví (ví dụ: NAP hoặc DEP)
        if (orderCode.startsWith(depositCodePrefix) || orderCode.startsWith("DEP")) {
            // Chuyển sang WalletService để cộng số dư ví cho học viên
            walletService.processDepositPayment(orderCode, referenceCode);
            return;
        }

        // BƯỚC 2: PHÂN LUỒNG MUA KHÓA HỌC TRỰC TIẾP
        // Tìm đơn hàng trong CSDL theo mã đơn orderCode
        Order order = orderRepository.findByOrderCode(orderCode).orElse(null);
        if (order == null) {
            log.warn("Không tìm thấy đơn hàng tương ứng với mã: {}", orderCode);
            return;
        }

        // BƯỚC 3: CƠ CHẾ IDEMPOTENCY (CHỐNG TRÙNG LẶP)
        // Nếu đơn hàng này đã ở trạng thái PAID từ trước đó -> bỏ qua ngay, không cộng hay cấp quyền lần 2
        if (order.getStatus() == Order.OrderStatus.PAID) {
            log.info("Đơn hàng {} đã được thanh toán trước đó. Bỏ qua webhook trùng lặp.", orderCode);
            return;
        }

        // BƯỚC 4: CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG THÀNH PAID
        order.setStatus(Order.OrderStatus.PAID);
        order.setPaidAt(LocalDateTime.now());                       // Ghi nhận thời gian nhận tiền
        order.setReferenceCode(referenceCode);                      // Lưu mã giao dịch ngân hàng làm bằng chứng đối soát
        order.setWebhookRawData(rawWebhookData);                    // Lưu toàn bộ payload webhook gốc phục vụ kiểm toán
        orderRepository.save(order);

        // BƯỚC 5: XÁC ĐỊNH GMAIL CẦN CẤP QUYỀN GOOGLE DRIVE
        String targetGmail = null;
        if (order.getUser() != null && order.getUser().getDriveEmail() != null && !order.getUser().getDriveEmail().isBlank()) {
            targetGmail = order.getUser().getDriveEmail();
        } else if (order.getCustomerEmail() != null && order.getCustomerEmail().endsWith("@gmail.com")) {
            targetGmail = order.getCustomerEmail();
        }

        // BƯỚC 6: CẤP QUYỀN SỞ HỮU KHÓA HỌC CHO HỌC VIÊN
        // Duyệt qua từng khóa học trong đơn hàng
        for (OrderItem item : order.getItems()) {
            // Cấp quyền sở hữu vào bảng user_purchased_courses
            grantCourseAccessAndShareDrive(order, item.getCourse(), UserPurchasedCourse.ClaimType.PURCHASE, targetGmail);
            // Tăng số lượng học viên đã sở hữu (registeredCount + 1)
            courseRepository.incrementRegisteredCount(item.getCourse().getId());
        }

        // BƯỚC 7: BẮN SỰ KIỆN SANG RABBITMQ ĐỂ GỬI EMAIL BẤT ĐỒNG BỘ
        // Webhook phản hồi HTTP 200 cho ngân hàng ngay trong < 200ms, còn việc gửi email sẽ do RabbitMQ Worker làm ngầm
        orderEventProducer.publishSendEmailEvent(order.getOrderCode());
        log.info("Kích hoạt đơn hàng {} thành công qua Webhook với Idempotency Key {}.", orderCode, referenceCode);
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
