package com.khoahocgiahoi.service;

import com.khoahocgiahoi.dto.category.CategoryTreeResponse;
import com.khoahocgiahoi.dto.course.CourseDetailResponse;
import com.khoahocgiahoi.dto.course.CoursePublicResponse;
import com.khoahocgiahoi.entity.Category;
import com.khoahocgiahoi.entity.Course;
import com.khoahocgiahoi.exception.ResourceNotFoundException;
import com.khoahocgiahoi.repository.CategoryRepository;
import com.khoahocgiahoi.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CourseService {

    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;

    /** Danh sách khóa học có phân trang, tìm kiếm, lọc, sắp xếp */
    public Page<CoursePublicResponse> getCourses(
            String keyword, String categorySlug,
            String sortBy, String order, int page, int size
    ) {
        Sort sort = buildSort(sortBy, order);
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Course> courses = courseRepository.searchCourses(
            keyword == null || keyword.isBlank() ? null : keyword,
            categorySlug == null || categorySlug.isBlank() ? null : categorySlug,
            pageable
        );
        return courses.map(this::toPublicResponse);
    }

    /** Chi tiết khóa học theo slug */
    public CourseDetailResponse getCourseDetail(String slug) {
        Course course = courseRepository.findBySlugAndIsPublishedTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "slug", slug));
        return toDetailResponse(course);
    }

    /** Danh sách Flash Sale đang chạy */
    public List<CoursePublicResponse> getFlashSaleCourses() {
        return courseRepository.findActiveFlashSaleCourses(LocalDateTime.now())
                .stream().map(this::toPublicResponse).toList();
    }

    /** Top 10 bán chạy nhất */
    public List<CoursePublicResponse> getBestSellers() {
        return courseRepository.findTop10ByIsPublishedTrueOrderByRegisteredCountDesc()
                .stream().map(this::toPublicResponse).toList();
    }

    /** Top 10 mới cập nhật */
    public List<CoursePublicResponse> getLatest() {
        return courseRepository.findTop10ByIsPublishedTrueOrderByCreatedAtDesc()
                .stream().map(this::toPublicResponse).toList();
    }

    /** Khóa học liên quan (cùng danh mục) */
    public List<CoursePublicResponse> getRelated(String categorySlug, Long excludeId) {
        return courseRepository.findRelatedCourses(categorySlug, excludeId, PageRequest.of(0, 6))
                .stream().map(this::toPublicResponse).toList();
    }

    /** Cây danh mục cho Mega Menu */
    public List<CategoryTreeResponse> getCategoryTree() {
        List<Category> roots = categoryRepository.findRootCategoriesWithChildren();
        return roots.stream().map(this::toCategoryTree).toList();
    }

    // ==================== MAPPING METHODS ====================

    /** ⚠️ Tuyệt đối không đưa driveLink vào đây */
    public CoursePublicResponse toPublicResponse(Course c) {
        return CoursePublicResponse.builder()
                .id(c.getId())
                .title(c.getTitle())
                .slug(c.getSlug())
                .thumbnail(c.getThumbnail())
                .description(c.getDescription())
                .price(c.getPrice())
                .originalPrice(c.getOriginalPrice())
                .effectivePrice(c.getEffectivePrice())
                .flashSalePrice(c.getFlashSalePrice())
                .flashSale(Boolean.TRUE.equals(c.getIsFlashSale()))
                .flashSaleActive(c.isFlashSaleActive())
                .combo(Boolean.TRUE.equals(c.getIsCombo()))
                .flashSaleEndAt(c.getFlashSaleEndAt())
                .registeredCount(c.getRegisteredCount())
                .categoryId(c.getCategory() != null ? c.getCategory().getId() : null)
                .categoryName(c.getCategory() != null ? c.getCategory().getName() : null)
                .categorySlug(c.getCategory() != null ? c.getCategory().getSlug() : null)
                .createdAt(c.getCreatedAt())
                .build();
    }

    /** ⚠️ Tuyệt đối không đưa driveLink vào đây */
    private CourseDetailResponse toDetailResponse(Course c) {
        return CourseDetailResponse.builder()
                .id(c.getId())
                .title(c.getTitle())
                .slug(c.getSlug())
                .thumbnail(c.getThumbnail())
                .description(c.getDescription())
                .content(c.getContent())
                .price(c.getPrice())
                .originalPrice(c.getOriginalPrice())
                .effectivePrice(c.getEffectivePrice())
                .flashSalePrice(c.getFlashSalePrice())
                .flashSale(Boolean.TRUE.equals(c.getIsFlashSale()))
                .flashSaleActive(c.isFlashSaleActive())
                .combo(Boolean.TRUE.equals(c.getIsCombo()))
                .flashSaleEndAt(c.getFlashSaleEndAt())
                .registeredCount(c.getRegisteredCount())
                .categoryId(c.getCategory() != null ? c.getCategory().getId() : null)
                .categoryName(c.getCategory() != null ? c.getCategory().getName() : null)
                .categorySlug(c.getCategory() != null ? c.getCategory().getSlug() : null)
                .metaTitle(c.getMetaTitle())
                .metaDescription(c.getMetaDescription())
                .createdAt(c.getCreatedAt())
                .build();
    }

    private CategoryTreeResponse toCategoryTree(Category cat) {
        List<CategoryTreeResponse> children = cat.getChildren().stream()
                .filter(c -> Boolean.TRUE.equals(c.getIsActive()))
                .sorted((a, b) -> Integer.compare(a.getDisplayOrder(), b.getDisplayOrder()))
                .map(this::toCategoryTree)
                .collect(Collectors.toList());

        return CategoryTreeResponse.builder()
                .id(cat.getId())
                .name(cat.getName())
                .slug(cat.getSlug())
                .icon(cat.getIcon())
                .displayOrder(cat.getDisplayOrder())
                .children(children)
                .build();
    }

    private Sort buildSort(String sortBy, String order) {
        Sort.Direction dir = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return switch (sortBy == null ? "" : sortBy) {
            case "price"           -> Sort.by(dir, "price");
            case "registeredCount" -> Sort.by(dir, "registeredCount");
            case "createdAt"       -> Sort.by(dir, "createdAt");
            default                -> Sort.by(Sort.Direction.DESC, "registeredCount");
        };
    }
}
