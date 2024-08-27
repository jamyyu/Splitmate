import { Database } from '../dbconfig.js';

export const createTransfer = async (groupId, date, time, currency, amount, exchangeRate, mainCurrencyAmount, note, image_name, transferFrom_member_id, transferTo_member_id ) => {
  const query = 'INSERT INTO transfer (splitgroup_id, date, time, currency, amount, exchangeRate, mainCurrencyAmount, note, image_name, transferFrom_member_id, transferTo_member_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const results = await Database.executeQuery(query, [groupId, date, time, currency, amount, exchangeRate, mainCurrencyAmount, note, image_name, transferFrom_member_id, transferTo_member_id]);
  return results.insertId;
};


export const getTransfer = async (groupId, transferId) => {
  const query = `
    SELECT 
      t.id AS transfer_id,
      CONVERT_TZ(t.date, '+00:00', '+08:00') AS date,
      t.time,
      t.currency,
      t.amount,
      t.exchangeRate,
      t.mainCurrencyAmount,
      t.note,
      t.image_name,
      t.updated_at,

      -- 取得轉出成員的名稱及照片
      COALESCE(uFrom.name, gmmFrom.member_name) AS transferFrom_name,
      uFrom.image_name AS transferFrom_image_name,

      t.transferFrom_member_id AS transferFrom_member_id,
      t.amount AS transferFrom_amount,
      t.mainCurrencyAmount AS transferFrom_main_currency_amount,

      -- 取得轉入成員的名稱及照片
      COALESCE(uTo.name, gmmTo.member_name) AS transferTo_name,
      uTo.image_name AS transferTo_image_name,

      t.transferTo_member_id AS transferTo_member_id,
      t.amount AS transferTo_amount,
      t.mainCurrencyAmount AS transferTo_main_currency_amount
      
    FROM 
      transfer t
    LEFT JOIN 
      GroupMemberMapping gmmFrom ON t.transferFrom_member_id = gmmFrom.member_id AND t.splitgroup_id = gmmFrom.splitgroup_id
    LEFT JOIN 
      user uFrom ON gmmFrom.user_id = uFrom.id
    LEFT JOIN 
      GroupMemberMapping gmmTo ON t.transferTo_member_id = gmmTo.member_id AND t.splitgroup_id = gmmTo.splitgroup_id
    LEFT JOIN 
      user uTo ON gmmTo.user_id = uTo.id
    WHERE 
      t.splitgroup_id = ? AND t.id = ?
    ORDER BY 
      t.date DESC,
      t.time DESC;
  `;
  const results = await Database.executeQuery(query, [groupId, transferId]);
  return results;
};


export const deleteTransfer= async (transferId) => {
  const query = 'DELETE FROM transfer WHERE id = ?';
  const results = await Database.executeQuery(query, [transferId]);
  return results;
}