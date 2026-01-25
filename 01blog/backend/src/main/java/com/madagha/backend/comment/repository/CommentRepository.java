package com.madagha.backend.comment.repository;

import com.madagha.backend.comment.entity.Comment;
import com.madagha.backend.post.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {

    Page<Comment> findByPostOrderByCreatedAtDesc(Post post, Pageable pageable);

    Page<Comment> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    long countByPost(Post post);

    void deleteByPostId(UUID postId);

    long countByUserId(UUID userId);

    void deleteByUserId(UUID userId);

    long countByPostId(UUID postId);
}
