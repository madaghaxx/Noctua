package com.madagha.backend.post.dto;

import com.madagha.backend.user.dto.UserDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostDto {
    private UUID id;
    private String title;
    private String content;
    private UserDto owner;
    private List<String> mediaUrls;
    private long likeCount;
    private long commentCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
