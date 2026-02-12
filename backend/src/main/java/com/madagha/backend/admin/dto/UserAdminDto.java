package com.madagha.backend.admin.dto;

import com.madagha.backend.user.entity.Role;
import com.madagha.backend.user.entity.UserStatus;
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
public class UserAdminDto {
    private UUID id;
    private String username;
    private String email;
    private String avatar;
    private Role role;
    private UserStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long postCount;
    private Long likeCount;
    private Long commentCount;
}