package com.khoahocgiahoi.controller;

import com.khoahocgiahoi.service.OrderService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Webhook Controller nhận thông báo thanh toán từ Ngân hàng (SePay / PayOS)
 * Endpoint này phải PUBLIC nhưng xác thực bằng checksum/signature
 */
@Slf4j
@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
public class PaymentWebhookController {

    private final OrderService orderService;
    private final ObjectMapper objectMapper;

    @Value("${payment.sepay.webhook-secret}")
    private String sePayWebhookSecret;

    @Value("${payment.payos.checksum-key}")
    private String payOsChecksumKey;

    /**
     * SePay Webhook
     * Khi khách chuyển khoản, SePay gửi POST đến đây với thông tin giao dịch
     *
     * Body mẫu từ SePay:
     * {
     *   "id": 123,
     *   "content": "KHGH10283",          <-- Nội dung chuyển khoản = orderCode
     *   "amount": 45499,
     *   "transferType": "in",
     *   "referenceCode": "...",
     *   "description": "...",
     *   "bank_sub_acc_id": "..."
     * }
     */
    /**
     * ENDPOINT: POST /api/v1/payment/webhook/sepay
     * Khi khách hàng chuyển tiền ngân hàng thành công, SePay sẽ bắn thông báo HTTP POST vào đây.
     */
    @PostMapping("/webhook/sepay")
    public ResponseEntity<Map<String, Object>> handleSePayWebhook(
            @RequestBody String rawBody,                                                  // Chuỗi JSON nguyên bản từ SePay
            @RequestHeader(value = "X-Sepay-Signature", required = false) String signature // Chữ ký xác thực bảo mật từ SePay
    ) {
        // Ghi log ghi nhận đã nhận được webhook
        log.info("Nhận Webhook từ SePay. Độ dài body: {}", rawBody.length());

        try {
            // Bước 1: Parse chuỗi JSON thành cây đối tượng JsonNode của Jackson
            JsonNode payload = objectMapper.readTree(rawBody);

            // Bước 2: Kiểm tra loại giao dịch - CHỈ xử lý "in" (tiền cộng vào tài khoản ngân hàng của shop)
            String transferType = payload.path("transferType").asText();
            if (!"in".equals(transferType)) {
                // Bỏ qua nếu là giao dịch tiền ra (rút tiền, trả phí...)
                return ResponseEntity.ok(Map.of("success", true, "message", "Bỏ qua vì không phải giao dịch tiền vào"));
            }

            // Bước 3: Lấy nội dung chuyển khoản của người gửi (ví dụ: "KHGH812903" hoặc "NAP123456")
            String content = payload.path("content").asText("").trim().toUpperCase();

            // Bước 4: Dùng Regex trích xuất mã đơn hàng / mã nạp tiền từ nội dung chuyển khoản
            String orderCode = extractOrderCode(content);

            // Nếu không trích xuất được mã hợp lệ trong nội dung
            if (orderCode == null) {
                log.warn("Không tìm thấy mã đơn hàng hoặc mã nạp trong nội dung: {}", content);
                return ResponseEntity.ok(Map.of("success", true, "message", "Không tìm thấy mã hợp lệ trong nội dung"));
            }

            // Bước 5: Lấy Mã giao dịch ngân hàng làm IDEMPOTENCY KEY (Chống ghi nhận tiền trùng lặp)
            String referenceCode = payload.path("referenceCode").asText(null);
            if (referenceCode == null || referenceCode.isBlank()) {
                referenceCode = payload.path("id").asText(null);
            }

            // Bước 6: Gọi OrderService để xử lý kích hoạt đơn hàng hoặc nạp ví tự động trong 3 giây
            orderService.processPaymentWebhook(orderCode, referenceCode, rawBody);

            // Bước 7: Trả về HTTP 200 OK thông báo cho SePay biết server đã nhận và xử lý thành công
            return ResponseEntity.ok(Map.of("success", true));

        } catch (Exception e) {
            // Ghi log lỗi nếu có bất thường
            log.error("Lỗi khi xử lý SePay webhook: {}", e.getMessage(), e);
            return ResponseEntity.ok(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * ENDPOINT DỰ PHÒNG: POST /api/v1/payment/webhook/payos
     * Tương tự SePay, dùng khi doanh nghiệp chuyển sang cổng PayOS
     */
    @PostMapping("/webhook/payos")
    public ResponseEntity<Map<String, Object>> handlePayOsWebhook(
            @RequestBody String rawBody,
            @RequestHeader(value = "X-Payos-Signature", required = false) String signature
    ) {
        log.info("Nhận Webhook từ PayOS");

        try {
            JsonNode payload = objectMapper.readTree(rawBody);
            JsonNode data = payload.path("data");

            // Chỉ xử lý khi trạng thái là PAID (đã thanh toán thành công)
            String status = data.path("status").asText();
            if (!"PAID".equals(status)) {
                return ResponseEntity.ok(Map.of("success", true, "message", "Bỏ qua vì chưa hoàn tất"));
            }

            // Trích xuất mã đơn hàng từ trường description
            String description = data.path("description").asText("").trim().toUpperCase();
            String orderCode = extractOrderCode(description);
            String referenceCode = data.path("reference").asText(null);

            if (orderCode != null) {
                // Kích hoạt đơn hàng qua webhook
                orderService.processPaymentWebhook(orderCode, referenceCode, rawBody);
            }

            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            log.error("Lỗi khi xử lý PayOS webhook: {}", e.getMessage(), e);
            return ResponseEntity.ok(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * Hàm Regex: Tìm mã đơn hàng hợp lệ trong nội dung chuyển khoản của khách
     * Ví dụ:
     * - "NAP812903 nạp tiền" -> "NAP812903"
     * - "DEP-812903 nạp tiền" -> "DEP-812903"
     * - "KHGH812903 mua khoa hoc" -> "KHGH812903"
     */
    private String extractOrderCode(String text) {
        if (text == null || text.isBlank()) return null;

        // 1. Tìm mã nạp ví: DEP-xxxxxx hoặc NAPxxxxxx
        java.util.regex.Pattern depPattern = java.util.regex.Pattern.compile("(DEP-[A-Z0-9]{4,10}|NAP[0-9]{4,12})", java.util.regex.Pattern.CASE_INSENSITIVE);
        java.util.regex.Matcher depMatcher = depPattern.matcher(text);
        if (depMatcher.find()) {
            return depMatcher.group(1).toUpperCase();
        }

        // 2. Tìm mã đơn mua hàng: KHGHxxxxxx
        java.util.regex.Pattern orderPattern = java.util.regex.Pattern.compile("(KHGH[0-9]{4,12})", java.util.regex.Pattern.CASE_INSENSITIVE);
        java.util.regex.Matcher orderMatcher = orderPattern.matcher(text);
        if (orderMatcher.find()) {
            return orderMatcher.group(1).toUpperCase();
        }

        return null;
    }
}
