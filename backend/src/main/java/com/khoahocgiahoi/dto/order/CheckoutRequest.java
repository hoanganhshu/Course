package com.khoahocgiahoi.dto.order;

import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;

/** DTO nhận thông tin thanh toán từ frontend (giỏ hàng + thông tin khách) */
@Data
public class CheckoutRequest {

    @NotEmpty(message = "Danh sách khóa học không được rỗng")
    private List<Long> courseIds;

    @NotBlank(message = "Họ tên khách hàng không được để trống")
    @Size(max = 150, message = "Họ tên không vượt quá 150 ký tự")
    private String customerName;

    @NotBlank(message = "Email khách hàng không được để trống")
    @Email(message = "Email không hợp lệ")
    private String customerEmail;

    @Pattern(regexp = "^[0-9]{10,11}$", message = "Số điện thoại phải có 10-11 chữ số")
    private String customerPhone;

    /** Email nhận quyền truy cập Google Drive (bắt buộc @gmail.com) */
    private String driveEmail;

    /** Phương thức thanh toán: BANK_TRANSFER (mặc định) hoặc WALLET */
    private String paymentMethod;

    /** Mã giảm giá (tuỳ chọn) */
    private String couponCode;
}
