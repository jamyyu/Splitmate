document.addEventListener('DOMContentLoaded', () => {
  fetchGroup();
  clickAddButton();
});


function parseJwt(token) {
  // 直接從 token 中提取 payload 部分，解碼並解析為 JSON
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join('')
  );
  return JSON.parse(jsonPayload);
}


function fetchGroup(){
// 透過路徑獲得 groupId
  const pathname = window.location.pathname;
  const groupId = pathname.split('/')[2];
  const token = localStorage.getItem('token');
  fetch((`/api/group/${groupId}`), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  })
  .then(response => response.json())
  .then(result => {
    const groupData = result.groupData;
    const memberData = result.memberData;
    sessionStorage.setItem('groupData', JSON.stringify(groupData));
    sessionStorage.setItem('memberData', JSON.stringify(memberData));
    renderGroup(groupData);
  })
  .catch(error => {
    console.error("Error fetching data:", error);
  });
}


function renderGroup(groupData){
  const groupImage = document.getElementById('group-image');
  groupImage.src = 'https://d3q4cpn0fxi6na.cloudfront.net/' + groupData.image_name;
  const pageTitle = document.querySelector('.page-title');
  pageTitle.textContent = groupData.name;
};


function clickAddButton(){
  const addButton = document.querySelector('.add-button');
  addButton.addEventListener('click',() => {
    const pathname = window.location.pathname;
    const groupId = pathname.split('/')[2];
    window.location.href = `/group/${groupId}/create-record`;
  })
}
