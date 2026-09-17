package com.khoahocgiahoi.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "membership_plans")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MembershipPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name; // Start, Flex, Plus, Pro, VIP, Lifetime

    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal price;

    /**
     * Thời hạn gói (ngày). null = Lifetime (vô hạn)
     */
    @Column(name = "duration_days")
    private Integer durationDays;

    /**
     * Số lượng khóa được nhận mỗi ngày.
     * -1 = không giới hạn (Lifetime)
     */
    @Column(name = "daily_quota", nullable = false)
    private Integer dailyQuota;

    /**
     * Có được claim khóa thuộc danh mục Combo không
     */
    @Column(name = "allow_combo", nullable = false)
    @Builder.Default
    private Boolean allowCombo = false;

    /**
     * Mô tả quyền lợi (danh sách dạng JSON hoặc text)
     */
    @Column(columnDefinition = "TEXT")
    private String benefits;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    public boolean isLifetime() {
        return durationDays == null || durationDays <= 0;
    }

    public boolean hasUnlimitedQuota() {
        return dailyQuota == -1;
    }
}
