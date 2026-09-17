package com.khoahocgiahoi.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Bảng xác nhận quyền sở hữu vĩnh viễn một khóa học của một User.
 * Được tạo khi:
 * 1. Thanh toán đơn hàng thành công (Webhook kích hoạt)
 * 2. Hội viên dùng quota hàng ngày để nhận khóa
 * 3. Admin cấp thủ công
 */
@Entity
@Table(name = "user_purchased_courses",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_course", columnNames = {"user_id", "course_id"})
    },
    indexes = {
        @Index(name = "idx_upc_user_id", columnList = "user_id"),
        @Index(name = "idx_upc_course_id", columnList = "course_id")
    }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserPurchasedCourse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    /**
     * Cách nhận: PURCHASE (mua trực tiếp), MEMBERSHIP_CLAIM (hội viên claim), ADMIN_GRANT (admin cấp)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "claim_type", nullable = false, length = 30)
    @Builder.Default
    private ClaimType claimType = ClaimType.PURCHASE;

    /**
     * Link đến Order nếu nhận qua mua hàng (nullable nếu admin cấp)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @CreationTimestamp
    @Column(name = "purchased_at", updatable = false)
    private LocalDateTime purchasedAt;

    public enum ClaimType {
        PURCHASE,
        MEMBERSHIP_CLAIM,
        ADMIN_GRANT
    }
}
