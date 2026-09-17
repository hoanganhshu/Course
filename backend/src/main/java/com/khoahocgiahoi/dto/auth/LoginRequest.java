package com.khoahocgiahoi.dto.auth;

import jakarta.validation.constraints.*;
import lombok.*;

/** DTO nhận email + password khi đăng nhập */
@Data
public class LoginRequest {

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;
}
