package com.sssit.bikerental.common.util;

import com.sssit.bikerental.common.constants.Constants;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;

public final class FileUploadUtil {

    private FileUploadUtil() {
        throw new IllegalStateException("Utility class");
    }

    /**
     * Validates uploaded file.
     *
     * @param file MultipartFile
     */
    public static void validateFile(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty.");
        }

        if (file.getSize() > Constants.MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    "File size should not exceed "
                            + (Constants.MAX_FILE_SIZE / (1024 * 1024))
                            + " MB."
            );
        }

        String contentType = file.getContentType();

        boolean isAllowed =
                Arrays.asList(Constants.ALLOWED_IMAGE_TYPES).contains(contentType)
                        ||
                Arrays.asList(Constants.ALLOWED_DOCUMENT_TYPES).contains(contentType);

        if (!isAllowed) {
            throw new IllegalArgumentException("Unsupported file type.");
        }
    }

    /**
     * Returns file extension.
     *
     * @param file MultipartFile
     * @return Extension
     */
    public static String getFileExtension(MultipartFile file) {

        String fileName = file.getOriginalFilename();

        if (fileName == null || !fileName.contains(".")) {
            return "";
        }

        return fileName.substring(fileName.lastIndexOf("."));
    }

    /**
     * Sanitizes filename.
     *
     * @param fileName Original filename
     * @return Safe filename
     */
    public static String sanitizeFileName(String fileName) {

        if (fileName == null) {
            return "";
        }

        return fileName
                .replaceAll("\\s+", "_")
                .replaceAll("[^a-zA-Z0-9._-]", "");
    }
}