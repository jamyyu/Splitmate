export function setupSocketIO(io) {
  io.on('connection', (socket) => {
    console.log('新用戶已連接: ' + socket.id);

    // 用戶加入群組的事件處理
    socket.on('joinGroup', (groupId) => {
      socket.join(`group_${groupId}`); // 將用戶加入到該群組的房間
      console.log(`用戶 ${socket.id} 加入群組 ${groupId}`);
    });

    // 處理收到的消息
    socket.on('sendMessage', (data) => {
      const { groupId, userId, userName, message } = data;

      // 將消息發送給該群組的所有用戶
      io.to(`group_${groupId}`).emit('newMessage', data);
    });

    // 處理用戶斷開連接
    socket.on('disconnect', (reason) => {
      console.log(`用戶 ${socket.id} 已斷開連接，原因：${reason}`);
    });

    // 當客戶端成功連接時，檢查並重新加入群組
    socket.on('connect', () => {
      console.log('Socket重新連接成功:', socket.id);
      // 確保在重連後客戶端自動重新加入群組
      socket.emit('reconnectClient');
    });
  });
}