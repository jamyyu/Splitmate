import { Database } from '../dbconfig.js';


export const storeMessages = async (groupId, userId, clientOffset, content) => {
  const query = 'INSERT INTO messages (splitgroup_id, user_id, client_offset, content) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=id';
  const results = await Database.executeQuery(query, [groupId, userId, clientOffset, content]);
  return results.insertId;
};


export const getMessages = async (groupId) => {
  const query = `
    SELECT m.id, m.splitgroup_id, m.user_id, m.client_offset, m.content, m.created_at, u.name AS user_name
    FROM messages m
    JOIN user u ON m.user_id = u.id
    WHERE m.splitgroup_id = ?
    ORDER BY m.created_at ASC`; 
  const results = await Database.executeQuery(query, [groupId]);
  return results;
};