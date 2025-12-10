package com.example.demo.service;

import com.example.demo.entity.Message;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.model.UserWithLastMessage;
import com.example.demo.repository.MessageRepository;
import com.example.demo.repository.RoleRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChatService {

    @Autowired
    private MessageRepository messageRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private MessageService messageService;

    // Lấy danh sách người dùng có thể nhắn tin cho admin (tất cả người dùng)
    public List<UserWithLastMessage> getChatUsersForAdmin(User adminUser) {
        List<User> allUsers = userRepository.findAll();
        List<UserWithLastMessage> result = new ArrayList<>();
        
        for (User user : allUsers) {
            if (!user.getMaNguoiDung().equals(adminUser.getMaNguoiDung())) {
                // Lấy tin nhắn cuối cùng giữa hai người
                List<Message> conversation = messageRepository.findConversationBetweenUsers(adminUser, user);
                if (!conversation.isEmpty()) {
                    Message lastMessage = conversation.get(conversation.size() - 1);
                    boolean isUnread = !lastMessage.getDaDoc() && !lastMessage.getSender().getMaNguoiDung().equals(adminUser.getMaNguoiDung());
                    result.add(new UserWithLastMessage(user, lastMessage.getNoiDung(), lastMessage.getThoiGianGui(), isUnread));
                } else {
                    result.add(new UserWithLastMessage(user, "Bắt đầu cuộc trò chuyện", null, false));
                }
            }
        }
        
        // Sắp xếp theo thời gian tin nhắn cuối cùng
        result.sort((u1, u2) -> {
            if (u1.getLastMessageTime() == null && u2.getLastMessageTime() == null) return 0;
            if (u1.getLastMessageTime() == null) return 1;
            if (u2.getLastMessageTime() == null) return -1;
            return u2.getLastMessageTime().compareTo(u1.getLastMessageTime());
        });
        
        return result;
    }

    // Lấy danh sách admin để nhắn tin cho nhà tuyển dụng
    public List<UserWithLastMessage> getAdminsForEmployer(User employerUser) {
        Optional<Role> adminRole = roleRepository.findByTenVaiTro("ADMIN");
        if (!adminRole.isPresent()) {
            return new ArrayList<>();
        }

        List<User> adminUsers = userRepository.findByRole(adminRole.get());
        List<UserWithLastMessage> result = new ArrayList<>();

        for (User admin : adminUsers) {
            // Lấy tin nhắn cuối cùng giữa NTD và admin
            List<Message> conversation = messageRepository.findConversationBetweenUsers(employerUser, admin);
            if (!conversation.isEmpty()) {
                Message lastMessage = conversation.get(conversation.size() - 1);
                boolean isUnread = !lastMessage.getDaDoc() && !lastMessage.getSender().getMaNguoiDung().equals(employerUser.getMaNguoiDung());
                result.add(new UserWithLastMessage(admin, lastMessage.getNoiDung(), lastMessage.getThoiGianGui(), isUnread));
            } else {
                result.add(new UserWithLastMessage(admin, "Bắt đầu cuộc trò chuyện", null, false));
            }
        }

        // Sắp xếp theo thời gian tin nhắn cuối cùng
        result.sort((u1, u2) -> {
            if (u1.getLastMessageTime() == null && u2.getLastMessageTime() == null) return 0;
            if (u1.getLastMessageTime() == null) return 1;
            if (u2.getLastMessageTime() == null) return -1;
            return u2.getLastMessageTime().compareTo(u1.getLastMessageTime());
        });

        return result;
    }

    // Lấy danh sách ứng viên đã ứng tuyển vào công ty của nhà tuyển dụng
    public List<UserWithLastMessage> getApplicantsForEmployer(User employerUser) {
        // Giả định: NTD có công ty, và công ty có các ứng viên ứng tuyển
        // Dựa trên bảng applied_jobs để tìm các ứng viên
        List<User> applicantUsers = userRepository.findApplicantsByEmployer(employerUser.getMaNguoiDung());
        List<UserWithLastMessage> result = new ArrayList<>();
        
        for (User applicant : applicantUsers) {
            // Lấy tin nhắn cuối cùng giữa NTD và ứng viên
            List<Message> conversation = messageRepository.findConversationBetweenUsers(employerUser, applicant);
            if (!conversation.isEmpty()) {
                Message lastMessage = conversation.get(conversation.size() - 1);
                boolean isUnread = !lastMessage.getDaDoc() && !lastMessage.getSender().getMaNguoiDung().equals(employerUser.getMaNguoiDung());
                result.add(new UserWithLastMessage(applicant, lastMessage.getNoiDung(), lastMessage.getThoiGianGui(), isUnread));
            } else {
                result.add(new UserWithLastMessage(applicant, "Bắt đầu cuộc trò chuyện", null, false));
            }
        }
        
        // Sắp xếp theo thời gian tin nhắn cuối cùng
        result.sort((u1, u2) -> {
            if (u1.getLastMessageTime() == null && u2.getLastMessageTime() == null) return 0;
            if (u1.getLastMessageTime() == null) return 1;
            if (u2.getLastMessageTime() == null) return -1;
            return u2.getLastMessageTime().compareTo(u1.getLastMessageTime());
        });
        
        return result;
    }

    // Lấy tin nhắn giữa hai người dùng
    public List<Message> getConversation(User user1, User user2) {
        return messageRepository.findConversationBetweenUsers(user1, user2);
    }

    // Đánh dấu tin nhắn là đã đọc
    public void markMessagesAsRead(User receiver, User sender) {
        List<Message> messages = messageRepository.findBySenderAndReceiver(sender, receiver);
        for (Message message : messages) {
            if (!message.getDaDoc()) {
                message.setDaDoc(true);
                messageService.saveMessage(message);
            }
        }
    }
}