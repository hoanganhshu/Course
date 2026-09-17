package com.khoahocgiahoi.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items",
    indexes = {
        @Index(name = "idx_order_items_order", columnList = "order_id"),
        @Index(name = "idx_order_items_course", columnList = "course_id")
    }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    /**
     * Giá tại thời điểm mua (snapshot để lịch sử không thay đổi)
     */
    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal price;

    /**
     * Tên khóa học tại thời điểm mua (snapshot)
     */
    @Column(name = "course_title", nullable = false, length = 500)
    private String courseTitle;

    /**
     * Thumbnail tại thời điểm mua (snapshot)
     */
    @Column(name = "course_thumbnail", length = 1000)
    private String courseThumbnail;
}
