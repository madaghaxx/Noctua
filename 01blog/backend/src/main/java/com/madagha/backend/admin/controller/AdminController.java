package com.madagha.backend.admin.controller;

import com.madagha.backend.admin.dto.PostAdminDto;
import com.madagha.backend.admin.dto.UserAdminDto;
import com.madagha.backend.admin.service.AdminService;
import com.madagha.backend.common.response.ApiResponse;
import com.madagha.backend.report.dto.ReportDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    // User Management Endpoints
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<UserAdminDto>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<UserAdminDto> users = adminService.getAllUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PostMapping("/users/{userId}/ban")
    public ResponseEntity<ApiResponse<Void>> banUser(@PathVariable UUID userId) {
        adminService.banUser(userId);
        return ResponseEntity.ok(ApiResponse.<Void>success("User banned successfully", null));
    }

    @PostMapping("/users/{userId}/unban")
    public ResponseEntity<ApiResponse<Void>> unbanUser(@PathVariable UUID userId) {
        adminService.unbanUser(userId);
        return ResponseEntity.ok(ApiResponse.<Void>success("User unbanned successfully", null));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable UUID userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.<Void>success("User deleted successfully", null));
    }

    // Post Moderation Endpoints
    @GetMapping("/posts")
    public ResponseEntity<ApiResponse<Page<PostAdminDto>>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PostAdminDto> posts = adminService.getAllPosts(pageable);
        return ResponseEntity.ok(ApiResponse.success(posts));
    }

    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable UUID postId) {
        adminService.deletePost(postId);
        return ResponseEntity.ok(ApiResponse.<Void>success("Post deleted successfully", null));
    }

    // Report Management Endpoints
    @GetMapping("/reports/pending")
    public ResponseEntity<ApiResponse<List<ReportDto>>> getPendingReports() {
        List<ReportDto> reports = adminService.getPendingReports();
        return ResponseEntity.ok(ApiResponse.success(reports));
    }

    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<List<ReportDto>>> getAllReports() {
        List<ReportDto> reports = adminService.getAllReports();
        return ResponseEntity.ok(ApiResponse.success(reports));
    }

    @PostMapping("/reports/{reportId}/resolve")
    public ResponseEntity<ApiResponse<Void>> resolveReport(
            @PathVariable UUID reportId,
            @RequestBody Map<String, String> request) {
        String adminNote = request.get("adminNote");
        adminService.resolveReport(reportId, adminNote);
        return ResponseEntity.ok(ApiResponse.<Void>success("Report resolved successfully", null));
    }

    @PostMapping("/reports/{reportId}/dismiss")
    public ResponseEntity<ApiResponse<Void>> dismissReport(
            @PathVariable UUID reportId,
            @RequestBody Map<String, String> request) {
        String adminNote = request.get("adminNote");
        adminService.dismissReport(reportId, adminNote);
        return ResponseEntity.ok(ApiResponse.<Void>success("Report dismissed successfully", null));
    }

    // Analytics Endpoints
    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalytics() {
        Map<String, Object> analytics = Map.of(
                "totalUsers", adminService.getTotalUsers(),
                "totalPosts", adminService.getTotalPosts(),
                "totalReports", adminService.getTotalReports(),
                "pendingReports", adminService.getPendingReportsCount());
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }
}