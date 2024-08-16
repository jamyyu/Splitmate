import 'dotenv/config';
import { uploadFileToS3 } from '../services/S3.js';
import { createExpense } from '../models/expenseModel.js';
import { addPayer } from '../models/payerModel.js';
import { addSplitMember } from '../models/splitMemberModel.js';
import jwt from 'jsonwebtoken';



export const getExchangeRate = async (req, res) => {
  const { mainCurrency, currency } = req.query;
  console.log(mainCurrency, currency)
  try {
    // 向第三方匯率 API 發送請求
    const response = await fetch(`https://v6.exchangerate-api.com/v6/a664377d1b9acb7d3f693b44/latest/${currency}`);
    const result = await response.json();
    const currencyRate = result.conversion_rates[mainCurrency];
    // 如果指定貨幣的匯率存在，則返回
    if (currencyRate) {
      res.status(200).json({ exchangeRate: currencyRate});
    } else {
      res.status(404).json({ error: 'Currency not found' });
    }
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    res.status(500).json({ error: 'Failed to fetch exchange rate' });
  }
}


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

export const uploadExpenseData = async (req, res) => {
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
    // 將 req.body 轉換為普通物件
    const plainBody = convertToPlainObject(req.body);
    console.log(plainBody);
    console.log(imageName);
    // 資料存入費用資料庫
    const expenseId = await createExpense(plainBody.groupId, plainBody.date, plainBody.time, plainBody.category, plainBody.item, plainBody.currency, plainBody.amount, plainBody.exchangeRate, plainBody.mainCurrencyAmount, plainBody.note, imageName);
    // 資料存入代墊資料庫
    await addPayer(expenseId, plainBody.payer, plainBody.amount, plainBody.mainCurrencyAmount);
    console.log()
    // 資料存入欠款資料庫
    const splitMembers = plainBody.splitMembers;
    const number = plainBody.splitMembers.length;
    let amount = plainBody.amount / number;
    let mainCurrencyAmount = plainBody.mainCurrencyAmount / number;
    for (let splitMember of splitMembers) {
      await addSplitMember(expenseId, splitMember, amount, mainCurrencyAmount);
    }
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error', error);
    return res.status(500).json({ error: 'Failed to save expense data' });
  }
}