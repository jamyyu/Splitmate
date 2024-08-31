import 'dotenv/config';
import { uploadFileToS3 } from '../services/S3.js';
import { createExpense, getAllRecord, getGroupBalance, getExpense, deleteExpense} from '../models/expenseModel.js';
import { addPayer } from '../models/payerModel.js';
import { addSplitMember } from '../models/splitMemberModel.js';
import jwt from 'jsonwebtoken';



export const getExchangeRate = async (req, res) => {
  const { mainCurrency, currency } = req.query;
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
    // 解析 payer 和 splitMembers JSON 字串
    const payer = JSON.parse(plainBody.payer);
    const splitMembers = plainBody.splitMembers.map(member => JSON.parse(member));
    // 資料存入費用資料庫
    const expenseId = await createExpense(plainBody.groupId, plainBody.date, plainBody.time, plainBody.category, plainBody.item, plainBody.currency, plainBody.amount, plainBody.exchangeRate, plainBody.mainCurrencyAmount, plainBody.note, imageName);
    // 資料存入代墊資料庫
    await addPayer(expenseId, payer.payerMemberId, plainBody.amount, plainBody.mainCurrencyAmount);
    // 資料存入欠款資料庫
    const number = plainBody.splitMembers.length;
    let amount = plainBody.amount / number;
    let mainCurrencyAmount = plainBody.mainCurrencyAmount / number;
    for (let splitMember of splitMembers) {
      await addSplitMember(expenseId, splitMember.splitMembersMemberId, amount, mainCurrencyAmount);
    }
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error', error);
    return res.status(500).json({ error: 'Failed to save expense data' });
  }
}


export const getAllRecordData = async (req, res) => {
  // 會員驗證
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const payload = jwt.verify(token, secretKey, { algorithms: ['HS256'] });
  } catch (error) {
    return res.status(403).json({ error: true, message: 'Not logged in, access denied' });
  }
  try {
    // 獲取路由中的 groupId 參數
    const groupId = req.params.groupId;
    let results = await getAllRecord(groupId);
  
    // 確保 result.date 是字串
    results.forEach(result => {
      const dateObj = new Date(result.date); 
      const dateOnly = dateObj.toISOString().split('T')[0]; // 提取 YYYY-MM-DD 部分
      result.date = dateOnly;
    });
  
    // 按日期進行分組
    const groupedByDate = results.reduce((acc, curr) => {
      if (!acc[curr.date]) {
        acc[curr.date] = [];
      }

      // 檢查是否已經存在該 record_id
      let existingRecord = acc[curr.date].find(record => record.record_id === curr.record_id);

      if (!existingRecord) {
        // 如果不存在該 record_id，則新增一個紀錄物件
        existingRecord = {
          record_type: curr.record_type,
          record_id: curr.record_id,
          date: curr.date,
          time: curr.time,
          category: curr.category,
          item: curr.item,
          currency: curr.currency,
          amount: removeTrailingZeros(curr.amount),
          exchange_rate: curr.exchangeRate,
          main_currency_amount: removeTrailingZeros(curr.mainCurrencyAmount),
          note: curr.note,
          image_name: curr.image_name,
          updated_time: curr.updated_at,
          payer_member_id: curr.payer_member_id,
          payer: curr.payer_name,
          paid_amount: removeTrailingZeros(curr.paid_amount),
          paid_main_currency_amount: removeTrailingZeros(curr.paid_main_currency_amount),
          members: []
        };
        acc[curr.date].push(existingRecord);
      }

      // 將 member 資料添加到現有的紀錄中
      existingRecord.members.push({
        member_id: curr.member_id,
        member: curr.member_name,
        member_amount: removeTrailingZeros(curr.member_amount),
        member_main_currency_amount: removeTrailingZeros(curr.member_main_currency_amount)
      });
    
      return acc;
    }, {});
  
    // 將分組後的數據排序
    const sortedGroupedByDate = Object.keys(groupedByDate)
      .sort((a, b) => new Date(b) - new Date(a)) // 先按日期降序排列
      .map(date => {
        return {
          date,
          records: groupedByDate[date].sort((a, b) => {
            const timeA = new Date(`${a.date}T${a.time}`);
            const timeB = new Date(`${b.date}T${b.time}`);
            return timeB - timeA; // 按時間降序排列
          })
        };
      });
    // 返回排序後的數據
    res.status(200).json({ recordData: sortedGroupedByDate });
    //console.log(JSON.stringify(sortedGroupedByDate, null, 2));
  } catch (error) {
    return res.status(400).json({ error: true, message: error.message });
  }
};


