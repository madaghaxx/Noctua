package com.madagha.backend.comment.service;

import com.madagha.backend.comment.dto.CommentRequest;
import com.madagha.backend.comment.dto.CommentResponse;
import com.madagha.backend.comment.entity.Comment;
import com.madagha.backend.comment.repository.CommentRepository;
import com.madagha.backend.notification.entity.Notification;
import com.madagha.backend.notification.service.NotificationService;
import com.madagha.backend.post.entity.Post;
import com.madagha.backend.post.repository.PostRepository;
import com.madagha.backend.user.entity.User;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final NotificationService notificationService;

    @Transactional
    public CommentResponse createComment(UUID postId, CommentRequest request, User user) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Comment comment = Comment.builder()
                .content(request.getContent())
                .user(user)
                .post(post)
                .build();

        comment = commentRepository.save(comment);

        // Create notification for post owner (if not self-comment)
        if (!post.getOwner().getId().equals(user.getId())) {
            notificationService.createNotification(
                    post.getOwner(),
                    Notification.NotificationType.COMMENT,
                    user.getUsername() + " commented on your post: " + post.getTitle(),
                    postId);
        }

        return mapToResponse(comment);
    }

    public Page<CommentResponse> getCommentsByPost(UUID postId, Pageable pageable) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        return commentRepository.findByPostOrderByCreatedAtDesc(post, pageable)
                .map(this::mapToResponse);
    }

    public Page<CommentResponse> getCommentsByUser(UUID userId, Pageable pageable) {
        return commentRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapToResponse);
    }

    public long getCommentCount(UUID postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        return commentRepository.countByPost(post);
    }

    @Transactional
    public CommentResponse updateComment(UUID commentId, CommentRequest request, User user) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to update this comment");
        }

        comment.setContent(request.getContent());
        comment = commentRepository.save(comment);

        return mapToResponse(comment);
    }

    @Transactional
    public void deleteComment(UUID commentId, User user) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this comment");
        }

        commentRepository.delete(comment);
    }

    private CommentResponse mapToResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .userId(comment.getUser().getId())
                .username(comment.getUser().getUsername())
                .userAvatar(comment.getUser().getAvatar())
                .postId(comment.getPost().getId())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}
