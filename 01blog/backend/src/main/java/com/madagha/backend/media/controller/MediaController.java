package com.madagha.backend.media.controller;

import com.madagha.backend.common.response.ApiResponse;
import com.madagha.backend.media.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    @PostMapping("/upload/{postId}")
    public ResponseEntity<ApiResponse<List<String>>> uploadFiles(
            @PathVariable UUID postId,
            @RequestParam("files") List<MultipartFile> files) {
        List<String> fileNames = mediaService.uploadFiles(files, postId);
        return ResponseEntity.ok(ApiResponse.success("Files uploaded successfully", fileNames));
    }

    @GetMapping("/{fileName:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String fileName) {
        Resource resource = mediaService.loadFileAsResource(fileName);
        String contentType = mediaService.getFileContentType(fileName);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                .body(resource);
    }
}