function removeTrailingZeros(value) {
  if (typeof value === 'string') {
    value = parseFloat(value);  // 將字符串轉換為數字
  }
  if (typeof value === 'number') {
    const formattedValue = parseFloat(value.toFixed(3)).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4
    });
    return formattedValue;
  }
  return value;
}


export const getExpenseData = async (req, res) => {
  // 會員驗證
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const payload = jwt.verify(token, secretKey, { algorithms: ['HS256'] });
  } catch (error) {
    return res.status(403).json({ error: true, message: 'Not logged in, access denied' });
  }
  try {
    // 獲取路由中的 groupId 參數
    const groupId = req.params.groupId;
    const expenseId = req.params.expenseId;
    let results = await getExpense(groupId, expenseId);

    // 使用 reduce 來整理數據
    const expenseData = results.reduce((acc, result) => {
      // 查找是否已存在相同 expense_id 的支出
      let expense = acc.find(exp => exp.expense_id === result.expense_id);

      if (!expense) {
        // 如果還沒有這筆支出，創建新的一筆支出
        expense = {
          expense_id: result.expense_id,
          date: new Date(result.date).toISOString().split('T')[0], // 格式化日期
          time: result.time,
          category: result.category,
          item: result.item,
          currency: result.currency,
          amount: removeTrailingZeros(result.amount),
          exchangeRate: result.exchangeRate,
          mainCurrencyAmount: removeTrailingZeros(result.mainCurrencyAmount),
          note: result.note,
          image_name: result.image_name,
          updated_at: result.updated_at,
          payer_name: result.payer_name,
          payer_image_name: result.payer_image_name,
          payer_member_id: result.payer_member_id,
          paid_amount: removeTrailingZeros(result.paid_amount),
          paid_main_currency_amount: removeTrailingZeros(result.paid_main_currency_amount),
          members: [] // 初始化成員數組
        };

        // 將新支出推入累積數組
        acc.push(expense);
      }

      // 將當前成員的數據添加到支出的 members 中
      expense.members.push({
        member_name: result.member_name,
        member_image_name: result.member_image_name,
        member_id: result.member_id,
        member_amount: removeTrailingZeros(result.member_amount),
        member_main_currency_amount: removeTrailingZeros(result.member_main_currency_amount)
      });

      return acc;
    }, []); // 初始值為空數組
    res.status(200).json({ expenseData: expenseData });
  } catch (error) {
    return res.status(400).json({ error: true, message: error.message });
  }
}


export const deleteExpenseData = async (req, res) => {
  // 會員驗證
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const payload = jwt.verify(token, secretKey, { algorithms: ['HS256'] });
  } catch (error) {
    return res.status(403).json({ error: true, message: 'Not logged in, access denied' });
  }
  try{
    const expenseId = req.params.expenseId;
    await deleteExpense(expenseId);
    res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(400).json({ error: true, message: error.message });
  }
}


export const getGroupBalanceData = async (req, res) => {
  // 會員驗證
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const payload = jwt.verify(token, secretKey, { algorithms: ['HS256'] });
  } catch (error) {
    return res.status(403).json({ error: true, message: 'Not logged in, access denied' });
  }
  try{
    const groupId = req.params.groupId;
    let groupBalanceData = await getGroupBalance(groupId);
    // 處理balance數據，去除多餘的0
    groupBalanceData = groupBalanceData.map(member => {
      member.balance = removeTrailingZeros(member.balance);
      return member;
    });
    // 轉換 balance 為數字，並去除逗號
    const sortedBalanceData = JSON.parse(JSON.stringify(groupBalanceData));
    sortedBalanceData.forEach(member => {
      member.balance = parseFloat(member.balance.replace(/,/g, ''));
    });
    // 按餘額排序，從最低到最高
    sortedBalanceData.sort((a, b) => a.balance - b.balance);

    const payments = [];
    let x = 0;
    let y = sortedBalanceData.length - 1;

    while (x < y) {
      const payer = sortedBalanceData[x];
      const receiver = sortedBalanceData[y];
      const paymentAmount = Math.min(-payer.balance, receiver.balance);
      
      if (paymentAmount !==0){
        payments.push({
          from: payer.member,
          payerImage: payer.image,
          to: receiver.member,
          receiverImage: receiver.image,
          amount: removeTrailingZeros(paymentAmount)
        });
      }

      payer.balance += paymentAmount;
      receiver.balance -= paymentAmount;

      if (payer.balance === 0) {
        x++;
      }

      if (receiver.balance === 0) {
        y--;
      }
    }
    res.status(200).json({ groupBalanceData: groupBalanceData, payments: payments });
    console.log(JSON.stringify(groupBalanceData, null, 2));
  } catch (error) {
    return res.status(400).json({ error: true, message: error.message });
  }
}