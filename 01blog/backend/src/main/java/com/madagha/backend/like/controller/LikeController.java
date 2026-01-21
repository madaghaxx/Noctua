package com.madagha.backend.like.controller;

import com.madagha.backend.like.dto.LikeResponse;
import com.madagha.backend.like.service.LikeService;
import com.madagha.backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/posts/{postId}/likes")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;

    @PostMapping
    public ResponseEntity<?> toggleLike(
            @PathVariable UUID postId,
            @AuthenticationPrincipal User user) {
        LikeResponse response = likeService.toggleLike(postId, user);

        Map<String, Object> result = new HashMap<>();
        result.put("liked", response != null);
        result.put("likeCount", likeService.getLikeCount(postId));
        if (response != null) {
            result.put("like", response);
        }

        System.out.println(likeService.getLikeCount(postId));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/status")
    public ResponseEntity<?> getLikeStatus(
            @PathVariable UUID postId,
            @AuthenticationPrincipal User user) {
        Map<String, Object> result = new HashMap<>();
        result.put("liked", likeService.hasUserLikedPost(postId, user));
        result.put("likeCount", likeService.getLikeCount(postId));

        return ResponseEntity.ok(result);
    }
}
