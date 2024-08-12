document.addEventListener('DOMContentLoaded', () => {
  const createGroupButton = document.querySelector('.create-group-button');
  createGroupButton.addEventListener('click', () => {
    window.location.href = '/groups/create-group';
  });
  fetchGroups();
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


function fetchGroups(){
  const token = localStorage.getItem('token');
  fetch('/api/group', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  })
  .then(response => response.json())
  .then(result => {
    data = result.data;
    if (data) {
      renderGroups(data);
    } 
  })
  .catch(error => {
    console.error("Error fetching data:", error);
  });
}


function renderGroups(data) {
  const groupList = document.querySelector('.group-list');

  data.forEach(item => {
    const link = document.createElement("a");
    const groupCard = document.createElement('div');
    const imageElement = document.createElement('img');
    const groupName = document.createElement('div');

    link.setAttribute("href", `/group/${item.id}`);
    groupCard.classList.add('group-card');
    groupName.textContent = item.name;
    groupName.classList.add('group-name');
    imageElement.src = item.image_url;
    
    groupCard.appendChild(imageElement);
    groupCard.appendChild(groupName);
    link.appendChild(groupCard);
    groupList.appendChild(link);
  });
}