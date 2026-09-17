package com.khoahocgiahoi.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${rabbitmq.exchange.order}")
    private String orderExchange;

    @Value("${rabbitmq.queue.activation}")
    private String activationQueue;

    @Value("${rabbitmq.queue.email}")
    private String emailQueue;

    @Value("${rabbitmq.routingkey.activation}")
    private String activationRoutingKey;

    @Value("${rabbitmq.routingkey.email}")
    private String emailRoutingKey;

    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange(orderExchange);
    }

    @Bean
    public Queue activationQueue() {
        return QueueBuilder.durable(activationQueue).build();
    }

    @Bean
    public Queue emailQueue() {
        return QueueBuilder.durable(emailQueue).build();
    }

    @Bean
    public Binding activationBinding(Queue activationQueue, TopicExchange orderExchange) {
        return BindingBuilder.bind(activationQueue).to(orderExchange).with(activationRoutingKey);
    }

    @Bean
    public Binding emailBinding(Queue emailQueue, TopicExchange orderExchange) {
        return BindingBuilder.bind(emailQueue).to(orderExchange).with(emailRoutingKey);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
