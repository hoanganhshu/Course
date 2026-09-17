package com.khoahocgiahoi.service;

import com.khoahocgiahoi.entity.OrderItem;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendOrderConfirmationEmail(
            String toEmail,
            String customerName,
            String orderCode,
            List<OrderItem> items,
            List<String> driveLinks
    ) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "Khóa Học Giá Hời");
            helper.setTo(toEmail);
            helper.setSubject("✅ [" + orderCode + "] Thanh toán thành công - Link học tập của bạn đây!");
            helper.setText(buildEmailHtml(customerName, orderCode, items, driveLinks), true);

            mailSender.send(message);
            log.info("Confirmation email sent to: {} for order: {}", toEmail, orderCode);

        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", toEmail, e.getMessage());
        }
    }

    private String buildEmailHtml(
            String customerName,
            String orderCode,
            List<OrderItem> items,
            List<String> driveLinks
    ) {
        StringBuilder sb = new StringBuilder();
        sb.append("""
            <!DOCTYPE html>
            <html lang="vi">
            <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; background:#f4f4f4; margin:0; padding:0; }
              .container { max-width:600px; margin:30px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,.08); }
              .header { background:linear-gradient(135deg,#1976d2,#42a5f5); padding:30px; text-align:center; color:#fff; }
              .header h1 { margin:0; font-size:24px; }
              .body { padding:30px; }
              .order-code { background:#e3f2fd; border-left:4px solid #1976d2; padding:12px 16px; border-radius:6px; font-size:18px; font-weight:bold; margin-bottom:20px; }
              .course-item { display:flex; align-items:center; background:#f8f9fa; border-radius:8px; padding:12px; margin-bottom:12px; }
              .course-item img { width:60px; height:60px; object-fit:cover; border-radius:6px; margin-right:12px; }
              .drive-btn { display:inline-block; background:#34a853; color:#fff; text-decoration:none; padding:10px 20px; border-radius:6px; font-weight:bold; margin-top:8px; }
              .footer { background:#f8f9fa; padding:20px; text-align:center; color:#666; font-size:13px; }
              .support { background:#fff3cd; border-radius:8px; padding:16px; margin-top:20px; text-align:center; }
            </style>
            </head>
            <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Thanh toán thành công!</h1>
                <p>Chào mừng bạn đến với Khóa Học Giá Hời</p>
              </div>
              <div class="body">
            """);

        sb.append("<p>Xin chào <strong>").append(customerName).append("</strong>,</p>");
        sb.append("<p>Đơn hàng của bạn đã được kích hoạt thành công. Dưới đây là link Google Drive để bắt đầu học ngay:</p>");
        sb.append("<div class='order-code'>Mã đơn: ").append(orderCode).append("</div>");

        for (int i = 0; i < items.size(); i++) {
            OrderItem item = items.get(i);
            String driveLink = (driveLinks != null && i < driveLinks.size()) ? driveLinks.get(i) : "#";

            sb.append("<div class='course-item'>");
            if (item.getCourseThumbnail() != null) {
                sb.append("<img src='").append(item.getCourseThumbnail()).append("' alt='thumbnail' />");
            }
            sb.append("<div>");
            sb.append("<strong>").append(item.getCourseTitle()).append("</strong>");
            if (driveLink != null && !driveLink.equals("#")) {
                sb.append("<br/><a class='drive-btn' href='").append(driveLink).append("'>📁 Mở Google Drive học ngay</a>");
            }
            sb.append("</div></div>");
        }

        sb.append("""
              <div class='support'>
                <p>Cần hỗ trợ? Chat ngay với chúng mình qua:</p>
                <p>📱 <strong>Zalo: 0583 953 426</strong></p>
                <p>Chúc bạn học tập hiệu quả! 🚀</p>
              </div>
              </div>
              <div class="footer">
                <p>© 2025 Khóa Học Giá Hời | khoahocgiahoi.com</p>
                <p>Khóa học đã nhận được học trọn đời, không giới hạn số lần xem.</p>
              </div>
            </div>
            </body>
            </html>
            """);

        return sb.toString();
    }
}
