document.addEventListener('DOMContentLoaded', () => {
  handleImageUpload();
  addPerson();
  fetchExpense();
  handleUpdate();
  clickCancelBtn();
  clickDeleteBtn();
});

function handleImageUpload() {
  const groupData = JSON.parse(sessionStorage.getItem('groupData'));
  const imageUpload = document.getElementById('imageUpload');
  imageUpload.addEventListener('change', (e) => {
    // 獲取用戶選擇的文件列表
    const files = e.target.files;
    const preview = document.querySelector('.profile-image');
    // 檢查是否選擇了文件
    if (files && files.length > 0) {
      const file = files[0];
      // 確保文件存在並且是圖像類型
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (preview) {
            preview.src = e.target.result;
            preview.style.display = 'block';
          } else {
            console.error("無法找到用於顯示圖片預覽的元素");
          }
        };
        reader.readAsDataURL(file);
      } else {
        console.error("請選擇有效的圖像文件");
      }
    } else {
      // 清除圖片預覽
      if (preview) {
        if(groupData.image_name){
          preview.src = 'https://d3q4cpn0fxi6na.cloudfront.net/'+ groupData.image_name;
        } else {
          preview.src = '/images/template.jpg'
        }      
      }
    }
  });
}

function addPerson() {
  const addPersonButton = document.querySelector('.add-person');
  const membersContainer = document.querySelector('.members');
  addPersonButton.addEventListener('click', () => {
    // 創建包含輸入字段和刪除按鈕的 div
    const memberInputs = document.createElement('div');
    memberInputs.className = 'member-inputs';
    // 原本的ID隱藏式存起來
    const memberIdInput = document.createElement('input');
    memberIdInput.type = 'hidden';
    // 創建 "名字" 輸入字段
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = '名字';
    nameInput.required = true;
    nameInput.className = 'member-name-input';
    // 創建 "電子郵件" 輸入字段
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.placeholder = '電子郵件';
    emailInput.required = true;
    emailInput.className = 'member-email-input';
    // 創建刪除按鈕
    const removeButton = document.createElement('button');
    removeButton.className = 'remove-btn';
    removeButton.textContent = '×';
    // 將所有元素添加到 memberInputs div 中
    memberInputs.appendChild(memberIdInput);
    memberInputs.appendChild(nameInput);
    memberInputs.appendChild(emailInput);
    memberInputs.appendChild(removeButton); 
    // 將新的 memberInputs div 添加到 membersContainer 中
    membersContainer.appendChild(memberInputs); 
    // 添加刪除按鈕的點擊事件監聽器
    removeButton.addEventListener('click', () => {
      memberInputs.remove();
    });
  });
}


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


function fetchExpense(){
  // 透過路徑獲得 groupId
    const pathname = window.location.pathname;
    const groupId = pathname.split('/')[2];
    const token = localStorage.getItem('token');
    fetch((`/api/expense/${groupId}`), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    })
    .then(response => response.json())
    .then(result => {
      const recordData = result.recordData;
      renderCurrentData(recordData);
    })
    .catch(error => {
      console.error("Error fetching data:", error);
    });
  }


function renderCurrentData(recordData) {
  const groupData = JSON.parse(sessionStorage.getItem('groupData'));
  const memberData = JSON.parse(sessionStorage.getItem('memberData'));
  const groupName = document.getElementById('group-name');
  groupName.value = groupData.name;
  const profileImg = document.querySelector('.profile-image');
  if (groupData.image_name) {
    profileImg.src = 'https://d3q4cpn0fxi6na.cloudfront.net/'+ groupData.image_name;
  } else {
    profileImg.src = '/images/template.jpg'
  }
  memberData.forEach(member => {
    if (member.role === 'admin'){
      const admin = document.querySelector('.member');
      const token = localStorage.getItem('token');
      userData = parseJwt(token);
      const memberName = document.querySelector('.member-name');
      memberName.textContent = userData['name'];
      const memberEmailSpan = document.createElement('span');
      memberEmailSpan.textContent = ` (${userData['email']})`;
      memberName.appendChild(memberEmailSpan);
      // 原本的ID隱藏式存起來
      const memberIdInput = document.createElement('input');
      memberIdInput.type = 'hidden';
      memberIdInput.value = member.member_id;
      memberIdInput.className = 'admin';
      admin.appendChild(memberIdInput);  
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
      // render "電子郵件" 輸入字段
      const emailInput = document.createElement('input');
      emailInput.type = 'email';
      emailInput.placeholder = '電子郵件';
      emailInput.required = true;
      emailInput.className = 'member-email-input';
      emailInput.value = member.member_email;
      emailInput.readOnly = true;
      // 檢查是否為已經是 user 
      if (member.user_id) {
        nameInput.readOnly = true;
      }
      // 創建刪除按鈕
      const removeButton = document.createElement('button');
      removeButton.className = 'remove-btn';
      removeButton.textContent = '×';
      // 將所有元素添加到 memberInputs div 中
      memberInputs.appendChild(memberIdInput);
      memberInputs.appendChild(nameInput);
      memberInputs.appendChild(emailInput);
      memberInputs.appendChild(removeButton); 
      // 將新的 memberInputs div 添加到 membersContainer 中
      const membersContainer = document.querySelector('.members');
      membersContainer.appendChild(memberInputs); 
      // 添加刪除按鈕的點擊事件監聽器
      removeButton.addEventListener('click', (e) => {
        e.preventDefault();
        const memberIdToCheck = memberIdInput.value;
        // 判斷是否可以刪除
        let canDelete = true;
        recordData.forEach(group => {
          group.records.forEach(record => {
            if (record.payer_member_id == memberIdToCheck) {
              canDelete = false;
            }
            record.members.forEach(recordMember => {
              if (recordMember.member_id == memberIdToCheck) {
                canDelete = false;
              }
            });
          });
        });
        if (canDelete) {
          memberInputs.remove(); 
        } else {
          alert('成員關聯到某些帳務紀錄，需先刪除相關紀錄，再刪除成員呦！'); 
        }
      });
    }
  });
}


