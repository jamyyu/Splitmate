import { Database } from '../dbconfig.js';


export const createGroup = async (groupName, mainCurrency, imageName) => {
  const query = 'INSERT INTO SplitGroup (name, main_currency, image_name) VALUES (?, ?, ?)';
  const results = await Database.executeQuery(query, [groupName, mainCurrency, imageName]);
  return results.insertId;
};


export const updateGroupById = async (groupName, imageName, groupId) => {
  const query = 'UPDATE SplitGroup SET name = ?, image_name = ? WHERE id = ?';
  const results = await Database.executeQuery(query, [groupName, imageName, groupId]);
  return results.affectedRows;
}


export const getGroupDataById = async (groupId) => {
  const query = 'SELECT * FROM SplitGroup WHERE id = ?';
  const results = await Database.executeQuery(query, [groupId]);
  return results.length ? results[0] : null; 
}


export const deleteGroupById = async (groupId) =>{
  const query = 'DELETE  FROM SplitGroup WHERE id = ?';
  const results = await Database.executeQuery(query, [groupId]);
  return results.affectedRows;
}