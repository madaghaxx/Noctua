package com.madagha.backend.report.service;

import com.madagha.backend.common.exception.BadRequestException;
import com.madagha.backend.common.exception.ConflictException;
import com.madagha.backend.common.exception.ResourceNotFoundException;
import com.madagha.backend.report.dto.CreateReportRequest;
import com.madagha.backend.report.entity.Report;
import com.madagha.backend.report.repository.ReportRepository;
import com.madagha.backend.user.entity.User;
import com.madagha.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;

    @Transactional
    public void createReport(String reporterUsername, CreateReportRequest request) {
        User reporter = userRepository.findByUsername(reporterUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Reporter not found"));

        User reportedUser = userRepository.findById(request.getReportedUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Reported user not found"));

        // Check if user is trying to report themselves
        if (reporter.getId().equals(reportedUser.getId())) {
            throw new BadRequestException("You cannot report yourself");
        }

        // Check if user has already reported this person
        boolean alreadyReported = reportRepository.findByReportedUserId(reportedUser.getId())
                .stream()
                .anyMatch(report -> report.getReporter().getId().equals(reporter.getId()));

        if (alreadyReported) {
            throw new ConflictException("You have already reported this user");
        }

        Report report = Report.builder()
                .reporter(reporter)
                .reportedUser(reportedUser)
                .reportedPostId(request.getReportedPostId())
                .reason(request.getReason())
                .build();

        reportRepository.save(report);
    }
}