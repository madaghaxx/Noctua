package com.madagha.backend.report.repository;

import com.madagha.backend.report.entity.Report;
import com.madagha.backend.report.entity.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReportRepository extends JpaRepository<Report, UUID> {

    List<Report> findByStatus(ReportStatus status);

    List<Report> findByReportedUserId(UUID reportedUserId);

    void deleteByReportedUserId(UUID reportedUserId);

    @Query("SELECT COUNT(r) FROM Report r WHERE r.reportedUser.id = :userId AND r.status = :status")
    long countByReportedUserIdAndStatus(@Param("userId") UUID userId, @Param("status") ReportStatus status);

    @Query("SELECT COUNT(r) FROM Report r WHERE r.status = :status")
    long countByStatus(@Param("status") ReportStatus status);

    @Query("SELECT r FROM Report r WHERE r.reportedUser.id = :userId ORDER BY r.createdAt DESC")
    List<Report> findByReportedUserIdOrderByCreatedAtDesc(@Param("userId") UUID userId);
}