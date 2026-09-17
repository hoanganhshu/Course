package com.khoahocgiahoi.dto.wallet;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class DepositResponse {
    private String depositCode;
    private BigDecimal amount;
    private String bankName;
    private String bankAccountNumber;
    private String bankAccountName;
    private String transferContent;
    private String vietQrUrl;
    private LocalDateTime expiredAt;
}
