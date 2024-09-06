// 模擬數據庫的訂閱信息數組
const subscriptions = [];

// 添加新的訂閱
export const addSubscription = (subscription, groupId) => {
  const exists = subscriptions.find((sub) => sub.endpoint === subscription.endpoint);
  if (exists) {
    console.log('訂閱已存在，檢查是否訂閱該群組'); 
    // 如果訂閱已存在，檢查是否已訂閱該群組
    if (!exists.groupIds.includes(groupId)) {
      exists.groupIds.push(groupId); // 添加新的群組ID
      console.log('添加新的群組ID:', JSON.stringify(exists.groupIds));
    }
  } else {
    console.log('訂閱不存在，創建新的訂閱');
    // 如果訂閱不存在，創建新的訂閱並將群組ID存儲在數組中
    subscription.groupIds = [groupId];
    subscriptions.push(subscription);
    console.log('subscriptions：' + JSON.stringify(subscriptions));
  }
};

// 獲取某個群組的所有訂閱信息
export const getSubscriptionsByGroup = (groupId) => {
  return subscriptions.filter((sub) => sub.groupIds.includes(groupId));
};