document.addEventListener('DOMContentLoaded', () => {
  fetchGroup();
  clickAddButton();
  fetchExpense();
  clickSettlementBtn();
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
    toggleButtonsBasedOnRole();
    const editBtn = document.querySelector('.edit-btn');
    const checkBtn = document.querySelector('.check-btn');
    if (editBtn){
      clickEditBtn();
    }
    if(checkBtn){
      clickCheckBtn();
    }
  })
  .catch(error => {
    console.error("Error fetching data:", error);
  });
}


function renderGroup(groupData){
  const groupImage = document.getElementById('group-image');
  if (groupData.image_name === null ){
    groupImage.src = '/images/template.jpg';
  } else {
    groupImage.src = 'https://d3q4cpn0fxi6na.cloudfront.net/' + groupData.image_name;
  }
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
      console.log(result)
      const recordData = result.recordData;
      renderRecord(recordData, token);
    })
    .catch(error => {
      console.error("Error fetching data:", error);
    });
  }


function renderRecord(recordData, token) {
  // 定義貨幣符號字典
  const currency_symbols = {
    'TWD': 'NT$', 'USD': '$', 'GBP': '£', 'EUR': '€', 'JPY': '¥',
    'KRW': '₩', 'THB': '฿', 'CNY': '¥', 'AED': 'د.إ', 'AFN': '؋',
    'ALL': 'L', 'AMD': '֏', 'ANG': 'ƒ', 'AOA': 'Kz', 'ARS': '$',
    'AUD': 'A$', 'AWG': 'ƒ', 'AZN': '₼', 'BAM': 'KM', 'BBD': 'Bds$',
    'BDT': '৳', 'BGN': 'лв', 'BHD': 'BD', 'BIF': 'FBu', 'BMD': 'BD$',
    'BND': 'B$', 'BOB': 'Bs.', 'BRL': 'R$', 'BSD': 'B$', 'BTN': 'Nu.',
    'BWP': 'P', 'BYN': 'Br', 'BZD': 'BZ$', 'CAD': 'C$', 'CDF': 'FC',
    'CHF': 'CHF', 'CLP': '$', 'COP': '$', 'CRC': '₡', 'CUP': '$',
    'CVE': 'Esc', 'CZK': 'Kč', 'DJF': 'Fdj', 'DKK': 'kr', 'DOP': 'RD$',
    'DZD': 'DA', 'EGP': 'ج.م', 'ERN': 'Nfk', 'ETB': 'Br', 'FJD': 'FJ$',
    'FKP': '£', 'FOK': 'kr', 'GEL': '₾', 'GGP': '£', 'GHS': '₵',
    'GIP': '£', 'GMD': 'D', 'GNF': 'FG', 'GTQ': 'Q', 'GYD': 'GY$',
    'HKD': 'HK$', 'HNL': 'L', 'HRK': 'kn', 'HTG': 'G', 'HUF': 'Ft',
    'IDR': 'Rp', 'ILS': '₪', 'IMP': '£', 'INR': '₹', 'IQD': 'د.ع',
    'IRR': '﷼', 'ISK': 'kr', 'JEP': '£', 'JMD': 'J$', 'JOD': 'JD',
    'KES': 'KSh', 'KGS': 'с', 'KHR': '៛', 'KID': 'A$', 'KMF': 'CF',
    'KWD': 'KD', 'KYD': 'CI$', 'KZT': '₸', 'LAK': '₭', 'LBP': 'ل.ل',
    'LKR': 'Rs', 'LRD': 'L$', 'LSL': 'M', 'LYD': 'LD', 'MAD': 'DH',
    'MDL': 'L', 'MGA': 'Ar', 'MKD': 'ден', 'MMK': 'K', 'MNT': '₮',
    'MOP': 'MOP$', 'MRU': 'UM', 'MUR': '₨', 'MVR': 'ރ', 'MWK': 'MK',
    'MXN': 'Mex$', 'MYR': 'RM', 'MZN': 'MT', 'NAD': 'N$', 'NGN': '₦',
    'NIO': 'C$', 'NOK': 'kr', 'NPR': 'रू', 'NZD': 'NZ$', 'OMR': '﷼',
    'PAB': 'B/.', 'PEN': 'S/.', 'PGK': 'K', 'PHP': '₱', 'PKR': '₨',
    'PLN': 'zł', 'PYG': '₲', 'QAR': 'QR', 'RON': 'lei', 'RSD': 'din',
    'RUB': '₽', 'RWF': 'RF', 'SAR': '﷼', 'SBD': 'SI$', 'SCR': '₨',
    'SDG': 'SD', 'SEK': 'kr', 'SGD': 'S$', 'SHP': '£', 'SLE': 'Le',
    'SLL': 'Le', 'SOS': 'Sh', 'SRD': '$', 'SSP': '£', 'STN': 'Db',
    'SYP': 'LS', 'SZL': 'E', 'TJS': 'SM', 'TMT': 'T', 'TND': 'DT',
    'TOP': 'T$', 'TRY': '₺', 'TTD': 'TT$', 'TVD': 'A$', 'TZS': 'TSh',
    'UAH': '₴', 'UGX': 'USh', 'UYU': '$U', 'UZS': "so'm", 'VES': 'Bs.',
    'VND': '₫', 'VUV': 'VT', 'WST': 'WS$', 'XAF': 'FCFA', 'XCD': 'EC$',
    'XDR': 'SDR', 'XOF': 'CFA', 'XPF': 'F', 'YER': '﷼', 'ZAR': 'R',
    'ZMW': 'ZK', 'ZWL': 'Z$'
  };
  const categoryImages = {
    '食': '/images/食.png',
    '衣': '/images/衣.png',
    '住': '/images/住.png',
    '行': '/images/行.png',
    '育': '/images/育.png',
    '樂': '/images/樂.png'
  };
  // 解碼 JWT，獲取用戶數據
  const userData = parseJwt(token);
  // 選擇 .activity-details 容器
  const activityDetailsContainer = document.querySelector('.activity-details');
  // 遍歷每個日期組
  recordData.forEach(group => {
    // 創建一個包含日期的 <h2> 元素
    const dateHeading = document.createElement('h2');
    dateHeading.textContent = new Date(group.date).toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    // 將日期添加到 .activity-details 容器
    activityDetailsContainer.appendChild(dateHeading);
    // 遍歷每個日期下的records
    group.records.forEach(record => {
      if(record.record_type === 'expense'){
        // 查找當前用戶在members中的分攤金額
        const userMember = record.members.find(member => member.member === userData.name);
        const userMemberAmount = userMember ? userMember.member_amount : '';
        // 創建<a>標籤
        const link = document.createElement("a");
        link.setAttribute("href", `/expense/${record.record_id}`);
        // 創建 .activity-item 容器
        const activityItemDiv = document.createElement('div');
        activityItemDiv.classList.add('activity-item');
        // 創建 .activity-description 容器
        const activityDescriptionDiv = document.createElement('div');
        activityDescriptionDiv.classList.add('activity-description');

        const activityIconSpan = document.createElement('span');
        const activityImg = document.createElement('img');
        activityImg.src = categoryImages[record.category];
        activityIconSpan.appendChild(activityImg);
        activityIconSpan.classList.add('activity-icon');

        const itemText = document.createTextNode(` ${record.item}`);

        const activityCostSpan = document.createElement('span');
        activityCostSpan.classList.add('activity-cost');
        if (userMemberAmount) {
          // 查找對應的貨幣符號，沒有則使用原始貨幣代碼
          const currencySymbol = currency_symbols[record.currency] || record.currency;
          activityCostSpan.textContent = `${currencySymbol}${userMemberAmount}`;
        } // 如果userMemberAmount是空的，則不顯示currency和amount

        // 將所有子元素添加到 .activity-description 容器
        activityDescriptionDiv.appendChild(activityIconSpan);
        activityDescriptionDiv.appendChild(itemText);
        activityDescriptionDiv.appendChild(activityCostSpan);
        // 創建 .activity-payment 容器
        const activityPaymentDiv = document.createElement('div');
        activityPaymentDiv.classList.add('activity-payment');
        // 檢查payer，如果是userData.name，顯示'你'
        const payerText = record.payer === userData.name ? '你' : record.payer;
        const currencySymbol = currency_symbols[record.currency] || record.currency;
        activityPaymentDiv.textContent = `${payerText} 先付 ${currencySymbol}${record.paid_amount}`;
        // 將 .activity-description 和 .activity-payment 容器添加到 .activity-item 容器
        activityItemDiv.appendChild(activityDescriptionDiv);
        activityItemDiv.appendChild(activityPaymentDiv);
        // 將 .activity-item 容器添加到 <a>，再把 <a>加到 .activity-details 容器
        link.appendChild(activityItemDiv);
        activityDetailsContainer.appendChild(link);
      } else {
        // 創建<a>標籤
        const link = document.createElement("a");
        link.setAttribute("href", `/transfer/${record.record_id}`);
        // 創建 .activity-item 容器
        const activityItemDiv = document.createElement('div');
        activityItemDiv.classList.add('activity-item');
        // 創建 .activity-description 容器
        const activityDescriptionDiv = document.createElement('div');
        activityDescriptionDiv.classList.add('activity-description');

        const activityIconSpan = document.createElement('span');
        activityIconSpan.classList.add('activity-icon');
        activityIconSpan.textContent = '💸'; 

        const payerText = record.payer === userData.name ? '你' : record.payer;
        const memberText = record.members[0].member === userData.name ? '你' : record.members[0].member;
        const currencySymbol = currency_symbols[record.currency] || record.currency;
        const itemTextElement = document.createElement('span');
        itemTextElement.textContent = ` ${payerText} 轉帳給 ${memberText} ${currencySymbol}${record.amount}`;
        itemTextElement.style.color = '#888'; // 指定顏色
        itemTextElement.style.fontSize = 'small';

        const activityCostSpan = document.createElement('span');
        activityCostSpan.classList.add('transfer-income');
        const userMember = record.members.find(member => member.member === userData.name);
        const userMemberAmount = userMember ? record.amount : '';
        if (userMemberAmount) {
          // 查找對應的貨幣符號，沒有則使用原始貨幣代碼
          const currencySymbol = currency_symbols[record.currency] || record.currency;
          activityCostSpan.textContent = `${currencySymbol}${userMemberAmount}`;
        } // 如果userMemberAmount是空的，則不顯示currency和amount
        // 將所有子元素添加到 .activity-description 容器
        activityDescriptionDiv.appendChild(activityIconSpan);
        activityDescriptionDiv.appendChild(itemTextElement);
        activityDescriptionDiv.appendChild(activityCostSpan);
        // 將 .activity-description 添加到 .activity-item 容器
        activityItemDiv.appendChild(activityDescriptionDiv);
        // 將 .activity-item 容器添加到 <a>，再把 <a>加到 .activity-details 容器
        link.appendChild(activityItemDiv);
        activityDetailsContainer.appendChild(link);
      }
    });
  });
}


