import { Database } from '../dbconfig.js';


export const addMemberToGroup = async (groupId, memberId, userId, role) => {
  const query = 'INSERT INTO GroupMemberMapping (splitgroup_id, member_id, user_id, role) VALUES (?, ?, ?, ?)';
  const results = await Database.executeQuery(query, [groupId, memberId, userId, role]);
  console.log('addMemberToGroup', results);
  return results;
};