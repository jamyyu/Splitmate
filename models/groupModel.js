import { Database } from '../dbconfig.js';


export const createGroup = async (groupName, mainCurrency, imageName) => {
  const query = 'INSERT INTO SplitGroup (name, main_currency, image_name) VALUES (?, ?, ?)';
  const results = await Database.executeQuery(query, [groupName, mainCurrency, imageName]);
  console.log('createGroup',results);
  return results.insertId;
};


export const getGroup = async (groupId) => {
  const query = 'SELECT id, name, main_currency, image_name FROM SplitGroup WHERE id = ?';
  const results = await Database.executeQuery(query, [groupId]);
  console.log('getGroup',results);
  return results.length ? results : null; 
};