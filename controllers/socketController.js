import { storeMessages, getMessages } from '../models/messagesModel.js';

export function setupSocketIO(io) {
  io.on('connection', async (socket) => {
    console.log('新用戶已連接: ' + socket.id);

    // 當客戶端連接時，處理加入群組的邏輯
    socket.on('joinGroup', async (groupId) => {
      const roomName = `group_${groupId}`;
      // 檢查用戶是否已在該群組中，以防止重複加入
      if (!socket.rooms.has(roomName)) {
        socket.join(roomName); // 將用戶加入到該群組的房間
        console.log(`用戶 ${socket.id} 加入群組 ${groupId}`);
        // 在 socket 物件上儲存 groupId
        socket.groupId = groupId;
      }
    });

    // 載入歷史訊息
    socket.on('loadHistory', async (groupId) => {
      if (groupId && socket.groupId === groupId) {
        console.log('開始載入歷史消息...');
        try {
          const messages = await getMessages(groupId);
          messages.forEach((data) => {
            const { splitgroup_id: groupId, user_id: userId, user_name: userName, content, created_at: timestamp } = data;
            const formattedData = { groupId, userId, userName, content, timestamp };
            socket.emit('oldMessage', formattedData);
          });
        } catch (error) {
          console.error('載入歷史消息失敗:', error);
        }
      } else {
        console.log(`用戶 ${socket.id} 尚未加入群組 ${groupId} 或群組 ID 無效`);
      }
    });

    // 處理收到的消息
    socket.on('sendMessage', async (data, clientOffset, callback) => {
      const { groupId, userId, userName, content } = data;
      io.to(`group_${groupId}`).emit('newMessage', data);
      // 儲存消息
      process.nextTick(async () => {
        try {
          const id = await storeMessages(groupId, userId, clientOffset, content);
          if (callback) callback(); // 執行回調函數
        } catch (error) {
          console.error('儲存消息失敗:', error);
          socket.emit('chat message error', { error: '儲存消息到資料庫時失敗。' });
        }
      });
    });
    // 處理用戶斷開連接
    socket.on('disconnect', (reason) => {
      console.log(`用戶 ${socket.id} 已斷開連接，原因：${reason}`);
    });
  });
}