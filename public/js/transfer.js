document.addEventListener('DOMContentLoaded', () => {
  fetchTransfer();
  clickCancelBtn();
  clickDeleteBtn();
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


function fetchTransfer(){
  const groupData = JSON.parse(sessionStorage.getItem('groupData'));
  const groupId = groupData.id
  // 透過路徑獲得 transferId
  const pathname = window.location.pathname;
  const transferId = pathname.split('/')[2];
  const token = localStorage.getItem('token');
  fetch((`/api/transfer/${groupId}/${transferId}`), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  })
  .then(response => response.json())
  .then(result => {
    const transferData = result.transferData[0];
    renderTransfer(transferData, token);
  })
  .catch(error => {
    console.error("Error fetching data:", error);
  });
}



function renderTransfer(transferData ,token){
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
  const userData = parseJwt(token);
  const transferDate = document.querySelector('.expense-date');
  transferDate.textContent = new Date(transferData.date).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) + '\u00A0' + transferData.time.slice(0, 5);
  const amount = document.getElementById('amount');
  const rate = document.getElementById('rate');
  const groupData = JSON.parse(sessionStorage.getItem('groupData'));
  const mainCurrency = groupData.main_currency;
  const currencySymbol = currency_symbols[transferData.currency] || transferData.currency;
  const mainCurrencySymbol = currency_symbols[mainCurrency] || mainCurrency;
  const transferFromName = document.querySelector('.payer-name');
  const transferFromIcon = document.querySelector('.payer-icon');
  const transferToName = document.querySelector('.receiver-name');
  const transferToIcon = document.querySelector('.receiver-icon');
  // 檢查轉帳人，如果是userData.name，顯示'你'
  const transferFromNameText = transferData.transferFrom[0].transferFrom_name === userData.name ? '你' : transferData.transferFrom[0].transferFrom_name;
  transferFromName.textContent = transferFromNameText;
  if (transferData.transferFrom[0].transferFrom_image_name){
    transferFromIcon.src = 'https://d3q4cpn0fxi6na.cloudfront.net/' + transferData.transferFrom[0].transferFrom_image_name;
  } else {
    transferFromIcon.src = '/images/profile-icon.png';
  }
  if (mainCurrency === transferData.currency){
    amount.textContent = currencySymbol + transferData.amount;
  } else {
    amount.textContent = `${currencySymbol}${transferData.amount} = ${mainCurrencySymbol}${transferData.mainCurrencyAmount}`;
    rate.textContent = '匯率：' + transferData.exchangeRate;
  }
  // 檢查被轉帳人，如果是userData.name，顯示'你'
  const transferToNameText = transferData.transferTo[0].transferTo_name === userData.name ? '你' : transferData.transferTo[0].transferTo_name;
  transferToName.textContent = transferToNameText;
  if (transferData.transferTo[0].transferTo_image_name){
    transferToIcon.src = 'https://d3q4cpn0fxi6na.cloudfront.net/' + transferData.transferTo[0].transferTo_image_name;
  } else {
    transferToIcon.src = '/images/profile-icon.png';
  }

  const note = document.querySelector('.note');
  if (transferData.note !== 'null'){
    note.textContent = transferData.note;
  }
  if (transferData.image_name !== null){
    const expenseImage = document.querySelector('.expense-image');
    const image = document.createElement('img');
    image.src = 'https://d3q4cpn0fxi6na.cloudfront.net/' + transferData.image_name;
    expenseImage.appendChild(image);
  }
}


function clickCancelBtn() {
  const CancelBtn = document.querySelector('.cancel-button');
  const groupData = JSON.parse(sessionStorage.getItem('groupData'));
  const groupId = groupData.id;
  CancelBtn.addEventListener('click',(e) => {
    e.preventDefault(); // 防止預設行為
    window.location.href = `/group/${groupId}`;
  })
}


function clickDeleteBtn() {
  const deleteBtn = document.querySelector('.delete-button');
  deleteBtn.addEventListener('click',(e) => {
    e.preventDefault(); // 防止預設行為
    const confirmed = confirm('確定要刪除這筆轉帳嗎？');
    if (!confirmed) {
      return; // 如果用戶點擊“取消”，則不刪除
    }
    const groupData = JSON.parse(sessionStorage.getItem('groupData'));
    const groupId = groupData.id
    // 透過路徑獲得 transferId
    const pathname = window.location.pathname;
    const transferId = pathname.split('/')[2];
    const token = localStorage.getItem('token');
    fetch((`/api/transfer/${groupId}/${transferId}`), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    })
    .then(response => response.json())
    .then(result => {
      if (result.ok){
        window.location.href = `/group/${groupId}`;
      }
    })
    .catch(error => {
      console.error("Error deleting data:", error);
    });
  })
}