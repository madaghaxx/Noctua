package com.madagha.backend.subscription.controller;

import com.madagha.backend.subscription.dto.SubscriptionResponse;
import com.madagha.backend.subscription.service.SubscriptionService;
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
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @PostMapping("/{userId}")
    public ResponseEntity<?> toggleSubscription(
            @PathVariable UUID userId,
            @AuthenticationPrincipal User user) {
        SubscriptionResponse response = subscriptionService.toggleSubscription(userId, user);

        Map<String, Object> result = new HashMap<>();
        result.put("subscribed", response != null);
        result.put("subscriberCount", subscriptionService.getSubscriberCount(userId));
        if (response != null) {
            result.put("subscription", response);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{userId}/status")
    public ResponseEntity<?> getSubscriptionStatus(
            @PathVariable UUID userId,
            @AuthenticationPrincipal User user) {
        Map<String, Object> result = new HashMap<>();
        result.put("subscribed", subscriptionService.isSubscribed(userId, user));
        result.put("subscriberCount", subscriptionService.getSubscriberCount(userId));
        result.put("subscriptionCount", subscriptionService.getSubscriptionCount(userId));

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{userId}/subscriptions")
    public ResponseEntity<Page<SubscriptionResponse>> getUserSubscriptions(
            @PathVariable UUID userId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<SubscriptionResponse> subscriptions = subscriptionService.getSubscriptions(userId, pageable);
        return ResponseEntity.ok(subscriptions);
    }

    @GetMapping("/{userId}/subscribers")
    public ResponseEntity<Page<SubscriptionResponse>> getUserSubscribers(
            @PathVariable UUID userId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<SubscriptionResponse> subscribers = subscriptionService.getSubscribers(userId, pageable);
        return ResponseEntity.ok(subscribers);
    }
}
