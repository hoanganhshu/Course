package com.khoahocgiahoi.config;

import com.khoahocgiahoi.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

// Đánh dấu đây là lớp cấu hình của Spring Boot
@Configuration
// Kích hoạt tính năng bảo mật Spring Security trên ứng dụng web
@EnableWebSecurity
// Cho phép bảo vệ các hàm bằng annotation @PreAuthorize("hasRole('ADMIN')")
@EnableMethodSecurity(prePostEnabled = true)
// Tự động sinh constructor cho các trường final
@RequiredArgsConstructor
public class SecurityConfig {

    // Bộ lọc kiểm tra JWT Token
    private final JwtAuthenticationFilter jwtAuthFilter;
    // Dịch vụ nạp thông tin người dùng
    private final UserDetailsService userDetailsService;

    // Đọc danh sách các domain frontend được phép gọi API (ví dụ: http://localhost:3000)
    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    /**
     * Cấu hình chuỗi lọc bảo mật chính (Security Filter Chain)
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Tắt cơ chế CSRF vì hệ thống giao tiếp qua REST API & Stateless JWT (không dùng Session cookie)
            .csrf(AbstractHttpConfigurer::disable)

            // 2. Kích hoạt cấu hình CORS (cho phép frontend gọi từ domain khác)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // 3. Cấu hình Session: Stateless (Server không lưu trữ session người dùng trong RAM)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // 4. PHÂN QUYỀN ĐƯỜNG DẪN URL (Authorization Rules)
            .authorizeHttpRequests(auth -> auth
                // ===== CÁC ENDPOINT CÔNG KHAI (Ai cũng vào được, không cần Token) =====
                // Đăng nhập, Đăng ký tài khoản
                .requestMatchers("/auth/login", "/auth/register").permitAll()
                // Xem danh mục, danh sách khóa học, bảng giá gói hội viên, đánh giá feedback
                .requestMatchers(HttpMethod.GET,
                    "/categories/**",
                    "/courses/**",
                    "/memberships/**",
                    "/feedbacks/**"
                ).permitAll()
                // Khách thanh toán đơn hàng & kiểm tra tiến độ thanh toán
                .requestMatchers("/orders/checkout", "/orders/check-status/**").permitAll()
                // Webhook ngân hàng (SePay / PayOS) phải công khai để server ngân hàng có thể bắn POST vào
                .requestMatchers("/payment/webhook/**").permitAll()

                // ===== CÁC ENDPOINT DÀNH RIÊNG CHO QUẢN TRỊ VIÊN (ROLE_ADMIN) =====
                // Toàn bộ đường dẫn bắt đầu bằng /admin/** bắt buộc người dùng phải có Role ADMIN
                .requestMatchers("/admin/**").hasRole("ADMIN")

                // ===== CÁC ENDPOINT BẮT BUỘC ĐÃ ĐĂNG NHẬP (Cần JWT Token hợp lệ) =====
                // Xem profile cá nhân, lưu Gmail nhận Google Drive
                .requestMatchers("/auth/me", "/auth/drive-email").authenticated()
                // Xem số dư ví, nạp tiền vào ví
                .requestMatchers("/wallet/**").authenticated()
                // Mở link học tập Google Drive của khóa học đã mua
                .requestMatchers("/my-courses/**").authenticated()
                // Mọi request còn lại chưa khai báo ở trên đều phải đăng nhập
                .anyRequest().authenticated()
            )

            // 5. Gắn AuthenticationProvider để xác thực tài khoản và kiểm tra mật khẩu BCrypt
            .authenticationProvider(authenticationProvider())

            // 6. Đặt JwtAuthenticationFilter chạy TRƯỚC UsernamePasswordAuthenticationFilter
            // Đảm bảo token được giải mã và user được nhận diện trước khi kiểm tra quyền
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        // Xây dựng và trả về chuỗi lọc bảo mật hoàn chỉnh
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(Arrays.asList(allowedOrigins.split(",")));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}