function clickSettlementBtn(){
  const settlementBtn = document.querySelector('.settlement-btn');
  settlementBtn.addEventListener('click',() => {
    const pathname = window.location.pathname;
    const groupId = pathname.split('/')[2];
    window.location.href = `/group/${groupId}/balance`;
  })
}


function toggleButtonsBasedOnRole() {
  const memberData = JSON.parse(sessionStorage.getItem('memberData'));
  const token = localStorage.getItem('token');
  const userData = parseJwt(token);
  const userName = userData.name;

  // 找到當前用戶的數據
  const currentUser = memberData.find(member => member.user_name === userName);

  if (currentUser) {
    const imageSection = document.querySelector('.image-section');
    
    // 找到“結餘”按鈕
    const settlementBtn = imageSection.querySelector('.settlement-btn');

    // 先移除現有的編輯和查看按鈕
    imageSection.querySelectorAll('.edit-btn, .check-btn').forEach(btn => btn.remove());

    let newBtn;
    if (currentUser.role === 'admin') {
      // 如果是 admin，創建 "編輯" 按鈕
      newBtn = document.createElement('button');
      newBtn.className = 'edit-btn';
      newBtn.textContent = '編輯';
    } else {
      // 如果不是 admin，創建 "查看" 按鈕
      newBtn = document.createElement('button');
      newBtn.className = 'check-btn';
      newBtn.textContent = '查看';
    }

    // 確保新按鈕插入到“結餘”按鈕前面
    if (newBtn && settlementBtn) {
      imageSection.insertBefore(newBtn, settlementBtn);
    }
  }
}


function clickEditBtn(){
  const editBtn = document.querySelector('.edit-btn');
  editBtn.addEventListener('click',() => {
    const pathname = window.location.pathname;
    const groupId = pathname.split('/')[2];
    window.location.href = `/group/${groupId}/edit-group`;
  })
}


function clickCheckBtn(){
  const checkBtn = document.querySelector('.check-btn');
  checkBtn.addEventListener('click',() => {
    const pathname = window.location.pathname;
    const groupId = pathname.split('/')[2];
    window.location.href = `/group/${groupId}/view-group`;
  })
}