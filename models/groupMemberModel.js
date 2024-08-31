import { Database } from '../dbconfig.js';


export const addMemberToGroup = async (groupId, memberId, memberName, userId, role) => {
  const query = 'INSERT INTO GroupMemberMapping (splitgroup_id, member_id, member_name, user_id, role) VALUES (?, ?, ?, ?, ?)';
  const results = await Database.executeQuery(query, [groupId, memberId, memberName, userId, role]);
  return results;
};


export const getGroupByUserId = async (userId) => {
  const query = `
    SELECT SplitGroup.id , SplitGroup.name , SplitGroup.main_currency, SplitGroup.image_name
    FROM GroupMemberMapping 
    JOIN SplitGroup 
    ON GroupMemberMapping.splitgroup_id = SplitGroup.id
    WHERE GroupMemberMapping.user_id = ?
  `;
  const results = await Database.executeQuery(query, [userId]);
  return results.length ? results : null; 
};


export const getMemberByGroupId = async (groupId) => {
  const query = `
  SELECT 
    sg.id AS splitgroup_id,
    sg.name AS group_name,
    sg.main_currency,
    sg.image_name AS group_image_name,
    gm.member_id,
    gm.member_name,
    gm.role,
    gm.user_id,
    u.name AS user_name,
    m.email AS member_email
  FROM 
    SplitGroup sg
  LEFT JOIN 
    GroupMemberMapping gm ON sg.id = gm.splitgroup_id
  LEFT JOIN 
    user u ON gm.user_id = u.id
  LEFT JOIN
    member m ON gm.member_id = m.id
  WHERE 
    sg.id = ?;
`;
  const results = await Database.executeQuery(query, [groupId]);
  return results.length ? results : null; 
}


export const updateGroupMemberMappingUserId = async (userId, memberId) => {
  const query = 'UPDATE GroupMemberMapping SET user_id = ? WHERE member_id = ?';
  const results = await Database.executeQuery(query, [userId, memberId]);
  return results;
}


export const removeMemberFromGroup = async (groupId, memberId) => {
  const query = 'DELETE FROM GroupMemberMapping WHERE splitgroup_id = ? AND member_id = ?';
  const results = await Database.executeQuery(query, [groupId, memberId]);
  return results.affectedRows;
}


export const UpdateMemberInGroup = async (name, groupId, memberId) => {
  const query = 'UPDATE GroupMemberMapping SET member_name = ? WHERE splitgroup_id = ? AND member_id = ?';
  const results = await Database.executeQuery(query, [name, groupId, memberId]);
  return results.affectedRows;
}