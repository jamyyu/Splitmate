import { Database } from '../dbconfig.js';


export const createMember = async (email) => {
  const query = 'INSERT INTO member (email) VALUES (?)';
  const results = await Database.executeQuery(query, [email]);
  console.log('createMember',results);
  return results.insertId;
};


export const getMemberByEmail = async (email) => {
  const query = 'SELECT id, email FROM member WHERE email = ?';
  const results = await Database.executeQuery(query, [email]);
  console.log('getMemberByEmail',results);
  return results.length ? results[0] : null; 
};


export const getMemberById = async (id) => {
  const query = 'SELECT name FROM member WHERE id = ?';
  const results = await Database.executeQuery(query, [email]);
  console.log('getMemberByEmail',results);
  return results.length ? results[0] : null; 
};