package com.madagha.backend.media.service;

import com.madagha.backend.common.exception.ResourceNotFoundException;
import com.madagha.backend.media.entity.Media;
import com.madagha.backend.media.repository.MediaRepository;
import com.madagha.backend.post.entity.Post;
import com.madagha.backend.post.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MediaService {

    private final MediaRepository mediaRepository;
    private final PostRepository postRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    private static final List<String> ALLOWED_IMAGE_TYPES = List.of(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp");

    private static final List<String> ALLOWED_VIDEO_TYPES = List.of(
            "video/mp4", "video/mpeg", "video/webm");

    public List<String> uploadFiles(List<MultipartFile> files, UUID postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));

        List<String> uploadedFileNames = new ArrayList<>();

        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                continue;
            }

            validateFile(file);

            try {
                String fileName = storeFile(file);
                String filePath = getFilePath(fileName);

                Media media = Media.builder()
                        .name(fileName)
                        .filePath(filePath)
                        .fileType(file.getContentType())
                        .post(post)
                        .build();

                mediaRepository.save(media);
                uploadedFileNames.add(fileName);

            } catch (IOException ex) {
                throw new RuntimeException("Could not store file. Please try again!", ex);
            }
        }

        return uploadedFileNames;
    }

    private void validateFile(MultipartFile file) {
        String contentType = file.getContentType();

        if (contentType == null) {
            throw new RuntimeException("File type cannot be determined");
        }

        if (!ALLOWED_IMAGE_TYPES.contains(contentType) && !ALLOWED_VIDEO_TYPES.contains(contentType)) {
            throw new RuntimeException("File type not allowed. Only images and videos are supported.");
        }

        // Max 10MB
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new RuntimeException("File size exceeds maximum limit of 10MB");
        }
    }

    private String storeFile(MultipartFile file) throws IOException {
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = "";

        if (originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }

        String fileName = UUID.randomUUID().toString() + fileExtension;

        LocalDateTime now = LocalDateTime.now();
        String yearMonth = now.format(DateTimeFormatter.ofPattern("yyyy/MM"));
        Path uploadPath = Paths.get(uploadDir, yearMonth);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path targetLocation = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        return fileName;
    }

    private String getFilePath(String fileName) {
        LocalDateTime now = LocalDateTime.now();
        String yearMonth = now.format(DateTimeFormatter.ofPattern("yyyy/MM"));
        return uploadDir + "/" + yearMonth + "/" + fileName;
    }

    public Resource loadFileAsResource(String fileName) {
        try {
            Media media = mediaRepository.findByName(fileName)
                    .orElseThrow(() -> new ResourceNotFoundException("File not found: " + fileName));

            Path filePath = Paths.get(media.getFilePath()).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found: " + fileName);
            }
        } catch (Exception ex) {
            throw new ResourceNotFoundException("File not found: " + fileName);
        }
    }

    public String getFileContentType(String fileName) {
        Media media = mediaRepository.findByName(fileName)
                .orElseThrow(() -> new ResourceNotFoundException("File not found: " + fileName));
        return media.getFileType();
    }
}
