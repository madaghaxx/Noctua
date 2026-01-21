package com.madagha.backend.comment.dto;

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
public class CommentResponse {
    private UUID id;
    private String content;
    private UUID userId;
    private String username;
    private String userAvatar;
    private UUID postId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
