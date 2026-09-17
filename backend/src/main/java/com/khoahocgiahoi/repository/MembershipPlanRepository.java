package com.khoahocgiahoi.repository;
import com.khoahocgiahoi.entity.MembershipPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface MembershipPlanRepository extends JpaRepository<MembershipPlan, Long> {
    List<MembershipPlan> findByIsActiveTrueOrderByDisplayOrderAsc();
}
