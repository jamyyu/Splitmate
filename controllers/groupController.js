import 'dotenv/config';
import { uploadFileToS3 } from '../services/S3.js';
import { createGroup } from '../models/groupModel.js';
import { createMember, getMemberByEmail } from '../models/memberModel.js';
import { getUserByEmail } from '../models/userModel.js';
import { addMemberToGroup, getGroupByUserId, getMemberByGroupId} from '../models/groupMemberModel.js';
import validator from 'validator';
import jwt from 'jsonwebtoken';


// 將沒有原型的物件轉換為普通物件
function convertToPlainObject(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(convertToPlainObject); //如果是陣列，每個值都進去檢查產生新陣列
  }
  const plainObject = {};
  for (const [key, value] of Object.entries(obj)) {
    plainObject[key] = convertToPlainObject(value);
  }
  return plainObject;
}


const secretKey = process.env.JWT_SECRET_KEY;

export const uploadGroupData = async (req, res) => {
  // 會員驗證
  const token = req.headers.authorization?.split(' ')[1];
  console.log(token);
  try {
    const payload = jwt.verify(token, secretKey, { algorithms: ['HS256'] });
  } catch (error) {
    return res.status(403).json({ error: true, message: 'Not logged in, access denied' });
  }
  try {
    // 圖片上傳至S3
    let imageName = null;
    if (req.file) {
      const data = await uploadFileToS3(req.file);
      imageName = data.key;
      if (data.$metadata.httpStatusCode !== 200) {
        return res.status(500).json({ 'message': 'Image upload failed', 'details': data });
      }
    }
    // 將 req.body 轉換為普通
    const plainBody = convertToPlainObject(req.body);
    console.log(plainBody);
    console.log(imageName);
    // 驗證成員電子郵件
    for (let member of plainBody.members) {
      if (!validator.isEmail(member.email)) {
        return res.status(400).json({ error: true, message: `${member.name} 的電子郵件格式錯誤` });
      }
    }
    // 資料存入群組資料庫
    const groupResults = await createGroup(plainBody.groupName, plainBody.mainCurrency, imageName);
    let groupId = groupResults;
    // 資料存入成員資料庫
    const memberResults = await Promise.all(plainBody.members.map(async member => {
      let memberEmail = member.email;
      let memberName = member.name;
      let memberId;
      let memberData = await getMemberByEmail(memberEmail);
      if (!memberData) {
        // 如果這個email尚未註冊過，則創建新成員
        memberId = await createMember(memberEmail);
      } else {
        // 如果這個email已經註冊過，則使用現有的成員ID
        memberId = memberData.id;
      }
      return { memberId, memberEmail, memberName };
    }));
    // 資料存入群組成員關聯資料庫
    await Promise.all(memberResults.map(async ({ memberId, memberEmail, memberName }, index) => {
      let userId = null;
      const userResults = await getUserByEmail(memberEmail);
      if (userResults) {
        userId = userResults.id;
      }
      const role = index === 0 ? 'admin' : 'member'; // 第一個成員設置為群組管理員
      // 將成員加入群組
      await addMemberToGroup(groupId, memberId, memberName, userId, role);
    }));

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error saving members or adding them to the group:', error);
    return res.status(500).send('Error saving members or adding them to the group');
  }
}


export const getGroupsData = async (req, res) => {
  // 會員驗證
  const token = req.headers.authorization?.split(' ')[1];
  let userId;
  try {
    const payload = jwt.verify(token, secretKey, { algorithms: ['HS256'] });
    userId = payload.id;
  } catch (error) {
    console.error('JWT 驗證失敗:', error);
    return res.status(403).json({ error: true, message: 'Not logged in, access denied' });
  }
  try {
    // 以 userId 取得其所在 groupId 取得群組名稱跟圖片
    const groupsData = await getGroupByUserId(userId);
    // 檢查是否有群組
    if (!groupsData || groupsData.length === 0) {
      return res.status(200).json({ data: [], message: 'No groups found' });
    }
    // image_name 改成 image_url
    const updatedGroupsData = groupsData.map(({ image_name, ...rest }) => {
      const imageUrl = `https://d3q4cpn0fxi6na.cloudfront.net/${image_name}`;
      return { ...rest, image_url: imageUrl }; // 使用解構賦值並添加新的 image_url 字段
    });
    console.log('結果', updatedGroupsData);
    res.status(200).json({ data: updatedGroupsData });
  } catch (error) {
    console.error('資料庫查詢失敗:', error);
    return res.status(400).json({ error: true, message: error.message || error });
  }
};


export const getGroupData = async (req, res) => {
  // 會員驗證
  const token = req.headers.authorization?.split(' ')[1];
  let userId;
  try {
    const payload = jwt.verify(token, secretKey, { algorithms: ['HS256'] });
    userId = payload.id;
  } catch (error) {
    console.error('JWT 驗證失敗:', error);
    return res.status(403).json({ error: true, message: 'Not logged in, access denied' });
  }  
  try {
    // 獲取路由中的 groupId 參數
    const groupId = req.params.groupId;
    const results = await getMemberByGroupId(groupId);
    if (results.length === 0) {
      return res.status(404).json({ error: true, message: 'Group not found' });
    }
    // 提取群組的基本資料
    const groupData = {
      id: results[0].splitgroup_id,
      name: results[0].group_name,
      main_currency: results[0].main_currency,
      image_name: results[0].group_image_name,
    };
    // 提取所有成員資料
    const memberData = results.map(result => ({
      member_id: result.member_id,
      member_name: result.member_name,
      role: result.role,
      user_id: result.user_id,
      user_name: result.user_name
    }));
    res.status(200).json({ groupData, memberData });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Internal Server Error' });
  }
};

