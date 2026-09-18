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
// Tự động tích hợp Slf4j Logger để ghi nhật ký lỗi bảo mật
@Slf4j
// Đăng ký Service này thành 1 Spring Bean để inject vào OrderService, MyCourseController...
@Service
public class EncryptionService {

    // Thuật toán mã hóa: AES với chế độ GCM (Galois/Counter Mode) không đệm (NoPadding)
    private static final String ALGORITHM = "AES/GCM/NoPadding";
    // Độ dài Vector khởi tạo IV là 12 bytes (96 bits) - tiêu chuẩn khuyến nghị của NIST
    private static final int GCM_IV_LENGTH = 12;
    // Độ dài Tag xác thực toàn vẹn (Authentication Tag) là 128 bits
    private static final int GCM_TAG_LENGTH = 128;

    // Đối tượng giữ khóa bí mật AES trong bộ nhớ
    private final SecretKey secretKey;
    // Bộ sinh số ngẫu nhiên an toàn (chuyên dụng cho mật mã học)
    private final SecureRandom secureRandom;

    /**
     * Hàm khởi tạo: Đọc khóa bí mật dạng chuỗi HEX từ application.properties
     * Ví dụ: security.aes.secret-key=4d696c6974... (chuỗi 64 ký tự hex = 32 bytes = 256 bits)
     */
    public EncryptionService(@Value("${security.aes.secret-key}") String hexKey) {
        // Chuyển chuỗi Hex 64 ký tự thành mảng 32 bytes nhị phân
        byte[] decodedKey = HexFormat.of().parseHex(hexKey.trim());
        // Kiểm tra bắt buộc phải đủ chính xác 32 bytes (256 bits)
        if (decodedKey.length != 32) {
            throw new IllegalArgumentException("Khóa bí mật AES bắt buộc phải đúng 32 bytes (256 bits) định dạng HEX");
        }
        // Khởi tạo SecretKeySpec với thuật toán "AES"
        this.secretKey = new SecretKeySpec(decodedKey, "AES");
        // Khởi tạo bộ sinh số ngẫu nhiên mật mã an toàn
        this.secureRandom = new SecureRandom();
    }

    /**
     * MÃ HÓA: Biến chuỗi link Drive gốc thành chuỗi Base64 không thể đọc được
     * Ví dụ: "https://drive.google.com/..." -> "8jFk2...m9Q=="
     */
    public String encrypt(String plainText) {
        // Nếu chuỗi đầu vào rỗng hoặc null thì trả về nguyên bản
        if (plainText == null || plainText.isEmpty()) {
            return plainText;
        }

        try {
            // Bước 1: Sinh 12 bytes IV ngẫu nhiên MỚI cho MỖI LẦN mã hóa
            // Ngay cả khi mã hóa 2 link giống hệt nhau, kết quả Base64 vẫn hoàn toàn khác nhau
            byte[] iv = new byte[GCM_IV_LENGTH];
            secureRandom.nextBytes(iv);

            // Bước 2: Tạo đối tượng Cipher theo thuật toán AES/GCM/NoPadding
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            // Bước 3: Cấu hình tham số GCM với Auth Tag 128 bits và vector IV vừa sinh
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            // Bước 4: Khởi tạo Cipher ở chế độ MÃ HÓA (ENCRYPT_MODE) với secretKey
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, parameterSpec);

            // Bước 5: Thực hiện mã hóa dữ liệu gốc UTF-8 thành mảng byte đã mã hóa (kèm Auth Tag)
            byte[] cipherText = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));

            // Bước 6: Ghép mảng byte theo thứ tự: [12 bytes IV] + [Phần dữ liệu mã hóa + Auth Tag]
            ByteBuffer byteBuffer = ByteBuffer.allocate(iv.length + cipherText.length);
            byteBuffer.put(iv);          // Lưu IV vào đầu
            byteBuffer.put(cipherText);  // Lưu dữ liệu mã hóa vào sau

            // Bước 7: Mã hóa toàn bộ mảng byte thành chuỗi ký tự Base64 để lưu an toàn vào DB (cột TEXT)
            return Base64.getEncoder().encodeToString(byteBuffer.array());

        } catch (Exception e) {
            // Ghi log lỗi nếu xảy ra sự cố trong quá trình mã hóa
            log.error("Lỗi mã hóa dữ liệu: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi mã hóa dữ liệu bảo mật", e);
        }
    }

    /**
     * GIẢI MÃ: Biến chuỗi Base64 trong Database trở lại thành link Google Drive gốc
     */
    public String decrypt(String base64CipherText) {
        // Nếu chuỗi rỗng hoặc null thì trả về nguyên bản
        if (base64CipherText == null || base64CipherText.isEmpty()) {
            return base64CipherText;
        }

        try {
            // Bước 1: Giải mã chuỗi Base64 thành mảng byte nhị phân
            byte[] decoded = Base64.getDecoder().decode(base64CipherText);

            // Bước 2: Kiểm tra độ dài tối thiểu (ít nhất phải chứa đủ 12 bytes IV)
            if (decoded.length < GCM_IV_LENGTH) {
                throw new IllegalArgumentException("Độ dài chuỗi mã hóa không hợp lệ");
            }

            // Bước 3: Đọc và tách 12 bytes IV đầu tiên
            ByteBuffer byteBuffer = ByteBuffer.wrap(decoded);
            byte[] iv = new byte[GCM_IV_LENGTH];
            byteBuffer.get(iv); // Lấy 12 bytes đầu tiên đưa vào mảng iv

            // Bước 4: Lấy toàn bộ các byte còn lại (chính là CipherText + Auth Tag)
            byte[] cipherText = new byte[byteBuffer.remaining()];
            byteBuffer.get(cipherText);

            // Bước 5: Khởi tạo Cipher ở chế độ GIẢI MÃ (DECRYPT_MODE)
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, parameterSpec);

            // Bước 6: Thực hiện giải mã và tự động xác thực tính toàn vẹn (chống bị giả mạo / sửa đổi)
            byte[] plainTextBytes = cipher.doFinal(cipherText);

            // Bước 7: Chuyển mảng byte đã giải mã thành chuỗi văn bản UTF-8 (Link Drive gốc)
            return new String(plainTextBytes, StandardCharsets.UTF_8);

        } catch (Exception e) {
            // Ghi log lỗi nếu chuỗi bị sai key hoặc bị chỉnh sửa
            log.error("Lỗi giải mã dữ liệu: {}", e.getMessage());
            throw new RuntimeException("Lỗi giải mã dữ liệu bảo mật", e);
        }
    }
}
