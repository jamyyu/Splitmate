import { Database } from '../dbconfig.js';


export const createExpense = async (groupId, date, time, category, item, currency, amount, exchangeRate, mainCurrencyAmount, note, image_name) => {
  const query = 'INSERT INTO expense (splitgroup_id, date, time, category, item, currency, amount, exchangeRate, mainCurrencyAmount, note, image_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const results = await Database.executeQuery(query, [groupId, date, time, category, item, currency, amount, exchangeRate, mainCurrencyAmount, note, image_name]);
  return results.insertId;
};


export const getAllRecord = async (groupId) => {
  const query = `
    SELECT 
      'expense' AS record_type,
      e.id AS record_id,
      CONVERT_TZ(e.date, '+00:00', '+08:00') AS date,
      e.time,
      e.category,
      e.item,
      e.currency,
      e.amount,
      e.exchangeRate,
      e.mainCurrencyAmount,
      e.note,
      e.image_name,
      e.updated_at,

      -- 取得付款者的名稱
      COALESCE(u1.name, gmm1.member_name) AS payer_name,
      p.member_id AS payer_member_id,
      p.amount AS paid_amount,
      p.mainCurrencyAmount AS paid_main_currency_amount,

      -- 取得分攤成員的名稱
      COALESCE(u2.name, gmm2.member_name) AS member_name,
      sm.member_id AS member_id,
      sm.amount AS member_amount,
      sm.mainCurrencyAmount AS member_main_currency_amount

    FROM 
      expense e
    JOIN 
      payer p ON e.id = p.expense_id
    LEFT JOIN 
      GroupMemberMapping gmm1 ON p.member_id = gmm1.member_id AND e.splitgroup_id = gmm1.splitgroup_id
    LEFT JOIN 
      user u1 ON gmm1.user_id = u1.id
    JOIN 
      SplitMember sm ON e.id = sm.expense_id
    LEFT JOIN 
      GroupMemberMapping gmm2 ON sm.member_id = gmm2.member_id AND e.splitgroup_id = gmm2.splitgroup_id
    LEFT JOIN 
      user u2 ON gmm2.user_id = u2.id

    WHERE 
      e.splitgroup_id = ?

    UNION ALL

    SELECT 
      'transfer' AS record_type,
      t.id AS record_id,
      CONVERT_TZ(t.date, '+00:00', '+08:00') AS date,
      t.time,
      NULL AS category,
      NULL AS item,
      t.currency,
      t.amount,
      t.exchangeRate,
      t.mainCurrencyAmount,
      t.note,
      t.image_name,
      t.updated_at,

      -- 取得轉帳來源的名稱
      COALESCE(u3.name, gmm3.member_name) AS payer_name,
      t.transferFrom_member_id AS payer_member_id,
      NULL AS paid_amount,
      NULL AS paid_main_currency_amount,

      -- 取得轉帳目標的名稱
      COALESCE(u4.name, gmm4.member_name) AS member_name,
      t.transferTo_member_id AS member_id,
      NULL AS member_amount,
      NULL AS member_main_currency_amount

    FROM 
      transfer t
    LEFT JOIN 
      GroupMemberMapping gmm3 ON t.transferFrom_member_id = gmm3.member_id AND t.splitgroup_id = gmm3.splitgroup_id
    LEFT JOIN 
      user u3 ON gmm3.user_id = u3.id
    LEFT JOIN 
      GroupMemberMapping gmm4 ON t.transferTo_member_id = gmm4.member_id AND t.splitgroup_id = gmm4.splitgroup_id
    LEFT JOIN 
      user u4 ON gmm4.user_id = u4.id

    WHERE 
      t.splitgroup_id = ?
    ORDER BY 
      date DESC,
      time DESC;
      `;
  const results = await Database.executeQuery(query, [groupId, groupId]);
  return results;
};


export const getExpense = async (groupId, expenseId) => {
  const query = `
    SELECT 
      e.id AS expense_id,
      CONVERT_TZ(e.date, '+00:00', '+08:00') AS date,
      e.time,
      e.category,
      e.item,
      e.currency,
      e.amount,
      e.exchangeRate,
      e.mainCurrencyAmount,
      e.note,
      e.image_name,
      e.updated_at,

      -- 取得付款者的名稱及照片
      COALESCE(u1.name, gmm1.member_name) AS payer_name,
      u1.image_name AS payer_image_name,

      p.member_id AS payer_member_id,
      p.amount AS paid_amount,
      p.mainCurrencyAmount AS paid_main_currency_amount,

      -- 取得分攤成員的名稱及照片
      COALESCE(u2.name, gmm2.member_name) AS member_name,
      u2.image_name AS member_image_name,
      
      sm.member_id AS member_id,
      sm.amount AS member_amount,
      sm.mainCurrencyAmount AS member_main_currency_amount
    FROM 
      expense e
    JOIN 
      payer p ON e.id = p.expense_id
    LEFT JOIN 
      GroupMemberMapping gmm1 ON p.member_id = gmm1.member_id AND e.splitgroup_id = gmm1.splitgroup_id
    LEFT JOIN 
      user u1 ON gmm1.user_id = u1.id
    JOIN 
      SplitMember sm ON e.id = sm.expense_id
    LEFT JOIN 
      GroupMemberMapping gmm2 ON sm.member_id = gmm2.member_id AND e.splitgroup_id = gmm2.splitgroup_id
    LEFT JOIN 
      user u2 ON gmm2.user_id = u2.id
    WHERE 
      e.splitgroup_id = ? AND e.id = ?
    ORDER BY 
      e.date DESC,
      e.time DESC;
  `;
  const results = await Database.executeQuery(query, [groupId, expenseId]);
  return results;
};


