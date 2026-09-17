package com.khoahocgiahoi.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "courses",
    indexes = {
        @Index(name = "idx_courses_slug", columnList = "slug", unique = true),
        @Index(name = "idx_courses_category", columnList = "category_id"),
        @Index(name = "idx_courses_flash_sale", columnList = "is_flash_sale"),
        @Index(name = "idx_courses_registered", columnList = "registered_count")
    }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(nullable = false, unique = true, length = 600)
    private String slug;

    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal price;

    @Column(name = "original_price", nullable = false, precision = 12, scale = 0)
    private BigDecimal originalPrice;

    @Column(length = 1000)
    private String thumbnail;

    /**
     * Mô tả ngắn dùng cho SEO và preview card
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * Nội dung giáo trình đầy đủ dạng HTML/JSON
     * Dùng cho trang chi tiết khóa học
     */
    @Column(columnDefinition = "LONGTEXT")
    private String content;

    /**
     * ⚠️ LINK BÍ MẬT - TUYỆT ĐỐI KHÔNG ĐƯA VÀO CoursePublicResponse
     * Chỉ trả về qua API /my-courses/{id}/drive-link khi đã xác thực quyền sở hữu
     */
    @Column(name = "drive_link", length = 1000)
    private String driveLink;

    /**
     * ID thư mục hoặc file Google Drive để cấp quyền tự động qua API
     */
    @Column(name = "drive_folder_id", length = 100)
    private String driveFolderId;

    public String resolveDriveFolderId() {
        if (driveFolderId != null && !driveFolderId.isBlank()) {
            return driveFolderId.trim();
        }
        if (driveLink != null && !driveLink.isBlank()) {
            // Check for /folders/{id} or /d/{id} or id={id}
            java.util.regex.Matcher m = java.util.regex.Pattern.compile("(?:folders/|/d/|id=)([a-zA-Z0-9_-]{25,})").matcher(driveLink);
            if (m.find()) {
                return m.group(1);
            }
        }
        return null;
    }

    // ---- Flash Sale ----
    @Column(name = "is_flash_sale", nullable = false)
    @Builder.Default
    private Boolean isFlashSale = false;

    @Column(name = "flash_sale_price", precision = 12, scale = 0)
    private BigDecimal flashSalePrice;

    @Column(name = "flash_sale_start_at")
    private LocalDateTime flashSaleStartAt;

    @Column(name = "flash_sale_end_at")
    private LocalDateTime flashSaleEndAt;

    // ---- Combo ----
    @Column(name = "is_combo", nullable = false)
    @Builder.Default
    private Boolean isCombo = false;

    /**
     * Lưu danh sách ID các khóa trong combo dạng JSON: "[1,2,3,4]"
     */
    @Column(name = "combo_course_ids", columnDefinition = "TEXT")
    private String comboCourseIds;

    // ---- Stats ----
    @Column(name = "registered_count", nullable = false)
    @Builder.Default
    private Long registeredCount = 0L;

    // ---- Membership ----
    /**
     * Nếu true, chỉ hội viên mới được dùng quota để claim
     * (không ảnh hưởng đến việc mua trực tiếp)
     */
    @Column(name = "require_combo_membership", nullable = false)
    @Builder.Default
    private Boolean requireComboMembership = false;

    // ---- Publish ----
    @Column(name = "is_published", nullable = false)
    @Builder.Default
    private Boolean isPublished = true;

    // ---- SEO ----
    @Column(name = "meta_title", length = 255)
    private String metaTitle;

    @Column(name = "meta_description", length = 500)
    private String metaDescription;

    // ---- Relationships ----
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<OrderItem> orderItems = new ArrayList<>();

    // ---- Timestamps ----
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ---- Business Logic ----
    public BigDecimal getEffectivePrice() {
        if (Boolean.TRUE.equals(isFlashSale)
                && flashSalePrice != null
                && flashSaleStartAt != null
                && flashSaleEndAt != null
                && LocalDateTime.now().isAfter(flashSaleStartAt)
                && LocalDateTime.now().isBefore(flashSaleEndAt)) {
            return flashSalePrice;
        }
        return price;
    }

    public boolean isFlashSaleActive() {
        return Boolean.TRUE.equals(isFlashSale)
                && flashSaleStartAt != null
                && flashSaleEndAt != null
                && LocalDateTime.now().isAfter(flashSaleStartAt)
                && LocalDateTime.now().isBefore(flashSaleEndAt);
    }
}
