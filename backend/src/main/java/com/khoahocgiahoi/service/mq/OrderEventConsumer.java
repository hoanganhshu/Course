package com.khoahocgiahoi.service.mq;

import com.khoahocgiahoi.entity.Order;
import com.khoahocgiahoi.entity.OrderItem;
import com.khoahocgiahoi.repository.OrderRepository;
import com.khoahocgiahoi.security.EncryptionService;
import com.khoahocgiahoi.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderEventConsumer {

    private final OrderRepository orderRepository;
    private final EmailService emailService;
    private final EncryptionService encryptionService;

    /**
     * Consumer xử lý gửi email bất đồng bộ từ hàng đợi RabbitMQ
     */
    @RabbitListener(queues = "${rabbitmq.queue.email}")
    public void handleOrderEmailEvent(Map<String, Object> message) {
        String orderCode = (String) message.get("orderCode");
        log.info("RabbitMQ Consumer received email event for order: {}", orderCode);

        try {
            Order order = orderRepository.findByOrderCode(orderCode).orElse(null);
            if (order == null) {
                log.warn("Order not found: {}", orderCode);
                return;
            }

            // Giải mã link Google Drive (AES-256-GCM) trước khi gửi qua email
            List<String> decryptedDriveLinks = new ArrayList<>();
            for (OrderItem item : order.getItems()) {
                String encryptedLink = item.getCourse().getDriveLink();
                if (encryptedLink != null && !encryptedLink.isBlank()) {
                    try {
                        String decrypted = encryptionService.decrypt(encryptedLink);
                        decryptedDriveLinks.add(decrypted);
                    } catch (Exception e) {
                        // Nếu là link plain text cũ thì dùng trực tiếp
                        decryptedDriveLinks.add(encryptedLink);
                    }
                } else {
                    decryptedDriveLinks.add("#");
                }
            }

            emailService.sendOrderConfirmationEmail(
                order.getCustomerEmail(),
                order.getCustomerName(),
                order.getOrderCode(),
                order.getItems(),
                decryptedDriveLinks
            );
            log.info("Confirmation email sent via RabbitMQ for order: {}", orderCode);

        } catch (Exception e) {
            log.error("Failed to process email event from RabbitMQ: {}", e.getMessage(), e);
        }
    }
}
