package com.khoahocgiahoi.controller;

import com.khoahocgiahoi.dto.ApiResponse;
import com.khoahocgiahoi.dto.wallet.DepositRequest;
import com.khoahocgiahoi.dto.wallet.DepositResponse;
import com.khoahocgiahoi.dto.wallet.WalletBalanceResponse;
import com.khoahocgiahoi.service.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

// Đánh dấu lớp Controller phục vụ các API liên quan đến Ví số dư học viên
@RestController
// Tiền tố URL: /api/v1/wallet
@RequestMapping("/wallet")
// Tự động tiêm các dependencies dạng final
@RequiredArgsConstructor
public class WalletController {

    // Service xử lý nghiệp vụ số dư, nạp tiền và trừ tiền mua khóa học
    private final WalletService walletService;

    /**
     * API: GET /api/v1/wallet/balance
     * Lấy số dư ví hiện tại của người dùng đang đăng nhập
     */
    @GetMapping("/balance")
    public ResponseEntity<ApiResponse<WalletBalanceResponse>> getBalance(Authentication authentication) {
        // authentication.getName() trả về email người dùng từ JWT
        return ResponseEntity.ok(ApiResponse.success(walletService.getWalletBalance(authentication.getName())));
    }

    /**
     * API: POST /api/v1/wallet/deposit
     * Tạo yêu cầu nạp tiền vào ví (Sinh mã nạp duy nhất, nội dung và mã QR chuyển khoản VietQR)
     */
    @PostMapping("/deposit")
    public ResponseEntity<ApiResponse<DepositResponse>> createDeposit(
            Authentication authentication,            // User đang đăng nhập
            @Valid @RequestBody DepositRequest request // Body chứa số tiền nạp (ví dụ: 100000)
    ) {
        return ResponseEntity.ok(
                ApiResponse.success("Tạo yêu cầu nạp tiền thành công",
                        walletService.createDepositRequest(authentication.getName(), request)));
    }

    /**
     * API: POST /api/v1/wallet/admin/approve/{depositCode}
     * Dành riêng cho Quản trị viên: Duyệt nạp tiền và cộng số dư ví thủ công cho user
     */
    @PostMapping("/admin/approve/{depositCode}")
    public ResponseEntity<ApiResponse<Void>> approveDeposit(
            @PathVariable String depositCode // Mã nạp tiền (ví dụ: DEP-18923)
    ) {
        // Gọi WalletService để cộng tiền vào tài khoản và cập nhật trạng thái giao dịch thành COMPLETED
        walletService.approveDepositPayment(depositCode);
        return ResponseEntity.ok(ApiResponse.success("Xác nhận nạp tiền và cộng số dư thành công", null));
    }
}
