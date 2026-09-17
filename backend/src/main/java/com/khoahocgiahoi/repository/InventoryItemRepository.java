package com.khoahocgiahoi.repository;

import com.khoahocgiahoi.entity.InventoryItem;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {

    /**
     * Khóa bi quan Pessimistic Locking (SELECT ... FOR UPDATE)
     * Đảm bảo khi hàng ngàn khách mua cùng 1 thời điểm, chỉ 1 transaction giành được lock
     * trên bản ghi kho hàng này, tuyệt đối không bao giờ xuất trùng 1 tài khoản cho 2 khách hàng!
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM InventoryItem i WHERE i.course.id = :courseId AND i.isDelivered = false ORDER BY i.id ASC LIMIT 1")
    Optional<InventoryItem> findAvailableItemForUpdate(@Param("courseId") Long courseId);

    long countByCourseIdAndIsDeliveredFalse(Long courseId);
}
