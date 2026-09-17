package com.khoahocgiahoi.dto.course;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO công khai - TUYỆT ĐỐI KHÔNG chứa driveLink
 */
@Data @Builder
public class CoursePublicResponse {
    private Long id;
    private String title;
    private String slug;
    private String thumbnail;
    private String description;
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
    private LocalDateTime createdAt;
    // ⚠️ driveLink KHÔNG có ở đây
}
