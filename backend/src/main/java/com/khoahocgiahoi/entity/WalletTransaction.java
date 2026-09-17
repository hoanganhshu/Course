package com.khoahocgiahoi.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "wallet_transactions",
    indexes = {
        @Index(name = "idx_wallet_tx_user", columnList = "user_id"),
        @Index(name = "idx_wallet_tx_code", columnList = "transaction_code", unique = true)
    }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WalletTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_code", nullable = false, unique = true, length = 50)
    private String transactionCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, precision = 14, scale = 0)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransactionType type;

    @Column(name = "balance_before", precision = 14, scale = 0)
    private BigDecimal balanceBefore;

    @Column(name = "balance_after", precision = 14, scale = 0)
    private BigDecimal balanceAfter;

    @Column(name = "reference_code", length = 100)
    private String referenceCode;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private TransactionStatus status = TransactionStatus.PENDING;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum TransactionType {
        DEPOSIT,      // Nạp tiền vào ví
        PURCHASE,     // Trừ tiền mua khóa học
        REFUND        // Hoàn tiền
    }

    public enum TransactionStatus {
        PENDING,
        COMPLETED,
        FAILED
    }
}