function handleUpdate() {
  const groupForm = document.getElementById('groupForm');
  const updateButton = groupForm.querySelector('.update-button');
  groupForm.addEventListener('submit',(e) => {
    e.preventDefault();
    // 避免重複提交
    updateButton.disabled = true;
    // 獲取群組名稱
    const groupName = document.getElementById('group-name').value;
    // 獲取圖片文件
    const imageFile = document.getElementById('imageUpload').files[0];
    // 獲取群組成員
    const token = localStorage.getItem('token');
    const userData = parseJwt(token);
    let memberId = document.querySelector('.admin').value;
    let name = userData['name'];
    let email = userData['email'];
    const members = [{memberId, name, email}];
    document.querySelectorAll('.member-inputs').forEach(memberInputs => {
      memberId = memberInputs.querySelector('input[type="hidden"]').value || null;
      name = memberInputs.querySelector('.member-name-input').value;
      email = memberInputs.querySelector('.member-email-input').value;
      members.push({ memberId, name, email });
    });
    // 創建 FormData 對象
    const formData = new FormData();
    formData.append('groupName', groupName);
    formData.append('image', imageFile);
    members.forEach((member, index) => {
      formData.append(`members[${index}][memberId]`, member.memberId);
      formData.append(`members[${index}][name]`, member.name);
      formData.append(`members[${index}][email]`, member.email);
    });
    // 透過路徑獲得 groupId
    const pathname = window.location.pathname;
    const groupId = pathname.split('/')[2];
    fetch(`/api/group/${groupId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    })
    .then(response => response.json())
    .then(result => {
      if (result.ok) {
        window.location.href = `/group/${groupId}`;
      } else {
        throw result;
      }
    })
    .catch(error => {
      console.error('Error', error);
      if (error.message.includes('電子郵件格式錯誤')) {
        alert(error.message); 
      } else {
        alert('發生錯誤: ' + error.message);
      }
    })
    .finally(() => {
      // 重新啟用提交按鈕
      updateButton.disabled = false;
    });
  });
}


function clickCancelBtn() {
  const CancelBtn = document.querySelector('.cancel-button');
  const groupData = JSON.parse(sessionStorage.getItem('groupData'));
  const groupId = groupData.id;
  CancelBtn.addEventListener('click',(e) => {
    e.preventDefault(); 
    window.location.href = `/group/${groupId}`;
  })
}


function clickDeleteBtn() {
  const deleteBtn = document.querySelector('.delete-button');
  deleteBtn.addEventListener('click',(e) => {
    e.preventDefault(); 
    const confirmed = confirm('確定要刪除這個群組嗎？');
    if (!confirmed) {
      return; // 如果用戶點擊“取消”，則不刪除
    }
    const groupData = JSON.parse(sessionStorage.getItem('groupData'));
    const groupId = groupData.id;
    const token = localStorage.getItem('token');
    fetch((`/api/group/${groupId}`), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    })
    .then(response => response.json())
    .then(result => {
      if (result.ok){
        window.location.href = `/groups`;
      }
    })
    .catch(error => {
      console.error("Error deleting data:", error);
    });
  })
}