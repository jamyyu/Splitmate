import bcrypt from 'bcrypt';
import { searchUserEmail, createUser, getUserByEmail } from '../models/userModel.js';
import dotenv from 'dotenv';
import validator from 'validator';
import jwt from 'jsonwebtoken';

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
    }else{
      const hashedPassword = await bcrypt.hash(password, 10);
      await createUser(name, email, hashedPassword);
      res.status(200).json({ ok: true });
    } 
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
    console.log(results);
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

