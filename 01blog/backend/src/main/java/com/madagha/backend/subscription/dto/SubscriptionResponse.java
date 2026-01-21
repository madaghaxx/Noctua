package com.madagha.backend.subscription.dto;

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
public class SubscriptionResponse {
    private UUID id;
    private UUID subscriberId;
    private String subscriberUsername;
    private UUID subscribedToId;
    private String subscribedToUsername;
    private String subscribedToAvatar;
    private LocalDateTime createdAt;
}
