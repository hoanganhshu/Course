package com.khoahocgiahoi.repository;

import com.khoahocgiahoi.entity.UserPurchasedCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface UserPurchasedCourseRepository extends JpaRepository<UserPurchasedCourse, Long> {

    boolean existsByUserIdAndCourseId(Long userId, Long courseId);

    Optional<UserPurchasedCourse> findByUserIdAndCourseId(Long userId, Long courseId);

    @Query("SELECT u FROM UserPurchasedCourse u JOIN FETCH u.course c " +
           "WHERE u.user.id = :userId ORDER BY u.purchasedAt DESC")
    List<UserPurchasedCourse> findByUserIdWithCourse(@Param("userId") Long userId);
}
