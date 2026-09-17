package com.khoahocgiahoi.dto.category;

import lombok.*;
import java.util.List;

@Data @Builder
public class CategoryTreeResponse {
    private Long id;
    private String name;
    private String slug;
    private String icon;
    private int displayOrder;
    private long courseCount;
    private List<CategoryTreeResponse> children;
}
