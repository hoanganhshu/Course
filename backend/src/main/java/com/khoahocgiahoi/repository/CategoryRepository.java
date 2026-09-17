package com.khoahocgiahoi.repository;

import com.khoahocgiahoi.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    @Query("SELECT c FROM Category c LEFT JOIN FETCH c.children ch " +
           "WHERE c.parent IS NULL AND c.isActive = true " +
           "ORDER BY c.displayOrder ASC")
    List<Category> findRootCategoriesWithChildren();
}
