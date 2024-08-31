document.addEventListener("DOMContentLoaded", function () {
  // 初始化 Socket.IO 客戶端
  const socket = io('wss://splitmate.site', {
    reconnection: true, // 開啟自動重連
    reconnectionAttempts: Infinity, // 無限次重連
    reconnectionDelay: 1000, // 每次重連間隔1秒
    timeout: 20000, // 連接超時時間設置為20秒
  });

  const groupData = JSON.parse(sessionStorage.getItem('groupData'));
  const token = localStorage.getItem('token');
  const userData = parseJwt(token);
  const groupId = groupData.id;
  const userId = userData.id;
  const userName = userData.name;

  // 監聽 connect 事件，確保每次連接時都會自動加入群組
  socket.on('connect', () => {
    console.log('連接成功，加入群組');
    socket.emit('joinGroup', groupId); // 確保每次連接時加入群組
  });

  const chatWindow = document.getElementById('chat-window');
  const chatToggleBtn = document.getElementById('chat-toggle-btn'); // 聊天按鈕
  const closeChatBtn = document.getElementById('close-chat-btn');
  const sendButton = document.getElementById('send-button');
  const messageInput = document.getElementById('message-input');
  const chatBody = document.getElementById('chat-body');

  // 點擊聊天按鈕顯示/隱藏聊天視窗
  chatToggleBtn.addEventListener('click', function () {
    chatWindow.classList.toggle('show'); // 切換 "show" 類，顯示/隱藏聊天室
  });

  // 點擊關閉按鈕時隱藏聊天窗口
  closeChatBtn.addEventListener('click', function () {
    chatWindow.classList.remove('show'); // 移除 "show" 類，隱藏聊天室
  });

  // 發送消息
  sendButton.addEventListener('click', function () {
    sendMessage();
  });

  // 發送消息的函數
  function sendMessage() {
    const messageText = messageInput.value.trim();
    if (messageText) {
      const messageData = {
        groupId,
        userId,
        userName,
        message: messageText
      };

      // 發送消息到服務器
      socket.emit('sendMessage', messageData);

      // 將自己發送的消息顯示在右側
      displayMessage(messageData, 'right');

      // 清空輸入框
      messageInput.value = '';

      // 滾動到底部
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  }

  // 接收到新消息事件
  socket.on('newMessage', (data) => {
    if (data.userId !== userId) {
      // 顯示其他用戶的消息在左側
      displayMessage(data, 'left');
    }
  });

  // 監聽服務器發送的系統消息
  socket.on('systemMessage', (message) => {
    console.log(message); // 在控制台輸出系統消息
  });

  // 動態顯示消息的函數
  function displayMessage(data, side) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `message-${side}`);

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');
    contentDiv.textContent = data.message;
    messageDiv.appendChild(contentDiv);

    const infoDiv = document.createElement('div');
    infoDiv.classList.add('message-info');
    const senderSpan = document.createElement('span');
    senderSpan.classList.add('message-sender');
    senderSpan.textContent = side === 'left' ? data.userName : '你';
    const timeSpan = document.createElement('span');
    timeSpan.classList.add('message-time');
    timeSpan.textContent = new Date().toLocaleTimeString();
    infoDiv.appendChild(senderSpan);
    infoDiv.appendChild(timeSpan);

    messageDiv.appendChild(infoDiv);
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  // 按 Enter 鍵發送消息
  messageInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
      sendMessage();
    }
  });
});

function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join('')
  );
  return JSON.parse(jsonPayload);
}
