package com.madagha.backend.like.dto;

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
public class LikeResponse {
    private UUID id;
    private UUID userId;
    private String username;
    private UUID postId;
    private LocalDateTime createdAt;
}
