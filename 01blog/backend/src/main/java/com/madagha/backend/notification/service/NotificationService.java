package com.madagha.backend.notification.service;

import com.madagha.backend.notification.dto.NotificationResponse;
import com.madagha.backend.notification.entity.Notification;
import com.madagha.backend.notification.repository.NotificationRepository;
import com.madagha.backend.user.entity.User;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public void createNotification(User user, Notification.NotificationType type, String message, UUID referenceId) {
        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .message(message)
                .referenceId(referenceId)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
    }

    public Page<NotificationResponse> getUserNotifications(User user, Pageable pageable) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user, pageable)
                .map(this::mapToResponse);
    }

    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    @Transactional
    public void markAsRead(UUID notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(User user) {
        Page<Notification> notifications = notificationRepository
                .findByUserOrderByCreatedAtDesc(user, Pageable.unpaged());

        notifications.forEach(notification -> notification.setIsRead(true));
        notificationRepository.saveAll(notifications);
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .message(notification.getMessage())
                .referenceId(notification.getReferenceId())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
