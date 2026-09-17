package com.khoahocgiahoi.dto.wallet;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UpdateDriveEmailRequest {
    @NotBlank(message = "Địa chỉ Gmail không được để trống")
    @Email(message = "Định dạng email không hợp lệ")
    @Pattern(regexp = "^[A-Za-z0-9._%+-]+@(?:gmail\\.com|[A-Za-z0-9.-]+\\.[A-Za-z]{2,})$", 
             message = "Vui lòng nhập tài khoản Gmail hợp lệ (@gmail.com) để được cấp quyền Google Drive")
    private String driveEmail;
}
