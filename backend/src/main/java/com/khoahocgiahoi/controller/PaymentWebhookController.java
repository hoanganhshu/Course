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
    @PostMapping("/webhook/sepay")
    public ResponseEntity<Map<String, Object>> handleSePayWebhook(
            @RequestBody String rawBody,
            @RequestHeader(value = "X-Sepay-Signature", required = false) String signature
    ) {
        log.info("Received SePay webhook. Body length: {}", rawBody.length());

        try {
            // TODO: Xác thực signature (HMAC-SHA256 với sePayWebhookSecret)
            // Nếu signature không hợp lệ -> trả 401
            // boolean isValid = validateSePaySignature(rawBody, signature, sePayWebhookSecret);
            // if (!isValid) return ResponseEntity.status(401).body(Map.of("success", false));

            JsonNode payload = objectMapper.readTree(rawBody);

            // Chỉ xử lý giao dịch "in" (tiền vào)
            String transferType = payload.path("transferType").asText();
            if (!"in".equals(transferType)) {
                return ResponseEntity.ok(Map.of("success", true, "message", "Skipped non-incoming transfer"));
            }

            // Lấy orderCode từ nội dung chuyển khoản
            String content = payload.path("content").asText("").trim().toUpperCase();
            String orderCode = extractOrderCode(content);

            if (orderCode == null) {
                log.warn("Cannot extract orderCode from content: {}", content);
                return ResponseEntity.ok(Map.of("success", true, "message", "Order code not found in content"));
            }

            // Lấy Idempotency Key từ SePay: referenceCode hoặc id giao dịch
            String referenceCode = payload.path("referenceCode").asText(null);
            if (referenceCode == null || referenceCode.isBlank()) {
                referenceCode = payload.path("id").asText(null);
            }

            // Xử lý kích hoạt đơn hàng (áp dụng Idempotency Key và RabbitMQ)
            orderService.processPaymentWebhook(orderCode, referenceCode, rawBody);

            return ResponseEntity.ok(Map.of("success", true));

        } catch (Exception e) {
            log.error("Error processing SePay webhook: {}", e.getMessage(), e);
            return ResponseEntity.ok(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * PayOS Webhook (nếu dùng PayOS thay SePay)
     */
    @PostMapping("/webhook/payos")
    public ResponseEntity<Map<String, Object>> handlePayOsWebhook(
            @RequestBody String rawBody,
            @RequestHeader(value = "X-Payos-Signature", required = false) String signature
    ) {
        log.info("Received PayOS webhook");

        try {
            JsonNode payload = objectMapper.readTree(rawBody);
            JsonNode data = payload.path("data");

            String status = data.path("status").asText();
            if (!"PAID".equals(status)) {
                return ResponseEntity.ok(Map.of("success", true));
            }

            // PayOS gửi orderCode trong field "orderCode"
            String orderCode = data.path("orderCode").asText();
            if (orderCode.isBlank()) {
                return ResponseEntity.ok(Map.of("success", true, "message", "No orderCode"));
            }

            String referenceCode = data.path("reference").asText(null);
            orderService.processPaymentWebhook(orderCode, referenceCode, rawBody);
            return ResponseEntity.ok(Map.of("success", true));

        } catch (Exception e) {
            log.error("Error processing PayOS webhook: {}", e.getMessage(), e);
            return ResponseEntity.ok(Map.of("success", false));
        }
    }

    /**
     * Trích xuất orderCode (KHGH + digits) từ nội dung chuyển khoản
     * Ví dụ: "Thanh toan KHGH10283 mua khoa hoc" -> "KHGH10283"
     */
    private String extractOrderCode(String content) {
        if (content == null) return null;
        // Regex tìm KHGH + 5 chữ số
        java.util.regex.Matcher m = java.util.regex.Pattern
                .compile("(KHGH\\d{5,})")
                .matcher(content.toUpperCase());
        return m.find() ? m.group(1) : null;
    }
}
