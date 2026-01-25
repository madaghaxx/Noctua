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
import java.util.Map;
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

    // File signatures for validation
    private static final Map<String, byte[]> FILE_SIGNATURES = Map.of(
            "image/jpeg", new byte[] { (byte) 0xFF, (byte) 0xD8, (byte) 0xFF },
            "image/png", new byte[] { (byte) 0x89, 0x50, 0x4E, 0x47 },
            "image/gif", new byte[] { (byte) 0x47, 0x49, 0x46, 0x38 },
            "image/webp", new byte[] { (byte) 0x52, 0x49, 0x46, 0x46 },
            "video/mp4", new byte[] { (byte) 0x00, 0x00, 0x00, 0x20, (byte) 0x66, 0x74, 0x79, 0x70 });

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

        // Validate file signature to prevent malicious files with changed extensions
        try {
            validateFileSignature(file, contentType);
        } catch (IOException e) {
            throw new RuntimeException("Unable to validate file content. Please try again.");
        }
    }

    private void validateFileSignature(MultipartFile file, String contentType) throws IOException {
        byte[] fileSignature = FILE_SIGNATURES.get(contentType);
        if (fileSignature == null) {
            // For content types without specific signatures, basic validation passed
            return;
        }

        byte[] fileBytes = file.getBytes();
        if (fileBytes.length < fileSignature.length) {
            throw new RuntimeException("File is too small to be a valid " + contentType + " file");
        }

        // Check if file starts with the expected signature
        for (int i = 0; i < fileSignature.length; i++) {
            if (fileBytes[i] != fileSignature[i]) {
                throw new RuntimeException("File content does not match the declared file type. " +
                        "This may be a malicious file with a changed extension.");
            }
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
