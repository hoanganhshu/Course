package com.khoahocgiahoi.controller;

import com.khoahocgiahoi.dto.ApiResponse;
import com.khoahocgiahoi.dto.course.*;
import com.khoahocgiahoi.dto.category.CategoryTreeResponse;
import com.khoahocgiahoi.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    /**
     * GET /courses?keyword=&category=&sort=registeredCount&order=desc&page=0&size=12
     */
    @GetMapping("/courses")
    public ResponseEntity<ApiResponse<Page<CoursePublicResponse>>> getCourses(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "registeredCount") String sortBy,
            @RequestParam(defaultValue = "desc") String order,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                courseService.getCourses(keyword, category, sortBy, order, page, size)));
    }

    /**
     * GET /courses/flash-sale
     */
    @GetMapping("/courses/flash-sale")
    public ResponseEntity<ApiResponse<List<CoursePublicResponse>>> getFlashSale() {
        return ResponseEntity.ok(ApiResponse.success(courseService.getFlashSaleCourses()));
    }

    /**
     * GET /courses/best-sellers
     */
    @GetMapping("/courses/best-sellers")
    public ResponseEntity<ApiResponse<List<CoursePublicResponse>>> getBestSellers() {
        return ResponseEntity.ok(ApiResponse.success(courseService.getBestSellers()));
    }

    /**
     * GET /courses/latest
     */
    @GetMapping("/courses/latest")
    public ResponseEntity<ApiResponse<List<CoursePublicResponse>>> getLatest() {
        return ResponseEntity.ok(ApiResponse.success(courseService.getLatest()));
    }

    /**
     * GET /courses/search?q=react&size=8 (Live Search)
     */
    @GetMapping("/courses/search")
    public ResponseEntity<ApiResponse<Page<CoursePublicResponse>>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "8") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                courseService.getCourses(q, null, "registeredCount", "desc", 0, size)));
    }

    /**
     * GET /courses/{slug}
     */
    @GetMapping("/courses/{slug}")
    public ResponseEntity<ApiResponse<CourseDetailResponse>> getCourseDetail(
            @PathVariable String slug
    ) {
        return ResponseEntity.ok(ApiResponse.success(courseService.getCourseDetail(slug)));
    }

    /**
     * GET /categories - Cây danh mục cho Mega Menu
     */
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryTreeResponse>>> getCategoryTree() {
        return ResponseEntity.ok(ApiResponse.success(courseService.getCategoryTree()));
    }
}
