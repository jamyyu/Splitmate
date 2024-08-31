document.addEventListener('DOMContentLoaded', () => {
  renderCurrentData();
  clickBackBtn();
});


function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join('')
  );
  return JSON.parse(jsonPayload);
}


function renderCurrentData() {
  const groupData = JSON.parse(sessionStorage.getItem('groupData'));
  const memberData = JSON.parse(sessionStorage.getItem('memberData'));
  const groupName = document.getElementById('group-name');
  groupName.value = groupData.name;
  groupName.readOnly = true;
  const profileImg = document.querySelector('.profile-image');
  if (groupData.image_name) {
    profileImg.src = 'https://d3q4cpn0fxi6na.cloudfront.net/'+ groupData.image_name;
  } else {
    profileImg.src = '/images/template.jpg'
  }
  memberData.forEach(member => {
    if (member.role === 'admin'){
      const token = localStorage.getItem('token');
      userData = parseJwt(token);
      const memberName = document.querySelector('.member-name');
      memberName.textContent = member.member_name;
      const memberEmailSpan = document.createElement('span');
      memberEmailSpan.textContent = ` (${member.member_email})`;
      memberName.appendChild(memberEmailSpan);
    }
    if (member.role === 'member'){
      // 創建包含輸入字段和刪除按鈕的 div
      const memberInputs = document.createElement('div');
      memberInputs.className = 'member-inputs';
      // 原本的ID隱藏式存起來
      const memberIdInput = document.createElement('input');
      memberIdInput.type = 'hidden';
      memberIdInput.value = member.member_id;  
      // render "名字" 輸入字段
      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.placeholder = '名字';
      nameInput.required = true;
      nameInput.className = 'member-name-input';
      nameInput.value = member.user_name || member.member_name;
      nameInput.readOnly = true;
      // render "電子郵件" 輸入字段
      const emailInput = document.createElement('input');
      emailInput.type = 'email';
      emailInput.placeholder = '電子郵件';
      emailInput.required = true;
      emailInput.className = 'member-email-input';
      emailInput.value = member.member_email;
      emailInput.readOnly = true;
      // 將所有元素添加到 memberInputs div 中
      memberInputs.appendChild(memberIdInput);
      memberInputs.appendChild(nameInput);
      memberInputs.appendChild(emailInput);
      // 將新的 memberInputs div 添加到 membersContainer 中
      const membersContainer = document.querySelector('.members');
      membersContainer.appendChild(memberInputs); 
    }
  });
}


function clickBackBtn() {
  const backBtn = document.querySelector('.back-button');
  const groupData = JSON.parse(sessionStorage.getItem('groupData'));
  const groupId = groupData.id;
  backBtn.addEventListener('click',(e) => {
    e.preventDefault(); // 防止預設行為
    window.location.href = `/group/${groupId}`;
  })
}
