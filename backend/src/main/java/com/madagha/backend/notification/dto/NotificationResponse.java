package com.madagha.backend.notification.dto;

import com.madagha.backend.notification.entity.Notification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {
    private UUID id;
    private Notification.NotificationType type;
    private String message;
    private UUID referenceId;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
