import 'dotenv/config';
import { uploadFileToS3 } from '../services/S3.js';
import { createGroup, getGroup } from '../models/groupModel.js';
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
    // 將 req.body 轉換為普通對象
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
    console.log('groupId',groupId);
    // 資料存入成員資料庫
    const memberResults = await Promise.all(plainBody.members.map(async member => {
      let memberEmail = member.email;
      let memberId;
      let memberData = await getMemberByEmail(memberEmail);
      if (!memberData){
        memberId = await createMember(member.name, memberEmail);
      }else{
        memberId = memberData.id;
      }
      console.log('memberId', memberId);
      return {memberId, memberEmail};
    }));
    // 資料存入群組成員關聯資料庫
      await Promise.all(memberResults.map(async ({ memberId, memberEmail }, index) => {
      let userId = null;
      const userResults = await getUserByEmail(memberEmail);
      if (userResults) {
        userId = userResults.id;
      }
      const role = index === 0 ? 'admin' : 'member';
      await addMemberToGroup(groupId, memberId, userId, role);
    }));    
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).send('Error uploading file');
  }
};


export const getGroupsData = async (req, res) => {
  // 會員驗證
  const token = req.headers.authorization?.split(' ')[1];
  let userId;
  try {
    const payload = jwt.verify(token, secretKey, { algorithms: ['HS256'] });
    userId = payload.id;
  } catch (error) {
    return res.status(403).json({ error: true, message: 'Not logged in, access denied' });
  }
  // 以 userId 取得其所在 groupId 取得群組名稱跟圖片
  try {
    const groupIdResults = await getGroupByUserId(userId);
    // 檢查是否有群組
    if (groupIdResults === null) {
      return res.status(200).json({ data: [], message: 'No groups found' });
    }
    const groupsData = await Promise.all(groupIdResults.map(async group => {
      let groupId = group.splitgroup_id;
      let groupData = await getGroup(groupId);
      groupData = groupData[0];
      //let memberIdResults = await getMemberByGroupId(groupId);
      //let memberId = memberIdResults.map(member => member.member_id);
      return groupData;
    }));
    console.log('結果',groupsData);
    // image_name 改成 imageUrl
    const updatedgroupsData = groupsData.map(data => {
      const imageUrl = 'https://d3q4cpn0fxi6na.cloudfront.net/' + data.image_name;
      return {
        ...data,  // 保留其他字段
          image_url: imageUrl // 添加新的 image_url 字段
      };
    });
    console.log('結果',updatedgroupsData);
    res.status(200).json({ data: updatedgroupsData });
  } catch (error) {
    return res.status(400).json({ error: true, message: error });
  }
}

