package com.khoahocgiahoi.controller;

import com.khoahocgiahoi.dto.ApiResponse;
import com.khoahocgiahoi.entity.Feedback;
import com.khoahocgiahoi.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/feedbacks")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackRepository feedbackRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Feedback>>> getFeedbacks() {
        return ResponseEntity.ok(ApiResponse.success(
                feedbackRepository.findByIsActiveTrueOrderByDisplayOrderAsc()));
    }
}
