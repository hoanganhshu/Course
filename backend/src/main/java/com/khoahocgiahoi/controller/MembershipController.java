package com.khoahocgiahoi.controller;

import com.khoahocgiahoi.dto.ApiResponse;
import com.khoahocgiahoi.entity.*;
import com.khoahocgiahoi.exception.BadRequestException;
import com.khoahocgiahoi.exception.ResourceNotFoundException;
import com.khoahocgiahoi.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/memberships")
@RequiredArgsConstructor
public class MembershipController {

    private final MembershipPlanRepository membershipPlanRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final UserPurchasedCourseRepository purchasedCourseRepository;

    /**
     * GET /memberships
     * Danh sách gói hội viên để hiển thị bảng giá
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<MembershipPlan>>> getPlans() {
        return ResponseEntity.ok(ApiResponse.success(
                membershipPlanRepository.findByIsActiveTrueOrderByDisplayOrderAsc()));
    }

    /**
     * POST /memberships/claim-course/{courseId}
     * Hội viên dùng quota hàng ngày để nhận khóa học
     */
    @PostMapping("/claim-course/{courseId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> claimCourse(
            @PathVariable Long courseId,
            Authentication authentication
    ) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", authentication.getName()));

        // 1. Kiểm tra hội viên còn hạn không
        if (!user.hasMembership()) {
            throw new BadRequestException("Bạn chưa có gói hội viên hoặc gói đã hết hạn. Vui lòng gia hạn tại /hoi-vien");
        }

        // 2. Kiểm tra đã sở hữu chưa
        if (purchasedCourseRepository.existsByUserIdAndCourseId(user.getId(), courseId)) {
            throw new BadRequestException("Bạn đã sở hữu khóa học này rồi.");
        }

        // 3. Lấy khóa học
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        // 4. Kiểm tra khóa có yêu cầu gói Plus+ để claim combo không
        if (Boolean.TRUE.equals(course.getRequireComboMembership())
                && !Boolean.TRUE.equals(user.getMembershipPlan().getAllowCombo())) {
            throw new BadRequestException("Khóa học này thuộc danh mục Combo, cần gói hội viên Plus trở lên.");
        }

        // 5. Kiểm tra & reset quota hàng ngày
        LocalDateTime now = LocalDateTime.now();
        if (user.getLastClaimDate() == null
                || user.getLastClaimDate().toLocalDate().isBefore(now.toLocalDate())) {
            user.setDailyClaimedCount(0);
            user.setLastClaimDate(now);
        }

        // 6. Kiểm tra còn lượt hôm nay không
        MembershipPlan plan = user.getMembershipPlan();
        if (!plan.hasUnlimitedQuota() && user.getDailyClaimedCount() >= plan.getDailyQuota()) {
            throw new BadRequestException(
                String.format("Hôm nay bạn đã nhận đủ %d khóa. Quota sẽ reset lúc 00:00 ngày mai.",
                    plan.getDailyQuota()));
        }

        // 7. Cấp quyền sở hữu
        UserPurchasedCourse upc = UserPurchasedCourse.builder()
                .user(user)
                .course(course)
                .claimType(UserPurchasedCourse.ClaimType.MEMBERSHIP_CLAIM)
                .build();
        purchasedCourseRepository.save(upc);

        // 8. Tăng counter
        user.setDailyClaimedCount(user.getDailyClaimedCount() + 1);
        userRepository.save(user);

        int remaining = plan.hasUnlimitedQuota()
                ? -1
                : plan.getDailyQuota() - user.getDailyClaimedCount();

        return ResponseEntity.ok(ApiResponse.success(
                "Nhận khóa học thành công! Vào 'Khóa học của tôi' để học ngay.",
                Map.of(
                    "courseId", courseId,
                    "courseTitle", course.getTitle(),
                    "remainingTodayQuota", remaining
                )
        ));
    }
}
