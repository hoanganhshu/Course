package com.khoahocgiahoi.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Map;

// Đánh dấu log qua thư viện Slf4j (log.info, log.error)
@Slf4j
// Đăng ký lớp này thành 1 Spring Bean để Spring quản lý và tự động tiêm (inject)
@Component
// Lombok tự động sinh constructor chứa tất cả các biến 'final' bên dưới
@RequiredArgsConstructor
// Kế thừa OncePerRequestFilter để đảm bảo bộ lọc này CHỈ CHẠY ĐÚNG 1 LẦN cho mỗi HTTP Request
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    // Tiêm JwtTokenProvider để giải mã và kiểm tra tính hợp lệ của chuỗi JWT
    private final JwtTokenProvider jwtTokenProvider;
    // Tiêm UserDetailsService để nạp thông tin người dùng từ Database dựa vào email
    private final UserDetailsService userDetailsService;
    // Công cụ chuyển đổi đối tượng Java sang JSON (Jackson)
    private final ObjectMapper objectMapper;

    /**
     * Phương thức lõi của Filter: Chặn mọi request HTTP trước khi tới Controller
     */
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,   // Đối tượng chứa thông tin request gửi lên (Header, Body, URL...)
            HttpServletResponse response, // Đối tượng phản hồi về cho Client
            FilterChain filterChain       // Chuỗi các bộ lọc tiếp theo của Spring Security
    ) throws ServletException, IOException {

        try {
            // Bước 1: Trích xuất chuỗi JWT token từ Header Authorization của Request
            String token = extractTokenFromRequest(request);

            // Bước 2: Kiểm tra nếu có token và chữ ký token hoàn toàn hợp lệ (chưa hết hạn, đúng secret key)
            if (StringUtils.hasText(token) && jwtTokenProvider.validateToken(token)) {
                // Bước 3: Giải mã token lấy ra email định danh của người dùng
                String email = jwtTokenProvider.getEmailFromToken(token);

                // Bước 4: Nạp chi tiết User từ CSDL (gồm email, mật khẩu mã hóa, danh sách quyền hạn/Roles)
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                // Bước 5: Khởi tạo đối tượng xác thực (Authentication) chính thức của Spring Security
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,                  // Đối tượng người dùng
                                null,                         // Không cần lưu credentials (password) trong bộ nhớ
                                userDetails.getAuthorities()  // Danh sách quyền hạn (ROLE_USER, ROLE_ADMIN)
                        );

                // Bước 6: Đính kèm chi tiết request (như địa chỉ IP, Session ID) vào Authentication
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Bước 7: Lưu đối tượng Authentication vào SecurityContextHolder của luồng hiện tại (ThreadLocal)
                // Từ đây về sau, bất kỳ Controller nào cũng có thể gọi 'Authentication authentication' để lấy user hiện tại
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            // Ghi log lỗi nếu token sai định dạng hoặc bị lỗi
            log.error("Không thể thiết lập xác thực người dùng: {}", ex.getMessage());
            // Không ném Exception ra ngoài để chuỗi Filter vẫn tiếp tục; 
            // Nếu endpoint yêu cầu đăng nhập, Spring Security sẽ tự động chặn và trả lỗi 401 Unauthorized
        }

        // Bước 8: Chuyển request và response cho Filter tiếp theo trong chuỗi xử lý
        filterChain.doFilter(request, response);
    }

    /**
     * Hàm phụ trợ: Lấy chuỗi Bearer token từ Header 'Authorization'
     * Ví dụ Header: "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5..."
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        // Lấy giá trị chuỗi trong header Authorization
        String bearerToken = request.getHeader(HttpHeaders.AUTHORIZATION);

        // Kiểm tra chuỗi có tồn tại và bắt đầu bằng chữ "Bearer " hay không
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            // Cắt bỏ 7 ký tự đầu ("Bearer ") để lấy riêng phần mã token phía sau
            return bearerToken.substring(7);
        }
        // Nếu không có header hoặc không đúng chuẩn thì trả về null
        return null;
    }
}
