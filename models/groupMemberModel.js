import { Database } from '../dbconfig.js';


export const addMemberToGroup = async (groupId, memberId, userId, role) => {
  const query = 'INSERT INTO GroupMemberMapping (splitgroup_id, member_id, user_id, role) VALUES (?, ?, ?, ?)';
  const results = await Database.executeQuery(query, [groupId, memberId, userId, role]);
  console.log('addMemberToGroup', results);
  return results;
};


export const getGroupByUserId = async (userId) => {
  const query = 'SELECT splitgroup_id FROM GroupMemberMapping WHERE user_id = ?';
  const results = await Database.executeQuery(query, [userId]);
  console.log('getGroupByUserId',results);
  return results.length ? results : null; 
};


export const getMemberByGroupId = async (groupId) => {
  const query = 'SELECT member_id FROM GroupMemberMapping WHERE splitgroup_id = ?';
  const results = await Database.executeQuery(query, [groupId]);
  console.log('getMemberByGroupId',results);
  return results.length ? results : null; 
}


export const updateGroupMemberMappingUserId = async (userId, memberId) => {
  const query = 'UPDATE GroupMemberMapping SET user_id = ? WHERE member_id = ?';
  const results = await Database.executeQuery(query, [userId, memberId]);
  console.log('updateGroupMemberMappingUserId',results);
  return results;
}