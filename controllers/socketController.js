import { storeMessages, getMessages } from '../models/messagesModel.js';


export function setupSocketIO(io) {
  io.on('connection', async(socket) => {
    console.log('新用戶已連接: ' + socket.id);

    // 當客戶端連接時，處理加入群組的邏輯
    socket.on('joinGroup', async(groupId) => {
      // 檢查用戶是否已在該群組中，以防止重複加入
      const roomName = `group_${groupId}`;
      if (!socket.rooms.has(roomName)) {
        socket.join(roomName); // 將用戶加入到該群組的房間
        console.log(`用戶 ${socket.id} 加入群組 ${groupId}`);
        // 在 socket 物件上儲存 groupId
        socket.groupId = groupId;
        // 加載舊消息
        if (!socket.recovered) { // 確保只有第一次會執行
          socket.recovered = true;
          console.log('開始載入歷史消息...');
          getMessages(groupId).then((messages) => {
            messages.forEach((data) => {
              const { splitgroup_id: groupId, user_id: userId, user_name: userName, content, created_at: timestamp } = data;
              const formattedData = { groupId, userId, userName, content, timestamp };
              socket.emit('oldMessage', formattedData);
            });
          }).catch((error) => {
            console.error('載入歷史消息失敗:', error);
          });
        }
      }
    });

    // 處理收到的消息
    socket.on('sendMessage', async(data, clientOffset, callback) => {
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