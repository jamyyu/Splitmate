import { Database } from '../dbconfig.js';


export const createGroup = async (groupName, mainCurrency, imageName) => {
  const query = 'INSERT INTO SplitGroup (name, main_currency, image_name) VALUES (?, ?, ?)';
  const results = await Database.executeQuery(query, [groupName, mainCurrency, imageName]);
  console.log('createGroup',results);
  return results.insertId;
};


