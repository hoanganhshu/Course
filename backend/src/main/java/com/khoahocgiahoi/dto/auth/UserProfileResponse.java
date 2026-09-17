package com.khoahocgiahoi.dto.auth;

import lombok.*;
import java.time.LocalDateTime;

/** DTO thông tin hồ sơ người dùng (GET /auth/me) */
@Data
@Builder
public class UserProfileResponse {

    private Long   id;
    private String name;
    private String email;
    private String phone;
    private String role;

    // ---- Membership ----
    /** true nếu membership còn hiệu lực */
    private boolean hasMembership;
    private String  membershipName;
    private LocalDateTime membershipExpiresAt;

    /** Số khóa đã nhận hôm nay */
    private int dailyClaimedCount;

    /** Quota tối đa mỗi ngày theo gói */
    private int dailyQuota;

    private LocalDateTime createdAt;
}
