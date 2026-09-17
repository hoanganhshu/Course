package com.khoahocgiahoi.scheduler;

import com.khoahocgiahoi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class MembershipScheduler {

    private final UserRepository userRepository;

    /**
     * Chạy lúc 00:00 mỗi ngày:
     * 1. Reset dailyClaimedCount = 0 cho tất cả hội viên còn hạn
     * 2. Expire membership đã hết hạn
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void resetDailyQuota() {
        log.info("[Scheduler] Bắt đầu reset quota hàng ngày...");

        LocalDateTime now = LocalDateTime.now();

        // Reset quota cho user còn hạn membership
        userRepository.findAll().forEach(user -> {
            if (user.getMembershipPlan() != null) {
                if (user.getMembershipExpiresAt() != null
                        && user.getMembershipExpiresAt().isBefore(now)) {
                    // Membership hết hạn -> clear
                    user.setMembershipPlan(null);
                    user.setMembershipExpiresAt(null);
                    user.setDailyClaimedCount(0);
                    log.debug("Expired membership for user: {}", user.getEmail());
                } else {
                    // Reset quota
                    user.setDailyClaimedCount(0);
                }
                userRepository.save(user);
            }
        });

        log.info("[Scheduler] Reset quota hoàn tất lúc {}", now);
    }
}
