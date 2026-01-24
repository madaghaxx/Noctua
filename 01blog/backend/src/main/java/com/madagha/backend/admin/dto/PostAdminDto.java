package com.madagha.backend.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostAdminDto {
    private UUID id;
    private String title;
    private String content;
    private String excerpt;
    private UserSummaryDto owner;
    private List<String> mediaUrls;
    private Long likeCount;
    private Long commentCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean reported;
    private int reportCount;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserSummaryDto {
        private UUID id;
        private String username;
        private String avatar;
    }
}