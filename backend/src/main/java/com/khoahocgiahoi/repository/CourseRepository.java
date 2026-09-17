package com.khoahocgiahoi.repository;

import com.khoahocgiahoi.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {

    Optional<Course> findBySlugAndIsPublishedTrue(String slug);

    @Query("SELECT c FROM Course c WHERE c.isPublished = true " +
           "AND (:keyword IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%',:keyword,'%'))) " +
           "AND (:categorySlug IS NULL OR c.category.slug = :categorySlug " +
           "     OR c.category.parent.slug = :categorySlug)")
    Page<Course> searchCourses(
        @Param("keyword") String keyword,
        @Param("categorySlug") String categorySlug,
        Pageable pageable
    );

    @Query("SELECT c FROM Course c WHERE c.isFlashSale = true " +
           "AND c.flashSaleStartAt <= :now AND c.flashSaleEndAt >= :now AND c.isPublished = true")
    List<Course> findActiveFlashSaleCourses(@Param("now") LocalDateTime now);

    List<Course> findTop10ByIsPublishedTrueOrderByRegisteredCountDesc();

    List<Course> findTop10ByIsPublishedTrueOrderByCreatedAtDesc();

    @Query("SELECT c FROM Course c WHERE c.isPublished = true AND c.category.slug = :slug " +
           "AND c.id <> :excludeId ORDER BY c.registeredCount DESC")
    List<Course> findRelatedCourses(
        @Param("slug") String categorySlug,
        @Param("excludeId") Long excludeId,
        Pageable pageable
    );

    @Modifying
    @Query("UPDATE Course c SET c.registeredCount = c.registeredCount + 1 WHERE c.id = :id")
    void incrementRegisteredCount(@Param("id") Long id);
}
