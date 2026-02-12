package com.madagha.backend.like.service;

import com.madagha.backend.common.exception.ResourceNotFoundException;
import com.madagha.backend.like.dto.LikeResponse;
import com.madagha.backend.like.entity.Like;
import com.madagha.backend.like.repository.LikeRepository;
import com.madagha.backend.notification.entity.Notification;
import com.madagha.backend.notification.service.NotificationService;
import com.madagha.backend.post.entity.Post;
import com.madagha.backend.post.repository.PostRepository;
import com.madagha.backend.user.entity.User;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;
    private final PostRepository postRepository;
    private final NotificationService notificationService;

    @Transactional
    public LikeResponse toggleLike(UUID postId, User user) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        var existingLike = likeRepository.findByUserAndPost(user, post);

        if (existingLike.isPresent()) {
            likeRepository.delete(existingLike.get());
            if (!post.getOwner().getId().equals(user.getId())) {
                notificationService.deleteLatestNotification(
                        post.getOwner(),
                        Notification.NotificationType.LIKE,
                        postId);
            }
            // Return response indicating the post is no longer liked
            return LikeResponse.builder()
                    .userId(user.getId())
                    .username(user.getUsername())
                    .postId(postId)
                    .liked(false)
                    .build();
        } else {
            Like like = Like.builder()
                    .user(user)
                    .post(post)
                    .build();

            like = likeRepository.save(like);

            if (!post.getOwner().getId().equals(user.getId())) {
                notificationService.createNotification(
                        post.getOwner(),
                        Notification.NotificationType.LIKE,
                        user.getUsername() + " liked your post: " + post.getTitle(),
                        postId);
            }

            return mapToResponse(like);
        }
    }

    public boolean hasUserLikedPost(UUID postId, User user) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        return likeRepository.existsByUserAndPost(user, post);
    }

    public long getLikeCount(UUID postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        return likeRepository.countByPost(post);
    }

    private LikeResponse mapToResponse(Like like) {
        return LikeResponse.builder()
                .id(like.getId())
                .userId(like.getUser().getId())
                .username(like.getUser().getUsername())
                .postId(like.getPost().getId())
                .createdAt(like.getCreatedAt())
                .build();
    }
}
