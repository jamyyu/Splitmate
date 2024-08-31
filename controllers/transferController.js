import 'dotenv/config';
import { uploadFileToS3 } from '../services/S3.js';
import { createTransfer, getTransfer, deleteTransfer } from '../models/transferModel.js';
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

export const uploadTransferData = async (req, res) => {
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
    // 解析 transferFrom 和 transferTo JSON 字串
    const transferFrom = JSON.parse(plainBody.transferFrom);
    const transferTo = JSON.parse(plainBody.transferTo);
    console.log(plainBody);
    console.log(imageName);
    // 資料存入費用資料庫
    const transferId = await createTransfer(plainBody.groupId, plainBody.date, plainBody.time, plainBody.currency, plainBody.amount, plainBody.exchangeRate, plainBody.mainCurrencyAmount, plainBody.note, imageName, transferFrom.payerMemberId, transferTo.transferToMemberId);
    console.log(transferId)
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error', error);
    return res.status(500).json({ error: 'Failed to save expense data' });
  }
}


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


export const getTransferData = async (req, res) => {
  // 會員驗證
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const payload = jwt.verify(token, secretKey, { algorithms: ['HS256'] });
  } catch (error) {
    return res.status(403).json({ error: true, message: 'Not logged in, access denied' });
  }
  try {
    const groupId = req.params.groupId;
    const transferId = req.params.transferId;
    let results = await getTransfer(groupId, transferId);
    console.log(results)

    // 使用 reduce 來整理數據
    const transferData = results.reduce((acc, result) => {
      // 檢查當前的 transfer_id 是否已存在於累積數組中
      let transfer = acc.find(t => t.transfer_id === result.transfer_id);

      if (!transfer) {
        // 如果不存在，創建新的一筆轉帳
        transfer = {
          transfer_id: result.transfer_id,
          date: new Date(result.date).toISOString().split('T')[0], // 格式化日期
          time: result.time,
          currency: result.currency,
          amount: removeTrailingZeros(result.amount),
          exchangeRate: result.exchangeRate,
          mainCurrencyAmount: removeTrailingZeros(result.mainCurrencyAmount),
          note: result.note,
          image_name: result.image_name,
          updated_at: result.updated_at,
          transferFrom: [], // 初始化轉出成員數組
          transferTo: [] // 初始化轉入成員數組
        };

        // 將新轉帳推入累積數組
        acc.push(transfer);
      }

      // 將當前轉出成員的數據添加到 transferFrom 中
      transfer.transferFrom.push({
        transferFrom_name: result.transferFrom_name,
        transferFrom_image_name: result.transferFrom_image_name,
        transferFrom_member_id: result.transferFrom_member_id,
        transferFrom_amount: removeTrailingZeros(result.transferFrom_amount),
        transferFrom_main_currency_amount: removeTrailingZeros(result.transferFrom_main_currency_amount)
      });

      // 將當前轉入成員的數據添加到 transferTo 中
      transfer.transferTo.push({
        transferTo_name: result.transferTo_name,
        transferTo_image_name: result.transferTo_image_name,
        transferTo_member_id: result.transferTo_member_id,
        transferTo_amount: removeTrailingZeros(result.transferTo_amount),
        transferTo_main_currency_amount: removeTrailingZeros(result.transferTo_main_currency_amount)
      });

      return acc;
    }, []); // 初始值為空數組

    res.status(200).json({ transferData });
  } catch (error) {
    return res.status(400).json({ error: true, message: error.message });
  }
};


export const deleteTransferData = async (req, res) => {
  // 會員驗證
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const payload = jwt.verify(token, secretKey, { algorithms: ['HS256'] });
  } catch (error) {
    return res.status(403).json({ error: true, message: 'Not logged in, access denied' });
  }
  try{
    const transferId = req.params.transferId;
    await deleteTransfer(transferId);
    res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(400).json({ error: true, message: error.message });
  }
}
