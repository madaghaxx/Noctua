package com.madagha.backend.report.controller;

import com.madagha.backend.common.response.ApiResponse;
import com.madagha.backend.report.dto.CreateReportRequest;
import com.madagha.backend.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createReport(
            @Valid @RequestBody CreateReportRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        reportService.createReport(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.<Void>success("Report submitted successfully", null));
    }

    @GetMapping("/my-reports")
    public ResponseEntity<ApiResponse<Object>> getMyReports(
            @AuthenticationPrincipal UserDetails userDetails) {
        // This could return user's submitted reports if needed
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}