import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { searchUserEmail, createUser, getUserByEmail } from '../models/userModel.js';
import { getMemberByEmail } from '../models/memberModel.js';
import { updateGroupMemberMappingUserId } from '../models/groupMemberModel.js';


dotenv.config();
const secretKey = process.env.JWT_SECRET_KEY;

const client = new OAuth2Client({
  clientId : process.env.GOOGLE_CLIENT_ID,
  clientSecret : process.env.GOOGLE_SECRET_KEY,
  redirect_uri: 'https://splitmate.site/',
});

export const googleLogin = async (req, res) => {
  const { id_token } = req.body;
  try {
    // 驗證 ID Token
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.payload;
    // 取出用戶的資料
    const { name, email, sub } = payload;
    console.log(payload)
    // 從資料庫找用戶，已經存在的用戶直接登入
    let userEmail = await searchUserEmail(email);
    if (userEmail) {
      let results = await getUserByEmail(userEmail.email);
      let now = new Date();
      let expirationTimestamp = now.setDate(now.getDate() + 7);
      let expiration = new Date(expirationTimestamp); // 7 days
      let payload = {
        id: results.id,
        name: results.name,
        email: results.email,
        imageName: results.image_name,
        exp: Math.floor(expiration.getTime() / 1000) // 以秒為單位
      };
      const token = jwt.sign(payload, secretKey, { algorithm: 'HS256' });
      return res.status(200).json({ token });
    } else {
      const userId = await createUser(name, email, sub);
      // 檢查此電子郵件是否已是成員
      const existingMember = await getMemberByEmail(email);
      if (existingMember !== null) {
        const memberId = existingMember.id;
        await updateGroupMemberMappingUserId(userId, memberId);
      }
      let userEmail = await searchUserEmail(email);
      let results = await getUserByEmail(userEmail.email);
      let now = new Date();
      let expirationTimestamp = now.setDate(now.getDate() + 7);
      let expiration = new Date(expirationTimestamp); // 7 days
      let payload = {
        id: results.id,
        name: results.name,
        email: results.email,
        imageName: results.image_name,
        exp: Math.floor(expiration.getTime() / 1000) // 以秒為單位
      };
      const token = jwt.sign(payload, secretKey, { algorithm: 'HS256' });
      return res.status(200).json({ token });
    }
  } catch (error) {
    console.error('Error verifying Google ID token:', error);
    res.status(401).json({ message: 'Invalid Google ID token' });
  }
};