package com.khoahocgiahoi.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons",
    indexes = {
        @Index(name = "idx_coupons_code", columnList = "code", unique = true)
    }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    /**
     * Phần trăm giảm giá (VD: 10 = giảm 10%)
     */
    @Column(name = "discount_percent", nullable = false)
    private Integer discountPercent;

    /**
     * Giảm tối đa (VD: 50000 = giảm tối đa 50k)
     * null = không giới hạn
     */
    @Column(name = "max_discount", precision = 12, scale = 0)
    private BigDecimal maxDiscount;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    /**
     * Số lần sử dụng tối đa. null = không giới hạn
     */
    @Column(name = "usage_limit")
    private Integer usageLimit;

    @Column(name = "used_count", nullable = false)
    @Builder.Default
    private Integer usedCount = 0;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // ---- Business Logic ----
    public boolean isValid() {
        if (!Boolean.TRUE.equals(isActive)) return false;
        if (expiresAt != null && LocalDateTime.now().isAfter(expiresAt)) return false;
        if (usageLimit != null && usedCount >= usageLimit) return false;
        return true;
    }

    public BigDecimal calculateDiscount(BigDecimal orderTotal) {
        BigDecimal discount = orderTotal.multiply(BigDecimal.valueOf(discountPercent)).divide(BigDecimal.valueOf(100));
        if (maxDiscount != null && discount.compareTo(maxDiscount) > 0) {
            discount = maxDiscount;
        }
        return discount;
    }
}
