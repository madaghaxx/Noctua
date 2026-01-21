package com.madagha.backend.notification.controller;

import com.madagha.backend.notification.dto.NotificationResponse;
import com.madagha.backend.notification.service.NotificationService;
import com.madagha.backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<Page<NotificationResponse>> getNotifications(
            @AuthenticationPrincipal User user,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<NotificationResponse> notifications = notificationService.getUserNotifications(user, pageable);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(@AuthenticationPrincipal User user) {
        Map<String, Long> result = new HashMap<>();
        result.put("unreadCount", notificationService.getUnreadCount(user));
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable UUID notificationId,
            @AuthenticationPrincipal User user) {
        notificationService.markAsRead(notificationId, user);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal User user) {
        notificationService.markAllAsRead(user);
        return ResponseEntity.noContent().build();
    }
}
