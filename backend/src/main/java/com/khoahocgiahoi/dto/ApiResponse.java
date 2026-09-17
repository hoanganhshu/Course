package com.khoahocgiahoi.dto;

import lombok.*;

/**
 * Generic wrapper cho mọi API response của hệ thống.
 * Format thống nhất: { success, message, data }
 *
 * @param <T> Kiểu dữ liệu của trường data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;

    /** Trả về response thành công với data (message mặc định "Success") */
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, "Success", data);
    }

    /** Trả về response thành công với message tuỳ chỉnh và data */
    public static <T> ApiResponse<T> success(String msg, T data) {
        return new ApiResponse<>(true, msg, data);
    }

    /** Trả về response lỗi với message mô tả lỗi, data = null */
    public static <T> ApiResponse<T> error(String msg) {
        return new ApiResponse<>(false, msg, null);
    }
}
