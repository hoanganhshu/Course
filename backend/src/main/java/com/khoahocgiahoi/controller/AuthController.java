package com.khoahocgiahoi.controller;

import com.khoahocgiahoi.dto.ApiResponse;
import com.khoahocgiahoi.dto.auth.*;
import com.khoahocgiahoi.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

// Đánh dấu lớp Controller phục vụ các yêu cầu Xác thực & Tài khoản
@RestController
// Tiền tố URL: /api/v1/auth
@RequestMapping("/auth")
// Lombok tự động sinh constructor cho AuthService
@RequiredArgsConstructor
public class AuthController {

    // Service chứa logic đăng ký, đăng nhập, mã hóa BCrypt và sinh JWT
    private final AuthService authService;

    /**
     * API: POST /api/v1/auth/register
     * Đăng ký tài khoản mới cho học viên
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request // Validate tên, email, mật khẩu tối thiểu 6 ký tự
    ) {
        // Trả về HTTP 201 Created kèm JWT Token để user tự động đăng nhập luôn
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đăng ký thành công", authService.register(request)));
    }

    /**
     * API: POST /api/v1/auth/login
     * Đăng nhập tài khoản bằng Email và Mật khẩu
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request // Body chứa { email, password }
    ) {
        // Trả về HTTP 200 OK kèm chuỗi JWT accessToken, refreshToken và thông tin user
        return ResponseEntity.ok(
                ApiResponse.success("Đăng nhập thành công", authService.login(request)));
    }

    /**
     * API: GET /api/v1/auth/me
     * Lấy thông tin chi tiết của người dùng đang đăng nhập (Profile, số dư, gói hội viên)
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(Authentication authentication) {
        // authentication.getName() lấy email người dùng từ JWT
        return ResponseEntity.ok(
                ApiResponse.success(authService.getProfile(authentication.getName())));
    }

    /**
     * API: PUT /api/v1/auth/drive-email
     * Cập nhật tài khoản Gmail nhận chia sẻ link học tập Google Drive
     */
    @PutMapping("/drive-email")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateDriveEmail(
            Authentication authentication, // User đang đăng nhập
            @Valid @RequestBody com.khoahocgiahoi.dto.wallet.UpdateDriveEmailRequest request // Body chứa { driveEmail }
    ) {
        return ResponseEntity.ok(
                ApiResponse.success("Cập nhật Gmail nhận Google Drive thành công",
                        authService.updateDriveEmail(authentication.getName(), request.getDriveEmail())));
    }
}
