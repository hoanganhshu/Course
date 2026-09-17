package com.khoahocgiahoi.dto.course;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO chi tiết khóa học - có content/giáo trình nhưng vẫn KHÔNG có driveLink
 */
@Data @Builder
public class CourseDetailResponse {
    private Long id;
    private String title;
    private String slug;
    private String thumbnail;
    private String description;
    private String content;        // Giáo trình đầy đủ (HTML/JSON)
    private BigDecimal price;
    private BigDecimal originalPrice;
    private BigDecimal effectivePrice;
    private BigDecimal flashSalePrice;
    private boolean flashSale;
    private boolean flashSaleActive;
    private boolean combo;
    private LocalDateTime flashSaleEndAt;
    private long registeredCount;
    private Long categoryId;
    private String categoryName;
    private String categorySlug;
    private String metaTitle;
    private String metaDescription;
    private LocalDateTime createdAt;
    // ⚠️ driveLink KHÔNG có ở đây - chỉ trả về qua /my-courses/{id}/drive-link
}
