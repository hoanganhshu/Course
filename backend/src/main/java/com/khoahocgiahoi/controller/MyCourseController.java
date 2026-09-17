package com.khoahocgiahoi.controller;

import com.khoahocgiahoi.dto.ApiResponse;
import com.khoahocgiahoi.dto.course.CoursePublicResponse;
import com.khoahocgiahoi.entity.*;
import com.khoahocgiahoi.exception.BadRequestException;
import com.khoahocgiahoi.exception.ResourceNotFoundException;
import com.khoahocgiahoi.repository.*;
import com.khoahocgiahoi.security.EncryptionService;
import com.khoahocgiahoi.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/my-courses")
@RequiredArgsConstructor
public class MyCourseController {

    private final UserRepository userRepository;
    private final UserPurchasedCourseRepository purchasedCourseRepository;
    private final CourseRepository courseRepository;
    private final CourseService courseService;
    private final EncryptionService encryptionService;

    /**
     * GET /my-courses
     * Danh sách tất cả khóa học đã sở hữu (mua hoặc claim bằng hội viên)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CoursePublicResponse>>> getMyCourses(
            Authentication authentication
    ) {
        User user = getUser(authentication);
        List<CoursePublicResponse> courses = purchasedCourseRepository
                .findByUserIdWithCourse(user.getId())
                .stream()
                .map(upc -> courseService.toPublicResponse(upc.getCourse()))
                .toList();
        return ResponseEntity.ok(ApiResponse.success(courses));
    }

    /**
     * GET /my-courses/{courseId}/drive-link
     * ⚠️ Endpoint BẢO MẬT: Chỉ trả về Google Drive Link khi user đã sở hữu khóa học
     * Được giải mã an toàn từ chuẩn quân sự AES-256-GCM
     */
    @GetMapping("/{courseId}/drive-link")
    public ResponseEntity<ApiResponse<Map<String, String>>> getDriveLink(
            @PathVariable Long courseId,
            Authentication authentication
    ) {
        User user = getUser(authentication);

        // Kiểm tra quyền sở hữu
        boolean owned = purchasedCourseRepository.existsByUserIdAndCourseId(user.getId(), courseId);
        if (!owned) {
            throw new BadRequestException("Bạn chưa sở hữu khóa học này. Vui lòng mua hoặc nhận qua gói hội viên.");
        }

        // Lấy link Drive
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        if (course.getDriveLink() == null || course.getDriveLink().isBlank()) {
            throw new BadRequestException("Link học tập đang được cập nhật. Vui lòng liên hệ hỗ trợ Zalo.");
        }

        // Giải mã AES-256-GCM
        String decryptedLink;
        try {
            decryptedLink = encryptionService.decrypt(course.getDriveLink());
        } catch (Exception e) {
            decryptedLink = course.getDriveLink(); // fallback nếu là link plain text
        }

        return ResponseEntity.ok(ApiResponse.success(
                "Đây là link Google Drive học tập của bạn.",
                Map.of(
                    "driveLink", decryptedLink,
                    "courseTitle", course.getTitle()
                )
        ));
    }

    private User getUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", authentication.getName()));
    }
}
