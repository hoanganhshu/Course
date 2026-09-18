package com.khoahocgiahoi.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

/**
 * Dịch vụ mã hóa dữ liệu quân đội AES-256-GCM.
 * Sử dụng cho:
 * - Google Drive Secret Links
 * - License Keys / Bản quyền số
 * - Mật khẩu / 2FA Accounts
 * 
 * Chuẩn:
 * - Thuật toán: AES/GCM/NoPadding
 * - Khóa bí mật: 256 bits (32 bytes)
 * - Vector khởi tạo (IV): 12 bytes ngẫu nhiên cho MỖI lần mã hóa (chống tấn công replay & thống kê)
 * - Authentication Tag: 128 bits (chống sửa đổi dữ liệu)
 * - Dữ liệu xuất: Base64(IV + CipherText + Tag)
 */
@Slf4j
@Service
public class EncryptionService {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;         // 12 bytes (96 bits) chuẩn NIST
    private static final int GCM_TAG_LENGTH = 128;       // 128 bits auth tag

    private final SecretKey secretKey;
    private final SecureRandom secureRandom;

    public EncryptionService(@Value("${security.aes.secret-key}") String hexKey) {
        byte[] decodedKey = HexFormat.of().parseHex(hexKey.trim());
        if (decodedKey.length != 32) {
            throw new IllegalArgumentException("AES key must be exactly 32 bytes (256 bits) in HEX format");
        }
        this.secretKey = new SecretKeySpec(decodedKey, "AES");
        this.secureRandom = new SecureRandom();
    }

    /**
     * Mã hóa chuỗi văn bản thuần sang chuỗi Base64 bảo mật
     */
    public String encrypt(String plainText) {
        if (plainText == null || plainText.isEmpty()) {
            return plainText;
        }

        try {
            // Sinh IV ngẫu nhiên 12 bytes cho mỗi bản ghi
            byte[] iv = new byte[GCM_IV_LENGTH];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, parameterSpec);

            byte[] cipherText = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));

            // Ghép: [IV (12 bytes)] + [CipherText + AuthTag]
            ByteBuffer byteBuffer = ByteBuffer.allocate(iv.length + cipherText.length);
            byteBuffer.put(iv);
            byteBuffer.put(cipherText);

            return Base64.getEncoder().encodeToString(byteBuffer.array());

        } catch (Exception e) {
            log.error("Encryption failure: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi mã hóa dữ liệu bảo mật", e);
        }
    }

    /**
     * Giải mã chuỗi Base64 trả về văn bản gốc
     */
    public String decrypt(String base64CipherText) {
        if (base64CipherText == null || base64CipherText.isEmpty()) {
            return base64CipherText;
        }

        try {
            byte[] decoded = Base64.getDecoder().decode(base64CipherText);

            if (decoded.length < GCM_IV_LENGTH) {
                throw new IllegalArgumentException("Invalid cipher text length");
            }

            // Tách IV 12 bytes đầu tiên
            ByteBuffer byteBuffer = ByteBuffer.wrap(decoded);
            byte[] iv = new byte[GCM_IV_LENGTH];
            byteBuffer.get(iv);

            // Phần còn lại là CipherText + AuthTag
            byte[] cipherText = new byte[byteBuffer.remaining()];
            byteBuffer.get(cipherText);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, parameterSpec);

            byte[] plainTextBytes = cipher.doFinal(cipherText);
            return new String(plainTextBytes, StandardCharsets.UTF_8);

        } catch (Exception e) {
            log.error("Decryption failure: {}", e.getMessage());
            throw new RuntimeException("Lỗi giải mã dữ liệu bảo mật", e);
        }
    }
}
