import 'dotenv/config';
import { Database } from '../dbconfig.js';

export const searchUserEmail = async (email) => {
  const query = 'SELECT email FROM user WHERE email = ?';
  const results = await Database.executeQuery(query, [email]); // 數組
  console.log('searchUserEmail',results);
  return results.length ? results[0] : null; // 返回物件，如果找不到用戶，返回 null
};

export const createUser = async (name, email, hashedPassword) => {
  const query = 'INSERT INTO user (name, email, password) VALUES (?, ?, ?)';
  const results = await Database.executeQuery(query, [name, email, hashedPassword]);
  console.log('createUser',results);
  return results.insertId;
};

export const getUserByEmail = async (email) => {
  const query = 'SELECT id, name, image_name, email, password FROM user WHERE email = ?';
  const results = await Database.executeQuery(query, [email]);
  console.log('getUserByEmail',results);
  return results.length ? results[0] : null; 
};

export const updateUserData = async (name, image_name, email) => {
  const query = 'UPDATE user SET name = ?, image_name = ? WHERE email = ?';
  const results = await Database.executeQuery(query, [name, image_name, email]);
  console.log('updateUserData',results);
  return results 
};

//export const updateUserData = async (name, image_name, id) => {
  //const query = 'UPDATE user SET name = ?, image_name = ? WHERE id = ?';
  
  //try {
    //const results = await Database.executeQuery(query, [name, image_name, id]);
    //console.log('User data updated successfully:', results);
    //return results;
  //} catch (error) {
    //console.error('Error updating user data:', error);
    //throw new Error('Failed to update user data');
  //}
//};