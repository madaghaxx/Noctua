package com.madagha.backend.post.repository;

import com.madagha.backend.post.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {
    Page<Post> findByOwnerIdOrderByCreatedAtDesc(UUID ownerId, Pageable pageable);

    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);

    List<Post> findByOwnerId(UUID ownerId);

    void deleteByOwnerId(UUID ownerId);

    @Query("SELECT m.name FROM Media m WHERE m.post.id = :postId")
    List<String> findMediaUrlsByPostId(@Param("postId") UUID postId);

    long countByOwnerId(UUID ownerId);
}
