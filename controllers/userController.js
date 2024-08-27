import bcrypt from 'bcrypt';
import { searchUserEmail, createUser, getUserByEmail, updateUserData } from '../models/userModel.js';
import { getMemberByEmail } from '../models/memberModel.js';
import { updateGroupMemberMappingUserId } from '../models/groupMemberModel.js';
import dotenv from 'dotenv';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import { uploadFileToS3, deleteFilefromS3 } from '../services/S3.js';

dotenv.config();


export const signUp = async (req, res) => {
  const { name, email, password } = req.body;
  // Email 格式驗證
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: true, message: 'Invalid email format' });
  }
  try {
    const results = await searchUserEmail(email);
    if (results) {
      return res.status(400).json({ error: true, message: 'Email already registered' });
    }
    // 密碼加密
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await createUser(name, email, hashedPassword);
    // 查詢若已是 member 就更新 GroupMemberMapping 資料庫中的 userId
    const existingMember = await getMemberByEmail(email);
    if (existingMember !== null) {
      const memberId = existingMember.id;
      await updateGroupMemberMappingUserId(userId, memberId);
    }
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: true, message: 'Internal Server Error' });
  }
};


const secretKey = process.env.JWT_SECRET_KEY;

export const signIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const results = await getUserByEmail(email);
    if (!results || !await bcrypt.compare(password, results.password)) {
      return res.status(400).json({ error: true, message: 'Invalid email or password' });
    }
    const now = new Date();
    const expirationTimestamp = now.setDate(now.getDate() + 7);
    const expiration = new Date(expirationTimestamp); // 7 days
    const payload = {
      id: results.id,
      name: results.name,
      email: results.email,
      imageName: results.image_name,
      exp: Math.floor(expiration.getTime() / 1000) // 以秒為單位
    };
    const token = jwt.sign(payload, secretKey, { algorithm: 'HS256' });
    return res.status(200).json({ token });
  } catch (error) {
    console.error('Error during sign in:', error);
    return res.status(500).json({ error: true, message: 'Internal Server Error' });
  }
};


export const checkAuth = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(200).json({ data: "null" });
  }
  try {
    const payload = jwt.verify(token, secretKey, { algorithms: ['HS256'] });
    return res.status(200).json({ data: { id: payload.id, name: payload.name, email: payload.email } });
  } catch (error) {
    return res.status(200).json({ data: "null" });
  }
};


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


export const patchUserProfile = async (req, res) => {
  // 會員驗證
  let token = req.headers.authorization?.split(' ')[1];
  let email;
  let originImageName;
  try {
    let payload = jwt.verify(token, secretKey, { algorithms: ['HS256'] });
    email = payload.email;
    originImageName = payload.imageName;
  } catch (error) {
    return res.status(403).json({ error: true, message: 'Not logged in, access denied' });
  }
  try {
    // 將 req.body 轉換為普通對象
    const plainBody = convertToPlainObject(req.body);
    // 圖片更新
    let newImageName = originImageName;
    if (req.file) {
      if (originImageName) {
        await deleteFilefromS3(originImageName); 
      }
      const data = await uploadFileToS3(req.file);
      newImageName = data.key;
      if (data.$metadata.httpStatusCode !== 200) {
        return res.status(500).json({ 'message': 'Image upload failed', 'details': data });
      }
    }
    // 資料存入 user 資料庫
    let userName = plainBody.userName;
    await updateUserData(userName, newImageName, email);
    // 生成新的 token
    const results = await getUserByEmail(email);
    const now = new Date();
    const expirationTimestamp = now.setDate(now.getDate() + 7);
    const expiration = new Date(expirationTimestamp); // 7 days
    const payload = {
      id: results.id,
      name: results.name,
      email: results.email,
      imageName : results.image_name,
      exp: Math.floor(expiration.getTime() / 1000) // 以秒為單位
    };
    console.log(payload);
    token = jwt.sign(payload, secretKey, { algorithm: 'HS256' });
    return res.status(200).json({ token });
  } catch (error) {
    console.error('Error', error);
    return res.status(500).json({ error: true, message: 'Internal Server Error' });
  }
};