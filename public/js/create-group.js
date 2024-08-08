document.addEventListener('DOMContentLoaded', () => {
  handleImageUpload();
  addPerson();
  setCurrency();
  handleSubmit();
  renderUser();
});

function handleImageUpload() {
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
      console.error("未選擇文件或文件列表為空");
      // 清除圖片預覽
      if (preview) {
        preview.src = '/images/pink.jpeg';
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


function setCurrency() {
  // 整理好的貨幣資料
  const currencies = [
    'TWD', 'USD', 'GBP', 'EUR', 'JPY', 'KRW', 'THB', 'CNY', 'AED', 'AFN', 'ALL', 'AMD', 
    'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN', 'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 
    'BMD', 'BND', 'BOB', 'BRL', 'BSD', 'BTN', 'BWP', 'BYN', 'BZD', 'CAD', 'CDF', 'CHF', 
    'CLP', 'COP', 'CRC', 'CUP', 'CVE', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD', 'EGP', 'ERN', 
    'ETB', 'FJD', 'FKP', 'FOK', 'GEL', 'GGP', 'GHS', 'GIP', 'GMD', 'GNF', 'GTQ', 'GYD', 
    'HKD', 'HNL', 'HRK', 'HTG', 'HUF', 'IDR', 'ILS', 'IMP', 'INR', 'IQD', 'IRR', 'ISK', 
    'JEP', 'JMD', 'JOD', 'KES', 'KGS', 'KHR', 'KID', 'KMF', 'KWD', 'KYD', 'KZT', 'LAK', 
    'LBP', 'LKR', 'LRD', 'LSL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD', 'MMK', 'MNT', 'MOP', 
    'MRU', 'MUR', 'MVR', 'MWK', 'MXN', 'MYR', 'MZN', 'NAD', 'NGN', 'NIO', 'NOK', 'NPR', 
    'NZD', 'OMR', 'PAB', 'PEN', 'PGK', 'PHP', 'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD', 
    'RUB', 'RWF', 'SAR', 'SBD', 'SCR', 'SDG', 'SEK', 'SGD', 'SHP', 'SLE', 'SLL', 'SOS', 
    'SRD', 'SSP', 'STN', 'SYP', 'SZL', 'TJS', 'TMT', 'TND', 'TOP', 'TRY', 'TTD', 'TVD', 
    'TZS', 'UAH', 'UGX', 'UYU', 'UZS', 'VES', 'VND', 'VUV', 'WST', 'XAF', 'XCD', 'XDR',
    'XOF', 'XPF', 'YER', 'ZAR', 'ZMW', 'ZWL'
  ];
  const selectElement = document.getElementById('currencySelect');
  // 動態生成 <option> 標籤並添加到 <select> 元素中
  currencies.forEach(currency => {
    const option = document.createElement('option');
    option.value = currency;
    option.textContent = currency;
    selectElement.appendChild(option);
  });
}


function parseJwt(token) {
  // 直接從 token 中提取 payload 部分，解碼並解析為 JSON
  return JSON.parse(atob(token.split('.')[1]));
}


function renderUser() {
  const token = localStorage.getItem('token');
  userData = parseJwt(token);
  memberName = document.querySelector('.member-name');
  memberName.textContent = userData['name'];
  const memberEmailSpan = document.createElement('span');
  memberEmailSpan.textContent = ` (${userData['email']})`;
  memberName.appendChild(memberEmailSpan);
}


function handleSubmit() {
  const groupForm = document.getElementById('groupForm')
  groupForm.addEventListener('submit',(e) => {
    e.preventDefault();
    // 獲取群組名稱
    const groupName = document.getElementById('group-name').value;
    // 獲取圖片文件
    const imageFile = document.getElementById('imageUpload').files[0];
    // 獲取群組成員
    const token = localStorage.getItem('token');
    const userData = parseJwt(token);
    let name = userData['name'];
    let email = userData['email'];
    const members = [{name, email}];
    document.querySelectorAll('.member-inputs').forEach(memberInputs => {
      name = memberInputs.querySelector('.member-name-input').value;
      email = memberInputs.querySelector('.member-email-input').value;
      members.push({ name, email });
    });
    // 獲取主要貨幣
    const mainCurrency = document.querySelector('select[name="mainCurrency"]').value;
    // 創建 FormData 對象
    const formData = new FormData();
    formData.append('groupName', groupName);
    formData.append('image', imageFile);
    formData.append('mainCurrency', mainCurrency);
    members.forEach((member, index) => {
      formData.append(`members[${index}][name]`, member.name);
      formData.append(`members[${index}][email]`, member.email);
    });
    // 表單數據發送到後端
    fetch('/api/group', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(result => {
      if (result.ok) {
        window.location.href = '/groups'; 
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
    });
  });
}