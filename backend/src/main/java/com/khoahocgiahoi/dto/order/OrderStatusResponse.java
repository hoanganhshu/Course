package com.khoahocgiahoi.dto.order;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO trả về trạng thái đơn hàng khi frontend polling.
 * driveLinks chỉ được populate khi status = PAID.
 */
@Data
@Builder
public class OrderStatusResponse {

    private String orderCode;
    private String status;

    /** Thời điểm thanh toán thành công (null nếu chưa thanh toán) */
    private LocalDateTime paidAt;

    /**
     * Danh sách link Google Drive của các khóa đã mua.
     * Chỉ có dữ liệu sau khi thanh toán thành công.
     * ⚠️ driveLink chỉ expose tại đây cho chủ đơn hàng, không qua bất kỳ course API nào.
     */
    private List<String> driveLinks;
}
