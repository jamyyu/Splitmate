import 'dotenv/config';
import { uploadFileToS3 } from '../services/S3.js';
import { createExpense, getExpense, getGroupBalance} from '../models/expenseModel.js';
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


export const getExpenseData = async (req, res) => {
  // 會員驗證
  const token = req.headers.authorization?.split(' ')[1];
  console.log(token);
  try {
    const payload = jwt.verify(token, secretKey, { algorithms: ['HS256'] });
  } catch (error) {
    return res.status(403).json({ error: true, message: 'Not logged in, access denied' });
  }
  try {
    // 獲取路由中的 groupId 參數
    const groupId = req.params.groupId;
    let results = await getExpense(groupId);
  
    // 確保 result.date 是字符串
    results.forEach(result => {
      const dateObj = new Date(result.date); 
      const dateOnly = dateObj.toISOString().split('T')[0]; // 提取 YYYY-MM-DD 部分
      result.date = dateOnly;

      // 檢查並處理 amount 和 paid_amount
      result.amount = removeTrailingZeros(result.amount);
      result.paid_amount = removeTrailingZeros(result.paid_amount);

      // 處理每個成員的金額
      if (result.member_amount) {
        result.member_amount = removeTrailingZeros(result.member_amount);
      }
    });
  
    // 按日期和 expense_id 進行分組
    const groupedByDate = results.reduce((acc, curr) => {
      if (!acc[curr.date]) {
        acc[curr.date] = {};
      }
      if (!acc[curr.date][curr.expense_id]) {
        acc[curr.date][curr.expense_id] = {
          expense_id: curr.expense_id,
          date: curr.date,
          time: curr.time,
          category: curr.category,
          item: curr.item,
          currency: curr.currency,
          amount: curr.amount,
          payer: curr.payer,
          paid_amount: curr.paid_amount,
          members: []
        };
      }
      acc[curr.date][curr.expense_id].members.push({
        member: curr.member,
        member_amount: curr.member_amount
      });
      return acc;
    }, {});
  
    // 將分組後的數據排序
    const sortedGroupedByDate = Object.keys(groupedByDate)
      .sort((a, b) => new Date(b) - new Date(a)) // 先按日期降序排列
      .map(date => {
        return {
          date,
          expenses: Object.values(groupedByDate[date]).sort((a, b) => b.expense_id - a.expense_id) // 按 expense_id 降序排列
        };
      });
  
    // 返回排序後的數據
    res.status(200).json({ expenseData: sortedGroupedByDate });
    console.log(JSON.stringify(sortedGroupedByDate, null, 2));
  } catch (error) {
    return res.status(400).json({ error: true, message: error.message });
  }
};


function removeTrailingZeros(value) {
  if (typeof value === 'string') {
    value = parseFloat(value);  // 將字符串轉換為數字
  }
  if (typeof value === 'number') {
    const formattedValue = parseFloat(value.toFixed(4)).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4
    });
    return formattedValue;
  }
  return value;
}


export const getGroupBalanceData = async (req, res) => {
  // 會員驗證
  const token = req.headers.authorization?.split(' ')[1];
  console.log(token);
  try {
    const payload = jwt.verify(token, secretKey, { algorithms: ['HS256'] });
  } catch (error) {
    return res.status(403).json({ error: true, message: 'Not logged in, access denied' });
  }
  try{
    const groupId = req.params.groupId;
    let groupBalanceData = await getGroupBalance(groupId);
    res.status(200).json({ groupBalanceData: groupBalanceData });
    console.log(JSON.stringify(groupBalanceData, null, 2));
  } catch (error) {
    return res.status(400).json({ error: true, message: error.message });
  }
}
