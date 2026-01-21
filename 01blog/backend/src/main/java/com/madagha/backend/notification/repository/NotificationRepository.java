package com.madagha.backend.notification.repository;

import com.madagha.backend.notification.entity.Notification;
import com.madagha.backend.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    Page<Notification> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    long countByUserAndIsReadFalse(User user);
}
