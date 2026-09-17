package com.khoahocgiahoi.repository;

import com.khoahocgiahoi.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderCode(String orderCode);
    boolean existsByOrderCode(String orderCode);
}
