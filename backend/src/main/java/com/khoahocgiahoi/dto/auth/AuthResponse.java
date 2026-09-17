package com.khoahocgiahoi.dto.auth;

import lombok.*;

/** DTO trả về sau khi đăng nhập / đăng ký thành công, chứa JWT tokens và thông tin cơ bản */
@Data
@Builder
public class AuthResponse {

    /** JWT access token (ngắn hạn, dùng cho mọi API call) */
    private String accessToken;

    /** JWT refresh token (dài hạn, dùng để gia hạn access token) */
    private String refreshToken;

    /** Loại token, luôn là "Bearer" */
    private String tokenType;

    private Long   userId;
    private String name;
    private String email;
    private String role;
}
