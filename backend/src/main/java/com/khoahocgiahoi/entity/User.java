package com.khoahocgiahoi.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users",
    indexes = {
        @Index(name = "idx_users_email", columnList = "email", unique = true)
    }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(length = 20)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    // ---- Membership ----
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membership_plan_id")
    private MembershipPlan membershipPlan;

    @Column(name = "membership_expires_at")
    private LocalDateTime membershipExpiresAt;

    @Column(name = "daily_claimed_count", nullable = false)
    @Builder.Default
    private Integer dailyClaimedCount = 0;

    @Column(name = "last_claim_date")
    private LocalDateTime lastClaimDate;

    // ---- Metadata ----
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ---- Relationships ----
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<UserPurchasedCourse> purchasedCourses = new HashSet<>();

    // ---- Business Logic ----
    public boolean hasMembership() {
        return membershipExpiresAt != null && membershipExpiresAt.isAfter(LocalDateTime.now());
    }

    public boolean canClaimCourseToday() {
        if (!hasMembership()) return false;
        if (lastClaimDate == null || lastClaimDate.toLocalDate().isBefore(LocalDateTime.now().toLocalDate())) {
            return true; // Chưa claim hôm nay -> được phép
        }
        return dailyClaimedCount < membershipPlan.getDailyQuota();
    }

    public enum Role {
        ROLE_USER,
        ROLE_ADMIN
    }
}
