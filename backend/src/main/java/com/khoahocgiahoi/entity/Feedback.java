package com.khoahocgiahoi.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "feedbacks",
    indexes = {
        @Index(name = "idx_feedbacks_display_order", columnList = "display_order")
    }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * URL ảnh chụp màn hình feedback trên Cloudinary
     */
    @Column(name = "image_url", nullable = false, length = 1000)
    private String imageUrl;

    @Column(name = "customer_name", length = 150)
    private String customerName;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column
    private Integer rating; // 1-5

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