export const deleteExpense = async (expenseId) => {
  const query = 'DELETE FROM expense WHERE id = ?';
  const results = await Database.executeQuery(query, [expenseId]);
  return results;
}


export const getGroupBalance = async (groupId) => {
  const query = `
    WITH AllMembers AS (
      SELECT 
        COALESCE(u.name, gmm.member_name) AS member,
        COALESCE(u.image_name, null) AS image,
        gmm.splitgroup_id
      FROM 
        GroupMemberMapping gmm
      LEFT JOIN 
        user u ON gmm.user_id = u.id
      WHERE 
        gmm.splitgroup_id = ?
    ),
    AmountPaid AS (
      SELECT 
        COALESCE(u.name, gmm.member_name) AS member, 
        SUM(p.mainCurrencyAmount) AS totalAmountPaid,
        e.splitgroup_id
      FROM 
        payer p
      JOIN 
        expense e ON p.expense_id = e.id
      LEFT JOIN 
        GroupMemberMapping gmm ON p.member_id = gmm.member_id AND e.splitgroup_id = gmm.splitgroup_id
      LEFT JOIN 
        user u ON gmm.user_id = u.id
      WHERE 
        e.splitgroup_id = ?
      GROUP BY 
        COALESCE(u.name, gmm.member_name), e.splitgroup_id
    ),
    AmountToPay AS (
      SELECT 
        COALESCE(u.name, gmm.member_name) AS member,
        SUM(sm.mainCurrencyAmount) AS totalAmountToPay,
        e.splitgroup_id
      FROM 
        SplitMember sm
      JOIN 
        expense e ON sm.expense_id = e.id
      LEFT JOIN 
        GroupMemberMapping gmm ON sm.member_id = gmm.member_id AND e.splitgroup_id = gmm.splitgroup_id
      LEFT JOIN 
        user u ON gmm.user_id = u.id
      WHERE 
        e.splitgroup_id = ?
      GROUP BY 
        COALESCE(u.name, gmm.member_name), e.splitgroup_id
    ),
    TransferPaid AS (
      SELECT 
        COALESCE(u.name, gmm.member_name) AS member,
        SUM(t.mainCurrencyAmount) AS totalAmountPaid,
        t.splitgroup_id
      FROM 
        transfer t
      LEFT JOIN 
        GroupMemberMapping gmm ON t.transferFrom_member_id = gmm.member_id AND t.splitgroup_id = gmm.splitgroup_id
      LEFT JOIN 
        user u ON gmm.user_id = u.id
      WHERE 
        t.splitgroup_id = ?
      GROUP BY 
        COALESCE(u.name, gmm.member_name), t.splitgroup_id
    ),
    TransferReceived AS (
      SELECT 
        COALESCE(u.name, gmm.member_name) AS member,
        SUM(t.mainCurrencyAmount) AS totalAmountReceived,
        t.splitgroup_id
      FROM 
        transfer t
      LEFT JOIN 
        GroupMemberMapping gmm ON t.transferTo_member_id = gmm.member_id AND t.splitgroup_id = gmm.splitgroup_id
      LEFT JOIN 
        user u ON gmm.user_id = u.id
      WHERE 
        t.splitgroup_id = ?
      GROUP BY 
        COALESCE(u.name, gmm.member_name), t.splitgroup_id
    )
    SELECT 
      am.member,
      am.image,
      COALESCE(ap.totalAmountPaid, 0) + COALESCE(tp.totalAmountPaid, 0) AS totalAmountPaid,
      COALESCE(atp.totalAmountToPay, 0) + COALESCE(tr.totalAmountReceived, 0) AS totalAmountToPay,
      (COALESCE(ap.totalAmountPaid, 0) + COALESCE(tp.totalAmountPaid, 0)) - 
      (COALESCE(atp.totalAmountToPay, 0) + COALESCE(tr.totalAmountReceived, 0)) AS balance
    FROM 
      AllMembers am
    LEFT JOIN 
      AmountPaid ap ON am.member = ap.member AND am.splitgroup_id = ap.splitgroup_id
    LEFT JOIN 
      AmountToPay atp ON am.member = atp.member AND am.splitgroup_id = atp.splitgroup_id
    LEFT JOIN 
      TransferPaid tp ON am.member = tp.member AND am.splitgroup_id = tp.splitgroup_id
    LEFT JOIN 
      TransferReceived tr ON am.member = tr.member AND am.splitgroup_id = tr.splitgroup_id
    GROUP BY 
      am.member, am.image;
  `;
  const results = await Database.executeQuery(query, [groupId, groupId, groupId, groupId, groupId]);
  return results;
};

