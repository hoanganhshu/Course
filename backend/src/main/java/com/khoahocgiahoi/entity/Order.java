package com.khoahocgiahoi.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders",
    indexes = {
        @Index(name = "idx_orders_order_code", columnList = "order_code", unique = true),
        @Index(name = "idx_orders_reference_code", columnList = "reference_code", unique = true),
        @Index(name = "idx_orders_user_id", columnList = "user_id"),
        @Index(name = "idx_orders_status", columnList = "status"),
        @Index(name = "idx_orders_customer_email", columnList = "customer_email")
    }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Mã đơn hàng duy nhất: KHGH + random numbers
     * Dùng làm nội dung chuyển khoản VietQR
     * VD: KHGH10283
     */
    @Column(name = "order_code", nullable = false, unique = true, length = 50)
    private String orderCode;

    /**
     * Idempotency Key: Mã tham chiếu duy nhất từ Webhook ngân hàng
     * Ngăn ngừa double-credit khi ngân hàng retry gửi webhook nhiều lần
     */
    @Column(name = "reference_code", unique = true, length = 100)
    private String referenceCode;

    /**
     * null nếu khách mua ẩn danh (không cần đăng nhập)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // ---- Customer Info (lưu lại tại thời điểm mua) ----
    @Column(name = "customer_name", nullable = false, length = 150)
    private String customerName;

    @Column(name = "customer_email", nullable = false, length = 255)
    private String customerEmail;

    @Column(name = "customer_phone", length = 20)
    private String customerPhone;

    // ---- Pricing ----
    @Column(name = "total_amount", nullable = false, precision = 12, scale = 0)
    private BigDecimal totalAmount;

    @Column(name = "discount_amount", precision = 12, scale = 0)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "coupon_code", length = 50)
    private String couponCode;

    // ---- Payment ----
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    @Column(name = "payment_method", length = 50)
    @Builder.Default
    private String paymentMethod = "VIET_QR";

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    /**
     * Dữ liệu raw từ Webhook Ngân hàng/PayOS để tra cứu khi cần
     */
    @Column(name = "webhook_raw_data", columnDefinition = "TEXT")
    private String webhookRawData;

    // ---- Timestamps ----
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // ---- Relationships ----
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    // ---- Enum ----
    public enum OrderStatus {
        PENDING,   // Chờ thanh toán
        PAID,      // Đã thanh toán (webhook xác nhận)
        CANCELLED, // Đã hủy
        REFUNDED   // Đã hoàn tiền
    }

    // ---- Helper ----
    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }
}
