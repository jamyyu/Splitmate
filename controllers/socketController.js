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
        if (!socket.recovered) {
          console.log('Connection state not recovered, attempting to fetch messages...');
          try {
            const messages = await getMessages(groupId);
            messages.forEach((data) => {
              const { splitgroup_id: groupId, user_id: userId, user_name: userName, content, created_at: timestamp } = data;
              const formattedData = { groupId, userId, userName, content, timestamp };
              socket.emit('oldMessage', formattedData);
            });
          } catch (error) {
            console.error('Failed to recover messages:', error); // 錯誤處理
          }
        }
      }
    });

    // 處理收到的消息
    socket.on('sendMessage', async(data, clientOffset, callback) => {
      const { groupId, userId, userName, content } = data;
      // 將消息發送給該群組的所有用戶
      io.to(`group_${groupId}`).emit('newMessage', data);
      let id;
      try {
        id = await storeMessages(groupId, userId, clientOffset, content);
        callback();
      } catch (error) {
        console.error('Failed to store message:', error);
        // 通知前端用戶發送失敗
        socket.emit('chat message error', { error: 'Failed to store message in the database.'});
        return;
      }
    });
    // 處理用戶斷開連接
    socket.on('disconnect', (reason) => {
      console.log(`用戶 ${socket.id} 已斷開連接，原因：${reason}`);
    });
  });
}