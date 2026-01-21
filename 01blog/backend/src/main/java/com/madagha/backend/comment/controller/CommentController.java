package com.madagha.backend.comment.controller;

import com.madagha.backend.comment.dto.CommentRequest;
import com.madagha.backend.comment.dto.CommentResponse;
import com.madagha.backend.comment.service.CommentService;
import com.madagha.backend.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<CommentResponse> createComment(
            @PathVariable UUID postId,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal User user) {
        CommentResponse response = commentService.createComment(postId, request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<CommentResponse>> getComments(
            @PathVariable UUID postId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<CommentResponse> comments = commentService.getCommentsByPost(postId, pageable);
        return ResponseEntity.ok(comments);
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable UUID postId,
            @PathVariable UUID commentId,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal User user) {
        CommentResponse response = commentService.updateComment(commentId, request, user);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable UUID postId,
            @PathVariable UUID commentId,
            @AuthenticationPrincipal User user) {
        commentService.deleteComment(commentId, user);
        return ResponseEntity.noContent().build();
    }
}
