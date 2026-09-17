package com.khoahocgiahoi.service.mq;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.Serializable;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderEventProducer {

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange.order}")
    private String orderExchange;

    @Value("${rabbitmq.routingkey.activation}")
    private String activationRoutingKey;

    @Value("${rabbitmq.routingkey.email}")
    private String emailRoutingKey;

    /**
     * Đẩy sự kiện thanh toán thành công vào RabbitMQ để xử lý bất đồng bộ
     */
    public void publishOrderPaidEvent(String orderCode, String referenceCode) {
        log.info("Publishing order paid event to RabbitMQ for order: {}", orderCode);
        Map<String, Object> message = Map.of(
            "orderCode", orderCode,
            "referenceCode", referenceCode != null ? referenceCode : "",
            "timestamp", System.currentTimeMillis()
        );
        rabbitTemplate.convertAndSend(orderExchange, activationRoutingKey, message);
    }

    /**
     * Đẩy yêu cầu gửi email xác nhận và link Drive vào hàng đợi email
     */
    public void publishSendEmailEvent(String orderCode) {
        log.info("Publishing email event to RabbitMQ for order: {}", orderCode);
        Map<String, Object> message = Map.of(
            "orderCode", orderCode,
            "timestamp", System.currentTimeMillis()
        );
        rabbitTemplate.convertAndSend(orderExchange, emailRoutingKey, message);
    }
}
