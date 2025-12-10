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
        
        this.stompClient.connect({}, function(frame) {
            console.log('Connected: ' + frame);
            
            // Đăng ký nhận tin nhắn cho người dùng hiện tại
            chatApp.stompClient.subscribe('/user/queue/messages', function(messageOutput) {
                chatApp.showMessageOutput(JSON.parse(messageOutput.body));
            });
        });
    },

    sendMessage: function() {
        var messageContent = document.getElementById('message-input').value;
        if (messageContent.trim() === '' || this.currentChatUserId === null) {
            return;
        }

        var chatMessage = {
            sender: this.currentUser.maNguoiDung + "",
            receiver: this.currentChatUserId + "",
            content: messageContent.trim(),
            type: 'CHAT',
            senderUsername: this.currentUser.taiKhoan,
            receiverUsername: document.getElementById('current-chat-user').textContent
        };

        // Thêm tin nhắn vào giao diện ngay lập tức trước khi gửi
        this.addMessageToUI(chatMessage.content, true);
        // Xóa ô nhập tin nhắn
        document.getElementById('message-input').value = '';

        // Gửi tin nhắn qua WebSocket
        this.stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
    },

    showMessageOutput: function(messageOutput) {
        // Kiểm tra xem tin nhắn có liên quan đến cuộc trò chuyện hiện tại không
        if (messageOutput.sender === this.currentUser.maNguoiDung + "" ||
            messageOutput.receiver === this.currentUser.maNguoiDung + "") {

            // Kiểm tra nếu tin nhắn là giữa người hiện tại và người đang trò chuyện
            if (this.currentChatUserId &&
                (messageOutput.sender == this.currentChatUserId ||
                 messageOutput.receiver == this.currentChatUserId)) {

                // Tin nhắn giữa người dùng hiện tại và người đang trò chuyện
                if (messageOutput.sender !== this.currentUser.maNguoiDung + "") {
                    // Tin nhắn nhận được
                    this.addMessageToUI(messageOutput.content, false);
                    // Cập nhật lại danh sách người dùng để đánh dấu đã đọc
                    this.updateUnreadStatus(messageOutput.sender);
                } else {
                    // Tin nhắn đã gửi, thêm vào UI
                    this.addMessageToUI(messageOutput.content, true);
                }
            } else {
                // Nếu tin nhắn không phải với người đang trò chuyện, cập nhật danh sách người trò chuyện
                this.updateUserListWithNewMessage(messageOutput);
            }
        }
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

                    if (message.sender.maNguoiDung === chatApp.currentUser.maNguoiDung) {
                        messageElement.classList.add('sent');
                    } else {
                        messageElement.classList.add('received');
                    }

                    messageElement.textContent = message.noiDung;
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