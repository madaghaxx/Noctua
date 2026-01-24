package com.madagha.backend.admin.service;

import com.madagha.backend.admin.dto.PostAdminDto;
import com.madagha.backend.admin.dto.UserAdminDto;
import com.madagha.backend.comment.repository.CommentRepository;
import com.madagha.backend.like.repository.LikeRepository;
import com.madagha.backend.post.entity.Post;
import com.madagha.backend.post.repository.PostRepository;
import com.madagha.backend.report.dto.ReportDto;
import com.madagha.backend.report.entity.Report;
import com.madagha.backend.report.entity.ReportStatus;
import com.madagha.backend.report.repository.ReportRepository;
import com.madagha.backend.user.entity.Role;
import com.madagha.backend.user.entity.User;
import com.madagha.backend.user.entity.UserStatus;
import com.madagha.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final ReportRepository reportRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;

    // User Management
    public Page<UserAdminDto> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(this::mapToUserAdminDto);
    }

    public List<UserAdminDto> getUsersByStatus(UserStatus status) {
        return userRepository.findByStatus(status).stream()
                .map(this::mapToUserAdminDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void banUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(UserStatus.BANNED);
        userRepository.save(user);
    }

    @Transactional
    public void unbanUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Delete all user's posts and related data
        List<Post> userPosts = postRepository.findByOwnerId(userId);
        for (Post post : userPosts) {
            // Delete likes and comments for each post
            likeRepository.deleteByPostId(post.getId());
            commentRepository.deleteByPostId(post.getId());
        }
        postRepository.deleteByOwnerId(userId);

        // Delete user's likes and comments
        likeRepository.deleteByUserId(userId);
        commentRepository.deleteByUserId(userId);

        // Delete user's reports
        reportRepository.deleteByReportedUserId(userId);

        userRepository.delete(user);
    }

    // Post Moderation
    public Page<PostAdminDto> getAllPosts(Pageable pageable) {
        return postRepository.findAll(pageable)
                .map(this::mapToPostAdminDto);
    }

    @Transactional
    public void deletePost(UUID postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Delete likes and comments for the post
        likeRepository.deleteByPostId(postId);
        commentRepository.deleteByPostId(postId);

        postRepository.delete(post);
    }

    // Report Management
    public List<ReportDto> getPendingReports() {
        return reportRepository.findByStatus(ReportStatus.PENDING).stream()
                .map(this::mapToReportDto)
                .collect(Collectors.toList());
    }

    public List<ReportDto> getAllReports() {
        return reportRepository.findAll().stream()
                .map(this::mapToReportDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void resolveReport(UUID reportId, String adminNote) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        report.setStatus(ReportStatus.RESOLVED);
        report.setResolvedAt(LocalDateTime.now());
        report.setAdminNote(adminNote);
        reportRepository.save(report);
    }

    @Transactional
    public void dismissReport(UUID reportId, String adminNote) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        report.setStatus(ReportStatus.DISMISSED);
        report.setResolvedAt(LocalDateTime.now());
        report.setAdminNote(adminNote);
        reportRepository.save(report);
    }

    // Analytics
    public long getTotalUsers() {
        return userRepository.count();
    }

    public long getTotalPosts() {
        return postRepository.count();
    }

    public long getTotalReports() {
        return reportRepository.count();
    }

    public long getPendingReportsCount() {
        return reportRepository.countByStatus(ReportStatus.PENDING);
    }

    // Helper methods
    private UserAdminDto mapToUserAdminDto(User user) {
        return UserAdminDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .avatar(user.getAvatar())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .postCount(postRepository.countByOwnerId(user.getId()))
                .likeCount(likeRepository.countByUserId(user.getId()))
                .commentCount(commentRepository.countByUserId(user.getId()))
                .build();
    }

    private PostAdminDto mapToPostAdminDto(Post post) {
        long reportCount = reportRepository.countByReportedUserIdAndStatus(post.getOwner().getId(),
                ReportStatus.PENDING);

        return PostAdminDto.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .excerpt(post.getContent().length() > 200 ? post.getContent().substring(0, 200) + "..."
                        : post.getContent())
                .owner(PostAdminDto.UserSummaryDto.builder()
                        .id(post.getOwner().getId())
                        .username(post.getOwner().getUsername())
                        .avatar(post.getOwner().getAvatar())
                        .build())
                .mediaUrls(postRepository.findMediaUrlsByPostId(post.getId()))
                .likeCount(likeRepository.countByPostId(post.getId()))
                .commentCount(commentRepository.countByPostId(post.getId()))
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .reported(reportCount > 0)
                .reportCount((int) reportCount)
                .build();
    }

    private ReportDto mapToReportDto(Report report) {
        return ReportDto.builder()
                .id(report.getId())
                .reporter(ReportDto.UserSummaryDto.builder()
                        .id(report.getReporter().getId())
                        .username(report.getReporter().getUsername())
                        .avatar(report.getReporter().getAvatar())
                        .build())
                .reportedUser(ReportDto.UserSummaryDto.builder()
                        .id(report.getReportedUser().getId())
                        .username(report.getReportedUser().getUsername())
                        .avatar(report.getReportedUser().getAvatar())
                        .build())
                .reason(report.getReason())
                .status(report.getStatus())
                .createdAt(report.getCreatedAt())
                .resolvedAt(report.getResolvedAt())
                .adminNote(report.getAdminNote())
                .build();
    }
}