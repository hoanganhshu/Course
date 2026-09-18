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

@RestController
@RequestMapping("/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @GetMapping("/balance")
    public ResponseEntity<ApiResponse<WalletBalanceResponse>> getBalance(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(walletService.getWalletBalance(authentication.getName())));
    }

    @PostMapping("/deposit")
    public ResponseEntity<ApiResponse<DepositResponse>> createDeposit(
            Authentication authentication,
            @Valid @RequestBody DepositRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success("Tạo yêu cầu nạp tiền thành công",
                        walletService.createDepositRequest(authentication.getName(), request)));
    }

    @PostMapping("/admin/approve/{depositCode}")
    public ResponseEntity<ApiResponse<Void>> approveDeposit(
            @PathVariable String depositCode
    ) {
        walletService.approveDepositPayment(depositCode);
        return ResponseEntity.ok(ApiResponse.success("Xác nhận nạp tiền và cộng số dư thành công", null));
    }
}
