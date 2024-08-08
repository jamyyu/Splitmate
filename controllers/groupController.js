import 'dotenv/config';
import { uploadFileToS3 } from '../services/S3.js';
import { createGroup } from '../models/groupModel.js';
import { createMember, getMemberByEmail } from '../models/memberModel.js';
import { getUserByEmail } from '../models/userModel.js';
import { addMemberToGroup } from '../models/groupMemberModel.js';
import validator from 'validator';


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


export const uploadGroupData = async (req, res) => {
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
    const groupResults = await createGroup(plainBody.groupName, plainBody.mainCurrency, imageName)
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
    res.status(500).send('Error uploading file');
  }
};

export const getGroup = async (req, res) => {
  image_url = 'https://d3q4cpn0fxi6na.cloudfront.net/' + image_name;
  
}

