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

        Page<Post> findAllByHiddenFalseOrderByCreatedAtDesc(Pageable pageable);

    Page<Post> findByOwnerInOrderByCreatedAtDesc(java.util.List<com.madagha.backend.user.entity.User> owners,
            Pageable pageable);

        Page<Post> findByOwnerIdAndHiddenFalseOrderByCreatedAtDesc(UUID ownerId, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT p FROM Post p WHERE p.owner IN (SELECT s.subscribedTo FROM com.madagha.backend.subscription.entity.Subscription s WHERE s.subscriber = :user) ORDER BY p.createdAt DESC")
    Page<Post> findPostsForSubscriber(
            @org.springframework.data.repository.query.Param("user") com.madagha.backend.user.entity.User user,
            Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT p FROM Post p WHERE p.hidden = false AND p.owner IN (SELECT s.subscribedTo FROM com.madagha.backend.subscription.entity.Subscription s WHERE s.subscriber = :user) ORDER BY p.createdAt DESC")
    Page<Post> findVisiblePostsForSubscriber(
            @org.springframework.data.repository.query.Param("user") com.madagha.backend.user.entity.User user,
            Pageable pageable);

    List<Post> findByOwnerId(UUID ownerId);

    void deleteByOwnerId(UUID ownerId);

    @Query("SELECT m.name FROM Media m WHERE m.post.id = :postId")
    List<String> findMediaUrlsByPostId(@Param("postId") UUID postId);

    long countByOwnerId(UUID ownerId);
}
