package com.madagha.backend.subscription.service;

import com.madagha.backend.common.exception.BadRequestException;
import com.madagha.backend.common.exception.ResourceNotFoundException;
import com.madagha.backend.notification.entity.Notification;
import com.madagha.backend.notification.service.NotificationService;
import com.madagha.backend.subscription.dto.SubscriptionResponse;
import com.madagha.backend.subscription.entity.Subscription;
import com.madagha.backend.subscription.repository.SubscriptionRepository;
import com.madagha.backend.user.entity.User;
import com.madagha.backend.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

        private final SubscriptionRepository subscriptionRepository;
        private final UserRepository userRepository;
        private final NotificationService notificationService;

        @Transactional
        public SubscriptionResponse toggleSubscription(UUID targetUserId, User subscriber) {
                if (subscriber.getId().equals(targetUserId)) {
                        throw new BadRequestException("Cannot subscribe to yourself");
                }

                User targetUser = userRepository.findById(targetUserId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                var existingSubscription = subscriptionRepository
                                .findBySubscriberAndSubscribedTo(subscriber, targetUser);

                if (existingSubscription.isPresent()) {
                        subscriptionRepository.delete(existingSubscription.get());
                        // Return response indicating the user is no longer subscribed
                        return SubscriptionResponse.builder()
                                        .subscriberId(subscriber.getId())
                                        .subscriberUsername(subscriber.getUsername())
                                        .subscribedToId(targetUserId)
                                        .subscribedToUsername(targetUser.getUsername())
                                        .subscribedToAvatar(targetUser.getAvatar())
                                        .subscribed(false)
                                        .build();
                } else {
                        Subscription subscription = Subscription.builder()
                                        .subscriber(subscriber)
                                        .subscribedTo(targetUser)
                                        .build();

                        subscription = subscriptionRepository.save(subscription);

                        // Create notification for the subscribed user
                        notificationService.createNotification(
                                        targetUser,
                                        Notification.NotificationType.SUBSCRIPTION,
                                        subscriber.getUsername() + " subscribed to you",
                                        subscriber.getId());

                        return mapToResponse(subscription);
                }
        }

        public boolean isSubscribed(UUID targetUserId, User subscriber) {
                User targetUser = userRepository.findById(targetUserId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                return subscriptionRepository.existsBySubscriberAndSubscribedTo(subscriber, targetUser);
        }

        public Page<SubscriptionResponse> getSubscriptions(UUID userId, Pageable pageable) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                return subscriptionRepository.findBySubscriber(user, pageable)
                                .map(this::mapToResponse);
        }

        public Page<SubscriptionResponse> getSubscribers(UUID userId, Pageable pageable) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                return subscriptionRepository.findBySubscribedTo(user, pageable)
                                .map(this::mapToResponse);
        }

        public long getSubscriberCount(UUID userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                return subscriptionRepository.countBySubscribedTo(user);
        }

        public long getSubscriptionCount(UUID userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                return subscriptionRepository.countBySubscriber(user);
        }

        private SubscriptionResponse mapToResponse(Subscription subscription) {
                return SubscriptionResponse.builder()
                                .id(subscription.getId())
                                .subscriberId(subscription.getSubscriber().getId())
                                .subscriberUsername(subscription.getSubscriber().getUsername())
                                .subscribedToId(subscription.getSubscribedTo().getId())
                                .subscribedToUsername(subscription.getSubscribedTo().getUsername())
                                .subscribedToAvatar(subscription.getSubscribedTo().getAvatar())
                                .createdAt(subscription.getCreatedAt())
                                .subscribed(true)
                                .build();
        }
}
