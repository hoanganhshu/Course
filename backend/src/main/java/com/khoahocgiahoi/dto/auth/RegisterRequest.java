package com.khoahocgiahoi.dto.auth;

import jakarta.validation.constraints.*;
import lombok.*;

/** DTO nhận dữ liệu đăng ký tài khoản mới */
@Data
public class RegisterRequest {

    @NotBlank(message = "Tên không được để trống")
    @Size(min = 2, max = 150, message = "Tên phải từ 2 đến 150 ký tự")
    private String name;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, max = 100, message = "Mật khẩu phải từ 6 đến 100 ký tự")
    private String password;

    @Pattern(regexp = "^[0-9]{10,11}$", message = "Số điện thoại phải có 10-11 chữ số")
    private String phone;
}
