package com.madagha.backend.post.service;

import com.madagha.backend.comment.repository.CommentRepository;
import com.madagha.backend.common.exception.ResourceNotFoundException;
import com.madagha.backend.common.exception.UnauthorizedException;
import com.madagha.backend.like.repository.LikeRepository;
import com.madagha.backend.media.entity.Media;
import com.madagha.backend.media.repository.MediaRepository;
import com.madagha.backend.post.dto.CreatePostRequest;
import com.madagha.backend.post.dto.PostDto;
import com.madagha.backend.post.entity.Post;
import com.madagha.backend.post.repository.PostRepository;
import com.madagha.backend.user.dto.UserDto;
import com.madagha.backend.user.entity.User;
import com.madagha.backend.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

        private final PostRepository postRepository;
        private final MediaRepository mediaRepository;
        private final LikeRepository likeRepository;
        private final CommentRepository commentRepository;
        private final UserService userService;

        @Transactional
        public PostDto createPost(CreatePostRequest request, String username) {
                User user = userService.getCurrentUser(username);

                Post post = Post.builder()
                                .title(request.getTitle())
                                .content(request.getContent())
                                .owner(user)
                                .build();

                Post savedPost = postRepository.save(post);
                return mapToDto(savedPost);
        }

        @Transactional
        public PostDto updatePost(UUID id, CreatePostRequest request, String username) {
                Post post = postRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));

                User user = userService.getCurrentUser(username);

                if (!post.getOwner().getId().equals(user.getId())) {
                        throw new UnauthorizedException("You are not authorized to update this post");
                }

                post.setTitle(request.getTitle());
                post.setContent(request.getContent());

                Post updatedPost = postRepository.save(post);
                return mapToDto(updatedPost);
        }

        @Transactional
        public void deletePost(UUID id, String username) {
                Post post = postRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));

                User user = userService.getCurrentUser(username);

                if (!post.getOwner().getId().equals(user.getId())) {
                        throw new UnauthorizedException("You are not authorized to delete this post");
                }

                // Delete associated media, likes, and comments (cascading delete)
                mediaRepository.deleteByPostId(id);
                likeRepository.deleteByPostId(id);
                commentRepository.deleteByPostId(id);

                // Delete the post itself
                postRepository.delete(post);
        }

        public PostDto getPostById(UUID id) {
                Post post = postRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));
                return mapToDto(post);
        }

        public Page<PostDto> getAllPosts(int page, int size) {
                Pageable pageable = PageRequest.of(page, size);
                Page<Post> posts = postRepository.findAllByOrderByCreatedAtDesc(pageable);

                // Fetch all media in one query to avoid N+1 problem
                List<UUID> postIds = posts.getContent().stream()
                                .map(Post::getId)
                                .collect(Collectors.toList());

                List<Media> allMedia = postIds.isEmpty() ? List.of() : mediaRepository.findByPostIdIn(postIds);

                return posts.map(post -> mapToDto(post, allMedia));
        }

        public Page<PostDto> getPostsByUser(UUID userId, int page, int size) {
                Pageable pageable = PageRequest.of(page, size);
                Page<Post> posts = postRepository.findByOwnerIdOrderByCreatedAtDesc(userId, pageable);

                // Fetch all media in one query to avoid N+1 problem
                List<UUID> postIds = posts.getContent().stream()
                                .map(Post::getId)
                                .collect(Collectors.toList());

                List<Media> allMedia = postIds.isEmpty() ? List.of() : mediaRepository.findByPostIdIn(postIds);

                return posts.map(post -> mapToDto(post, allMedia));
        }

        private PostDto mapToDto(Post post) {
                List<Media> mediaList = mediaRepository.findByPostId(post.getId());
                List<String> mediaUrls = mediaList.stream()
                                .map(media -> "/api/media/" + media.getName())
                                .collect(Collectors.toList());

                UserDto ownerDto = UserDto.builder()
                                .id(post.getOwner().getId())
                                .username(post.getOwner().getUsername())
                                .email(post.getOwner().getEmail())
                                .avatar(post.getOwner().getAvatar())
                                .role(post.getOwner().getRole())
                                .status(post.getOwner().getStatus())
                                .build();

                return PostDto.builder()
                                .id(post.getId())
                                .title(post.getTitle())
                                .content(post.getContent())
                                .owner(ownerDto)
                                .mediaUrls(mediaUrls)
                                .likeCount(likeRepository.countByPost(post))
                                .commentCount(commentRepository.countByPost(post))
                                .createdAt(post.getCreatedAt())
                                .updatedAt(post.getUpdatedAt())
                                .build();
        }

        private PostDto mapToDto(Post post, List<Media> allMedia) {
                List<String> mediaUrls = allMedia.stream()
                                .filter(media -> media.getPost().getId().equals(post.getId()))
                                .map(media -> "/api/media/" + media.getName())
                                .collect(Collectors.toList());

                UserDto ownerDto = UserDto.builder()
                                .id(post.getOwner().getId())
                                .username(post.getOwner().getUsername())
                                .email(post.getOwner().getEmail())
                                .avatar(post.getOwner().getAvatar())
                                .role(post.getOwner().getRole())
                                .status(post.getOwner().getStatus())
                                .build();

                return PostDto.builder()
                                .id(post.getId())
                                .title(post.getTitle())
                                .content(post.getContent())
                                .owner(ownerDto)
                                .mediaUrls(mediaUrls)
                                .likeCount(likeRepository.countByPost(post))
                                .commentCount(commentRepository.countByPost(post))
                                .createdAt(post.getCreatedAt())
                                .updatedAt(post.getUpdatedAt())
                                .build();
        }
}
