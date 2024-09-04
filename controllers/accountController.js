import 'dotenv/config';
import { addAccount, getAccountByUserId, deleteAccountById } from '../models/accountModel.js';
import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET_KEY;

export const uploadAccountData = async (req, res) => {
  // 會員驗證
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const payload = jwt.verify(token, secretKey, { algorithms: ['HS256'] });
  } catch (error) {
    return res.status(403).json({ error: true, message: 'Not logged in, access denied' });
  }
  try {
    const accountsData = req.body;
    await Promise.all(accountsData.map(async (data) => {
      const userId = data.user_id;
      const SWIFT = data.SWIFT;
      const bankAccountNumber = data.bankAccountNumber;

      // 呼叫 addAccount 函數來新增帳戶資料
      await addAccount(userId, SWIFT, bankAccountNumber);
    }));
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error', error);
    return res.status(500).json({ error: 'Failed to save account data' });
  }
}


export const getAccountData = async (req, res) => {
  // 會員驗證
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const payload = jwt.verify(token, secretKey, { algorithms: ['HS256'] });
  } catch (error) {
    return res.status(403).json({ error: true, message: 'Not logged in, access denied' });
  }
  try {
    const userId = req.params.userId;
    const results = await getAccountByUserId(userId);
    res.status(200).json({ accountsData: results });
  } catch (error) {
    console.error('Error', error);
    return res.status(500).json({ error: 'Failed to get account data' });
  }
}


export const deleteAccountData = async (req, res) => {
  // 會員驗證
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const payload = jwt.verify(token, secretKey, { algorithms: ['HS256'] });
  } catch (error) {
    return res.status(403).json({ error: true, message: 'Not logged in, access denied' });
  }
  try {
    const accountId = req.params.accountId;
    const results = await deleteAccountById(accountId);
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error', error);
    return res.status(500).json({ error: 'Failed to delete account data' });
  }
}