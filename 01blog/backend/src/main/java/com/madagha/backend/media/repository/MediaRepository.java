package com.madagha.backend.media.repository;

import com.madagha.backend.media.entity.Media;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MediaRepository extends JpaRepository<Media, UUID> {
    List<Media> findByPostId(UUID postId);

    Optional<Media> findByName(String name);

    List<Media> findByPostIdIn(List<UUID> postIds);

    void deleteByPostId(UUID postId);
}