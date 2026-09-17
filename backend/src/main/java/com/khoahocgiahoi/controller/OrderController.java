package com.khoahocgiahoi.controller;

import com.khoahocgiahoi.dto.ApiResponse;
import com.khoahocgiahoi.dto.order.*;
import com.khoahocgiahoi.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /**
     * POST /orders/checkout
     * Tạo đơn hàng, sinh mã VietQR
     */
    @PostMapping("/orders/checkout")
    public ResponseEntity<ApiResponse<CheckoutResponse>> checkout(
            @Valid @RequestBody CheckoutRequest request,
            Authentication authentication
    ) {
        String userEmail = authentication != null ? authentication.getName() : null;
        CheckoutResponse response = orderService.checkout(request, userEmail);
        return ResponseEntity.ok(ApiResponse.success("Tạo đơn hàng thành công", response));
    }

    /**
     * GET /orders/check-status/{orderCode}
     * Frontend polling để kiểm tra thanh toán (mỗi 3-5 giây)
     */
    @GetMapping("/orders/check-status/{orderCode}")
    public ResponseEntity<ApiResponse<OrderStatusResponse>> checkStatus(
            @PathVariable String orderCode
    ) {
        OrderStatusResponse status = orderService.checkOrderStatus(orderCode);
        return ResponseEntity.ok(ApiResponse.success(status));
    }
}
