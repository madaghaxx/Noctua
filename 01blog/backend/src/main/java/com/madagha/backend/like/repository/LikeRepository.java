package com.madagha.backend.like.repository;

import com.madagha.backend.like.entity.Like;
import com.madagha.backend.post.entity.Post;
import com.madagha.backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface LikeRepository extends JpaRepository<Like, UUID> {

    Optional<Like> findByUserAndPost(User user, Post post);

    boolean existsByUserAndPost(User user, Post post);

    long countByPost(Post post);

    void deleteByUserAndPost(User user, Post post);

    void deleteByPostId(UUID postId);
}
