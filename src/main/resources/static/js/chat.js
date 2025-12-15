// Chat functionality
var chatApp = {
    stompClient: null,
    currentUser: null,
    currentChatUserId: null,
    isChattingWithAdmin: false,

    init: function(currentUser) {
        this.currentUser = currentUser;
        this.connect();
    },

    connect: function() {
        var socket = new SockJS('/ws');
        this.stompClient = Stomp.over(socket);

        // Lấy thông tin người dùng hiện tại để đảm bảo kênh đúng
        var self = this;
        this.stompClient.connect({}, function(frame) {
            console.log('Connected: ' + frame);

            // Đăng ký nhận tin nhắn cho người dùng hiện tại
            // Cấu trúc kênh: /user/queue/messages
            chatApp.stompClient.subscribe('/user/queue/messages', function(messageOutput) {
                console.log('WebSocket nhận được tin nhắn:', messageOutput.body);
                chatApp.showMessageOutput(JSON.parse(messageOutput.body));
            });

            // Đăng ký nhận thông báo reload
            chatApp.stompClient.subscribe('/user/queue/reload', function(reloadOutput) {
                console.log('WebSocket nhận được yêu cầu reload:', reloadOutput.body);
                // Load lại trang ngay lập tức khi nhận được thông báo reload
                location.reload();
            });

            // Thêm log để theo dõi
            console.log('Đã đăng ký kênh nhận tin nhắn: /user/queue/messages');
            console.log('Đã đăng ký kênh nhận reload: /user/queue/reload');
        });

        // Ghi lại thời gian cuối cùng nhận tin nhắn
        this.lastMessageTime = Date.now();

        // Cơ chế kiểm tra định kỳ nếu không nhận được tin nhắn qua WebSocket
        setInterval(function() {
            // Nếu không nhận tin nhắn qua WebSocket trong 10 giây, load lại trang
            if (Date.now() - self.lastMessageTime > 10000 && self.currentChatUserId) {
                console.log('Không nhận được tin nhắn trong 10s, tiến hành load lại trang');
                location.reload();
            }
        }, 3000); // Kiểm tra mỗi 3 giây
    },

    // Cập nhật thời gian nhận tin nhắn cuối cùng
    updateLastMessageTime: function() {
        this.lastMessageTime = Date.now();
    },

    sendMessage: function() {
        var messageContent = document.getElementById('message-input').value;
        if (messageContent.trim() === '' || this.currentChatUserId === null) {
            return;
        }

        var chatMessage = {
            senderId: this.currentUser.maNguoiDung,
            receiverId: this.currentChatUserId,
            content: messageContent.trim(),
            type: 'CHAT',
            senderUsername: this.currentUser.taiKhoan,
            receiverUsername: document.getElementById('current-chat-user').textContent
        };

        // Cập nhật thời gian gửi tin nhắn
        this.updateLastMessageTime();

        // Gửi tin nhắn qua WebSocket với xử lý lỗi
        try {
            this.stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        } catch (error) {
            console.error('Lỗi khi gửi tin nhắn qua WebSocket:', error);
        }

        // Xóa ô nhập tin nhắn
        document.getElementById('message-input').value = '';

        // Load lại trang sau khi gửi tin nhắn để đảm bảo cập nhật từ database
        setTimeout(function() {
            location.reload();
        }, 150); // Giảm thời gian chờ
    },

    showMessageOutput: function(messageOutput) {
        console.log('Nhận được tin nhắn từ WebSocket:', messageOutput);
        // Cập nhật thời gian nhận tin nhắn cuối cùng
        this.updateLastMessageTime();

        // Load lại trang sau khi nhận tin nhắn để cập nhật từ database
        setTimeout(function() {
            location.reload();
        }, 100); // Giảm thời gian chờ
    },

    updateUserListWithNewMessage: function(messageOutput) {
        // Cập nhật badge unread trong danh sách người dùng
        var userElement = document.querySelector('[data-userid="' + messageOutput.sender + '"]');
        if (userElement) {
            var badge = userElement.querySelector('.unread-badge');
            if (!badge) {
                var badgeHtml = '<small class="unread-badge">!</small>';
                userElement.querySelector('div:last-child').innerHTML = badgeHtml;
            }
        }
    },

    addMessageToUI: function(content, isSent) {
        var messagesContainer = document.getElementById('messages-container');

        // Đảm bảo rằng phần chọn chat prompt được ẩn đi
        var selectPrompt = document.getElementById('select-chat-prompt');
        if (selectPrompt) {
            selectPrompt.style.display = 'none';
        }

        // Tạo phần tử tin nhắn mới
        var messageElement = document.createElement('div');
        messageElement.classList.add('message-bubble');

        if (isSent) {
            messageElement.classList.add('sent');
        } else {
            messageElement.classList.add('received');
        }

        messageElement.textContent = content;
        messagesContainer.appendChild(messageElement);

        // Cuộn đến tin nhắn mới nhất
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },

    selectChat: function(userId, isAdmin) {
        this.currentChatUserId = userId;
        this.isChattingWithAdmin = isAdmin;

        // Lưu phiên trò chuyện vào localStorage
        localStorage.setItem('currentChatUserId', userId);
        localStorage.setItem('currentChatIsAdmin', isAdmin);

        // Cập nhật giao diện người dùng được chọn
        document.querySelectorAll('.chat-user').forEach(function(element) {
            element.classList.remove('active');
        });

        var selectedUser = document.querySelector('[data-userid="' + userId + '"]');
        if (selectedUser) {
            selectedUser.classList.add('active');
        }

        // Cập nhật tên người trò chuyện hiện tại
        var userElements = document.querySelectorAll('[data-userid="' + userId + '"]');
        if (userElements.length > 0) {
            var nameElement = userElements[0].querySelector('div:first-child div');
            if (nameElement) {
                document.getElementById('current-chat-user').textContent = nameElement.textContent;
            }
        }

        // Hiện giao diện trò chuyện
        document.getElementById('chat-header').style.display = 'block';
        document.getElementById('message-input-container').style.display = 'block';
        document.getElementById('select-chat-prompt').style.display = 'none';

        // Tải lịch sử tin nhắn
        this.loadConversation(userId);
    },

    updateUnreadStatus: function(senderId) {
        // Cập nhật badge unread trong danh sách người dùng
        var userElement = document.querySelector('[data-userid="' + senderId + '"]');
        if (userElement) {
            var badge = userElement.querySelector('.unread-badge');
            if (badge) {
                badge.remove();
            }
        }
    },

    loadConversation: function(userId) {
        fetch('/api/v1/chat/messages/' + userId, {
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                var messagesContainer = document.getElementById('messages-container');
                messagesContainer.innerHTML = '';

                data.data.forEach(function(message) {
                    var messageElement = document.createElement('div');
                    messageElement.classList.add('message-bubble');

                    // Kiểm tra xem tin nhắn là gửi hay nhận dựa trên StandardChatMessage
                    if (message.senderId === chatApp.currentUser.maNguoiDung) {
                        messageElement.classList.add('sent');
                    } else {
                        messageElement.classList.add('received');
                    }

                    messageElement.textContent = message.content;
                    messagesContainer.appendChild(messageElement);
                });

                messagesContainer.scrollTop = messagesContainer.scrollHeight;

                // Cập nhật tên người đang trò chuyện
                // Gọi hàm để lấy tên người dùng từ danh sách
                chatApp.updateCurrentChatUser(userId);

                // Đảm bảo rằng tiêu đề trò chuyện được cập nhật
                var userElements = document.querySelector('[data-userid="' + userId + '"] div:first-child div');
                if (userElements && userElements.textContent) {
                    document.getElementById('current-chat-user').textContent = userElements.textContent;
                }
            }
        });
    },

    updateCurrentChatUser: function(userId) {
        // Cập nhật tên người đang trò chuyện
        var userElement = document.querySelector('[data-userid="' + userId + '"]');
        if (userElement) {
            var nameElement = userElement.querySelector('div:first-child div');
            if (nameElement) {
                document.getElementById('current-chat-user').textContent = nameElement.textContent;
            }
        }
    }
};

// Tạo hàm toàn cục để HTML có thể gọi
function sendMessage() {
    chatApp.sendMessage();
}

// Hàm khôi phục phiên trò chuyện từ localStorage khi trang được load lại
function restorePreviousChatSession() {
    if (chatApp.currentUser) {
        var savedUserId = localStorage.getItem('currentChatUserId');
        var savedIsAdmin = localStorage.getItem('currentChatIsAdmin');

        if (savedUserId) {
            // Khôi phục phiên trò chuyện
            chatApp.selectChat(parseInt(savedUserId), savedIsAdmin === 'true');
        }
    }
}

// Gọi hàm khôi phục khi trang được load xong
document.addEventListener('DOMContentLoaded', function() {
    restorePreviousChatSession();
});