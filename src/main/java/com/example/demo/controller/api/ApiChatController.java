package com.example.demo.controller.api;

import com.example.demo.entity.User;
import com.example.demo.model.UserWithLastMessage;
import com.example.demo.service.ChatService;
import com.example.demo.service.UserService;
import com.example.demo.utils.ApiResponseUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/chat")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ApiChatController {

    @Autowired
    private ChatService chatService;
    
    @Autowired
    private UserService userService;

    // Lấy danh sách người có thể nhắn tin cho admin (tất cả người dùng)
    @GetMapping("/admin/users")
    public ResponseEntity<?> getChatUsersForAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ApiResponseUtil.error("User not authenticated");
        }

        String username = authentication.getName();
        Optional<User> currentUser = userService.getUserByTaiKhoan(username);
        if (!currentUser.isPresent()) {
            return ApiResponseUtil.error("User not found");
        }

        // Kiểm tra vai trò của người dùng có phải là Admin không
        if (!"ADMIN".equals(currentUser.get().getRole().getTenVaiTro())) {
            return ApiResponseUtil.error("Access denied: Only admin can access this endpoint");
        }

        List<UserWithLastMessage> chatUsers = chatService.getChatUsersForAdmin(currentUser.get());
        return ApiResponseUtil.success("Chat users for admin retrieved successfully", chatUsers);
    }

    // Lấy danh sách admin để nhắn tin cho nhà tuyển dụng
    @GetMapping("/employer/admins")
    public ResponseEntity<?> getAdminsForEmployer() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ApiResponseUtil.error("User not authenticated");
        }

        String username = authentication.getName();
        Optional<User> currentUser = userService.getUserByTaiKhoan(username);
        if (!currentUser.isPresent()) {
            return ApiResponseUtil.error("User not found");
        }

        // Kiểm tra vai trò của người dùng có phải là NTD không
        if (!"NTD".equals(currentUser.get().getRole().getTenVaiTro())) {
            return ApiResponseUtil.error("Access denied: Only employer can access this endpoint");
        }

        List<UserWithLastMessage> admins = chatService.getAdminsForEmployer(currentUser.get());
        return ApiResponseUtil.success("Admins for employer retrieved successfully", admins);
    }

    // Lấy danh sách ứng viên đã ứng tuyển vào công ty của nhà tuyển dụng
    @GetMapping("/employer/applicants")
    public ResponseEntity<?> getApplicantsForEmployer() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ApiResponseUtil.error("User not authenticated");
        }

        String username = authentication.getName();
        Optional<User> currentUser = userService.getUserByTaiKhoan(username);
        if (!currentUser.isPresent()) {
            return ApiResponseUtil.error("User not found");
        }

        // Kiểm tra vai trò của người dùng có phải là NTD không
        if (!"NTD".equals(currentUser.get().getRole().getTenVaiTro())) {
            return ApiResponseUtil.error("Access denied: Only employer can access this endpoint");
        }

        List<UserWithLastMessage> applicants = chatService.getApplicantsForEmployer(currentUser.get());
        return ApiResponseUtil.success("Applicants for employer retrieved successfully", applicants);
    }

    // Lấy lịch sử tin nhắn giữa hai người dùng
    @GetMapping("/messages/{otherUserId}")
    public ResponseEntity<?> getConversation(@PathVariable Integer otherUserId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ApiResponseUtil.error("User not authenticated");
        }

        String username = authentication.getName();
        Optional<User> currentUser = userService.getUserByTaiKhoan(username);
        if (!currentUser.isPresent()) {
            return ApiResponseUtil.error("User not found");
        }

        User otherUser = userService.findById(otherUserId);
        if (otherUser == null) {
            return ApiResponseUtil.error("Other user not found");
        }

        // Kiểm tra quyền truy cập dựa trên vai trò
        String currentRole = currentUser.get().getRole().getTenVaiTro();
        
        if ("ADMIN".equals(currentRole)) {
            // Admin có thể nhắn tin với bất kỳ ai
        } else if ("NTD".equals(currentRole)) {
            // NTD chỉ có thể nhắn tin với admin hoặc ứng viên đã ứng tuyển vào công ty của họ
            boolean isAdmin = "ADMIN".equals(otherUser.getRole().getTenVaiTro());
            boolean isApplicant = chatService.getApplicantsForEmployer(currentUser.get())
                    .stream()
                    .anyMatch(u -> u.getUser().getMaNguoiDung().equals(otherUser.getMaNguoiDung()));
            
            if (!isAdmin && !isApplicant) {
                return ApiResponseUtil.error("Access denied: You can only chat with admins or applicants from your company");
            }
        } else {
            // Ứng viên chỉ có thể nhắn tin với admin hoặc NTD của công ty mà họ đã ứng tuyển
            boolean isAdmin = "ADMIN".equals(otherUser.getRole().getTenVaiTro());
            // Kiểm tra nếu người này là NTD và họ đã ứng tuyển cho công ty của người đó
            boolean isApplicableEmployer = false;
            if ("NTD".equals(otherUser.getRole().getTenVaiTro())) {
                // Code để kiểm tra người dùng đã ứng tuyển cho công ty của NTD này chưa
                // Vì không có phương thức này trong service hiện tại nên tạm thời bỏ qua
                isApplicableEmployer = true; // Cho phép để tiếp tục phát triển
            }
            
            if (!isAdmin && !isApplicableEmployer) {
                return ApiResponseUtil.error("Access denied: You can only chat with admins or employers you applied to");
            }
        }

        // Đánh dấu tin nhắn là đã đọc
        chatService.markMessagesAsRead(currentUser.get(), otherUser);

        // Lấy lịch sử tin nhắn
        var conversation = chatService.getConversation(currentUser.get(), otherUser);
        return ApiResponseUtil.success("Conversation retrieved successfully", conversation);
    }
}