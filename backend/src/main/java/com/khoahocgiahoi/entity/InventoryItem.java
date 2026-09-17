package com.khoahocgiahoi.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

/**
 * Kho hàng số hóa lưu trữ tài khoản, bản quyền, link drive
 * Được bảo vệ bằng khóa bi quan Pessimistic Locking (SELECT ... FOR UPDATE)
 */
@Entity
@Table(name = "inventory_items",
    indexes = {
        @Index(name = "idx_inventory_course_avail", columnList = "course_id, is_delivered")
    }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "item_type", nullable = false, length = 50)
    @Builder.Default
    private String itemType = "GOOGLE_DRIVE"; // GOOGLE_DRIVE, ACCOUNT_2FA, LICENSE_KEY, INVITE_LINK

    /**
     * Cột JSONB của PostgreSQL 16
     * Chứa thông tin tài khoản hoặc link được mã hóa bằng AES-256-GCM
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "item_data", columnDefinition = "jsonb", nullable = false)
    private String itemData;

    @Column(name = "is_delivered", nullable = false)
    @Builder.Default
    private Boolean isDelivered = false;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "order_id")
    private Long orderId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
