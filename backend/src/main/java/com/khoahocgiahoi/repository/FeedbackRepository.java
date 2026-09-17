package com.khoahocgiahoi.repository;
import com.khoahocgiahoi.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByIsActiveTrueOrderByDisplayOrderAsc();
}
