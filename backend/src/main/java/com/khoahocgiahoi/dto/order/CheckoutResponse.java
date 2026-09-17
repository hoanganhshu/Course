package com.khoahocgiahoi.dto.order;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/** DTO trả về sau khi tạo đơn hàng thành công, chứa thông tin QR chuyển khoản */
@Data
@Builder
public class CheckoutResponse {

    private Long   orderId;
    private String orderCode;

    private BigDecimal totalAmount;
    private BigDecimal discountAmount;

    // ---- Thông tin ngân hàng để hiển thị UI ----
    private String bankName;
    private String bankAccountNumber;
    private String bankAccountName;

    /** Nội dung chuyển khoản (= orderCode) */
    private String transferContent;

    /** URL ảnh QR VietQR sẵn sàng nhúng vào <img> */
    private String vietQrUrl;

    private String status;

    private LocalDateTime paidAt;
    private Boolean driveShared;

    /** Thời điểm đơn hàng hết hạn (mặc định +30 phút) */
    private LocalDateTime expiredAt;
}
