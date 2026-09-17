package com.khoahocgiahoi.service;

import com.khoahocgiahoi.dto.wallet.DepositRequest;
import com.khoahocgiahoi.dto.wallet.DepositResponse;
import com.khoahocgiahoi.dto.wallet.WalletBalanceResponse;
import com.khoahocgiahoi.entity.User;
import com.khoahocgiahoi.entity.WalletTransaction;
import com.khoahocgiahoi.exception.BadRequestException;
import com.khoahocgiahoi.exception.ResourceNotFoundException;
import com.khoahocgiahoi.repository.UserRepository;
import com.khoahocgiahoi.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalletService {

    private final UserRepository userRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    @Value("${payment.bank.name}")
    private String bankName;

    @Value("${payment.bank.account-number}")
    private String bankAccountNumber;

    @Value("${payment.bank.account-name}")
    private String bankAccountName;

    @Value("${payment.deposit-code-prefix:NAP}")
    private String depositCodePrefix;

    public WalletBalanceResponse getWalletBalance(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        return WalletBalanceResponse.builder()
                .balance(user.getBalance() != null ? user.getBalance() : BigDecimal.ZERO)
                .driveEmail(user.getDriveEmail())
                .hasDriveEmail(user.getDriveEmail() != null && !user.getDriveEmail().isBlank())
                .build();
    }

    @Transactional
    public DepositResponse createDepositRequest(String userEmail, DepositRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        String depositCode = generateUniqueDepositCode();

        WalletTransaction tx = WalletTransaction.builder()
                .transactionCode(depositCode)
                .user(user)
                .amount(request.getAmount())
                .type(WalletTransaction.TransactionType.DEPOSIT)
                .status(WalletTransaction.TransactionStatus.PENDING)
                .description("Nạp tiền vào tài khoản " + user.getEmail())
                .balanceBefore(user.getBalance() != null ? user.getBalance() : BigDecimal.ZERO)
                .build();

        walletTransactionRepository.save(tx);

        String vietQrUrl = String.format(
                "https://img.vietqr.io/image/%s-%s-compact2.png?amount=%s&addInfo=%s&accountName=%s",
                "MB",
                bankAccountNumber,
                request.getAmount().toPlainString(),
                depositCode,
                bankAccountName.replace(" ", "%20")
        );

        return DepositResponse.builder()
                .depositCode(depositCode)
                .amount(request.getAmount())
                .bankName(bankName)
                .bankAccountNumber(bankAccountNumber)
                .bankAccountName(bankAccountName)
                .transferContent(depositCode)
                .vietQrUrl(vietQrUrl)
                .expiredAt(LocalDateTime.now().plusMinutes(30))
                .build();
    }

    @Transactional
    public void processDepositPayment(String depositCode, String referenceCode) {
        log.info("Processing wallet deposit payment for code: {}, ref: {}", depositCode, referenceCode);

        WalletTransaction tx = walletTransactionRepository.findByTransactionCode(depositCode).orElse(null);
        if (tx == null) {
            log.warn("Deposit transaction not found for code: {}", depositCode);
            return;
        }

        if (tx.getStatus() == WalletTransaction.TransactionStatus.COMPLETED) {
            log.info("Deposit {} already completed. Skipping.", depositCode);
            return;
        }

        User user = tx.getUser();
        BigDecimal balanceBefore = user.getBalance() != null ? user.getBalance() : BigDecimal.ZERO;
        BigDecimal balanceAfter = balanceBefore.add(tx.getAmount());

        user.setBalance(balanceAfter);
        userRepository.save(user);

        tx.setStatus(WalletTransaction.TransactionStatus.COMPLETED);
        tx.setReferenceCode(referenceCode);
        tx.setBalanceBefore(balanceBefore);
        tx.setBalanceAfter(balanceAfter);
        walletTransactionRepository.save(tx);

        log.info("Deposit {} completed. User {} balance updated from {} to {}",
                depositCode, user.getEmail(), balanceBefore, balanceAfter);
    }

    @Transactional
    public void deductForPurchase(User user, BigDecimal amount, String orderCode) {
        BigDecimal currentBalance = user.getBalance() != null ? user.getBalance() : BigDecimal.ZERO;
        if (currentBalance.compareTo(amount) < 0) {
            throw new BadRequestException("Số dư ví không đủ (Số dư: " + currentBalance + "đ, Cần thanh toán: " + amount + "đ). Vui lòng nạp thêm tiền.");
        }

        BigDecimal newBalance = currentBalance.subtract(amount);
        user.setBalance(newBalance);
        userRepository.save(user);

        WalletTransaction tx = WalletTransaction.builder()
                .transactionCode("PUR-" + System.currentTimeMillis() + "-" + new Random().nextInt(1000))
                .user(user)
                .amount(amount)
                .type(WalletTransaction.TransactionType.PURCHASE)
                .status(WalletTransaction.TransactionStatus.COMPLETED)
                .referenceCode(orderCode)
                .description("Thanh toán đơn hàng " + orderCode)
                .balanceBefore(currentBalance)
                .balanceAfter(newBalance)
                .build();

        walletTransactionRepository.save(tx);
        log.info("Deducted {} from user {} for order {}. New balance: {}", amount, user.getEmail(), orderCode, newBalance);
    }

    private String generateUniqueDepositCode() {
        String code;
        do {
            int randomNum = 10000 + new Random().nextInt(90000);
            code = depositCodePrefix + randomNum;
        } while (walletTransactionRepository.existsByTransactionCode(code));
        return code;
    }
}
