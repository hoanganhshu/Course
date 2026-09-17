package com.khoahocgiahoi.service;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.DriveScopes;
import com.google.api.services.drive.model.Permission;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.Collections;

@Slf4j
@Service
public class GoogleDriveService {

    @Value("${google.drive.service-account-key-path:service-account.json}")
    private String keyPath;

    @Value("${google.drive.enabled:true}")
    private boolean enabled;

    @Value("${google.drive.application-name:KhoaHocGiaHoi}")
    private String applicationName;

    private Drive driveService;

    @PostConstruct
    public void init() {
        if (!enabled) {
            log.info("Google Drive integration is disabled via configuration.");
            return;
        }

        try {
            InputStream keyStream = null;
            File file = new File(keyPath);
            if (file.exists()) {
                keyStream = new FileInputStream(file);
                log.info("Loading Google Service Account key from filesystem: {}", file.getAbsolutePath());
            } else {
                keyStream = getClass().getClassLoader().getResourceAsStream(keyPath);
                if (keyStream != null) {
                    log.info("Loading Google Service Account key from classpath: {}", keyPath);
                }
            }

            if (keyStream == null) {
                log.warn("⚠️ Google Service Account key file '{}' not found. Google Drive auto-sharing will run in fallback simulation mode.", keyPath);
                return;
            }

            GoogleCredentials credentials = GoogleCredentials.fromStream(keyStream)
                    .createScoped(Collections.singleton(DriveScopes.DRIVE));

            this.driveService = new Drive.Builder(
                    GoogleNetHttpTransport.newTrustedTransport(),
                    GsonFactory.getDefaultInstance(),
                    new HttpCredentialsAdapter(credentials))
                    .setApplicationName(applicationName)
                    .build();

            log.info("✅ Google Drive Service initialized successfully with Service Account.");
        } catch (Exception e) {
            log.error("Failed to initialize Google Drive client: {}", e.getMessage(), e);
        }
    }

    /**
     * Tự động chia sẻ folder/file Google Drive cho một tài khoản Gmail với quyền 'reader' (chỉ xem)
     *
     * @param fileOrFolderId ID của thư mục hoặc file Google Drive
     * @param recipientGmail Địa chỉ Gmail của khách hàng
     * @return permissionId được sinh ra bởi Google Drive
     */
    public String shareFolderOrFile(String fileOrFolderId, String recipientGmail) {
        if (fileOrFolderId == null || fileOrFolderId.isBlank()) {
            log.warn("Cannot share Drive folder: fileOrFolderId is empty.");
            return null;
        }

        if (recipientGmail == null || !recipientGmail.contains("@")) {
            throw new IllegalArgumentException("Địa chỉ Gmail không hợp lệ: " + recipientGmail);
        }

        if (driveService == null) {
            log.warn("⚠️ Google Drive service not connected (missing service-account.json). Simulating permission grant for {} to folder {}", recipientGmail, fileOrFolderId);
            return "simulated-permission-" + System.currentTimeMillis();
        }

        try {
            Permission permission = new Permission()
                    .setType("user")
                    .setRole("reader")
                    .setEmailAddress(recipientGmail.trim().toLowerCase());

            Permission created = driveService.permissions().create(fileOrFolderId.trim(), permission)
                    .setSendNotificationEmail(true) // Google tự gửi email thông báo đã chia sẻ
                    .setFields("id, role, type, emailAddress")
                    .execute();

            log.info("✅ Shared Drive item {} with {} successfully! Permission ID: {}",
                    fileOrFolderId, recipientGmail, created.getId());
            return created.getId();
        } catch (Exception e) {
            log.error("❌ Failed to share Google Drive item {} with {}: {}", fileOrFolderId, recipientGmail, e.getMessage());
            throw new RuntimeException("Lỗi phân quyền Google Drive: " + e.getMessage(), e);
        }
    }

    /**
     * Thu hồi quyền truy cập nếu hoàn tiền hoặc hủy đơn
     */
    public void revokePermission(String fileOrFolderId, String permissionId) {
        if (driveService == null || fileOrFolderId == null || permissionId == null) {
            return;
        }
        try {
            driveService.permissions().delete(fileOrFolderId, permissionId).execute();
            log.info("Revoked permission {} for Drive item {}", permissionId, fileOrFolderId);
        } catch (Exception e) {
            log.error("Failed to revoke permission {} on Drive item {}: {}", permissionId, fileOrFolderId, e.getMessage());
        }
    }

    public boolean isConnected() {
        return driveService != null;
    }
}
