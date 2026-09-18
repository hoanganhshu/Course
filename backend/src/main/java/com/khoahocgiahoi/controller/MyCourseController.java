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

// Đánh dấu đây là REST Controller, tự động serialize kết quả trả về sang JSON
@RestController
// Tiền tố đường dẫn URL cho toàn bộ các endpoint trong Controller này: /api/v1/my-courses
@RequestMapping("/my-courses")
// Tự động tạo Constructor cho các thuộc tính final bên dưới (Dependency Injection)
@RequiredArgsConstructor
public class MyCourseController {

    // Repository thao tác với bảng users
    private final UserRepository userRepository;
    // Repository thao tác với bảng user_purchased_courses (bảng lưu các khóa học user đã mua)
    private final UserPurchasedCourseRepository purchasedCourseRepository;
    // Repository thao tác với bảng courses
    private final CourseRepository courseRepository;
    // Service chuyển đổi Course entity sang DTO an toàn
    private final CourseService courseService;
    // Service mã hóa & giải mã chuẩn quân sự AES-256-GCM
    private final EncryptionService encryptionService;

    /**
     * API: GET /api/v1/my-courses
     * Lấy danh sách toàn bộ các khóa học mà người dùng hiện tại đã mua / sở hữu
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CoursePublicResponse>>> getMyCourses(
            Authentication authentication // Đối tượng xác thực chứa email người dùng từ JWT Token
    ) {
        // Bước 1: Lấy entity User hiện tại từ CSDL dựa vào email trong JWT
        User user = getUser(authentication);

        // Bước 2: Truy vấn danh sách các khóa học user đã mua kèm JOIN FETCH thông tin khóa học
        List<CoursePublicResponse> courses = purchasedCourseRepository
                .findByUserIdWithCourse(user.getId())
                .stream()
                // Chuyển đổi entity Course sang DTO CoursePublicResponse (ẩn driveLink để an toàn)
                .map(upc -> courseService.toPublicResponse(upc.getCourse()))
                .toList();

        // Bước 3: Trả về HTTP 200 OK kèm danh sách khóa học
        return ResponseEntity.ok(ApiResponse.success(courses));
    }

    /**
     * API: GET /api/v1/my-courses/{courseId}/drive-link
     * ⚠️ ENDPOINT BẢO MẬT NHẤT HỆ THỐNG:
     * Chỉ trả về link Google Drive khi người dùng ĐÃ THANH TOÁN THÀNH CÔNG khóa học này.
     * Link Drive được giải mã an toàn tại thời điểm gọi bằng thuật toán AES-256-GCM.
     */
    @GetMapping("/{courseId}/drive-link")
    public ResponseEntity<ApiResponse<Map<String, String>>> getDriveLink(
            @PathVariable Long courseId,  // Mã ID khóa học truyền trên URL
            Authentication authentication // Người dùng hiện tại
    ) {
        // Bước 1: Xác định danh tính User từ Token
        User user = getUser(authentication);

        // Bước 2: KIỂM TRA QUYỀN SỞ HỮU (Check Permission)
        // Truy vấn bảng 'user_purchased_courses': nếu không tìm thấy bản ghi (userId, courseId) -> CHẶN NGAY
        boolean owned = purchasedCourseRepository.existsByUserIdAndCourseId(user.getId(), courseId);
        if (!owned) {
            // Ném ngoại lệ HTTP 400 Bad Request
            throw new BadRequestException("Bạn chưa sở hữu khóa học này. Vui lòng mua hoặc nhận qua gói hội viên.");
        }

        // Bước 3: Tìm thông tin khóa học trong Database
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        // Bước 4: Kiểm tra xem khóa học đã được admin cấu hình link Drive hay chưa
        if (course.getDriveLink() == null || course.getDriveLink().isBlank()) {
            throw new BadRequestException("Link học tập đang được cập nhật. Vui lòng liên hệ hỗ trợ CSKH.");
        }

        // Bước 5: GIẢI MÃ LINK GOOGLE DRIVE
        // Trong Database, course.getDriveLink() là chuỗi Base64 mã hóa (ví dụ: '8jFk2...m9Q==')
        String decryptedLink;
        try {
            // Gọi EncryptionService giải mã AES-256-GCM bằng Secret Key 256 bits
            decryptedLink = encryptionService.decrypt(course.getDriveLink());
        } catch (Exception e) {
            // Trường hợp dự phòng nếu link trong DB vô tình là link plain text
            decryptedLink = course.getDriveLink();
        }

        // Bước 6: Trả về link Google Drive thật chỉ duy nhất cho học viên đã mua
        return ResponseEntity.ok(ApiResponse.success(
                "Đây là link Google Drive học tập của bạn.",
                Map.of(
                    "driveLink", decryptedLink,
                    "courseTitle", course.getTitle()
                )
        ));
    }

    /**
     * Hàm nội bộ: Tìm User trong DB theo email trích xuất từ JWT
     */
    private User getUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", authentication.getName()));
    }
}
