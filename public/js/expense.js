document.addEventListener('DOMContentLoaded', () => {
  fetchExpense();
  clickCancelBtn();
  clickDeleteBtn();
});


function fetchExpense(){
  const groupData = JSON.parse(sessionStorage.getItem('groupData'));
  const groupId = groupData.id
  // 透過路徑獲得 expenseId
  const pathname = window.location.pathname;
  const expenseId = pathname.split('/')[2];
  const token = localStorage.getItem('token');
  fetch((`/api/expense/${groupId}/${expenseId}`), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  })
  .then(response => response.json())
  .then(result => {
    const expenseData = result.expenseData[0];
    renderExpense(expenseData, token)
  })
  .catch(error => {
    console.error("Error fetching data:", error);
  });
}



function renderExpense(expenseData, token){
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
  const expenseDate = document.querySelector('.expense-date');
  expenseDate.textContent = new Date(expenseData.date).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) + '\u00A0' + expenseData.time.slice(0, 5);
  const itemName = document.querySelector('.item-name');
  itemName.textContent = expenseData.category + '\u00A0' + expenseData.item;
  const itemAmount = document.querySelector('.item-amount');
  const rate = document.getElementById('rate');
  const groupData = JSON.parse(sessionStorage.getItem('groupData'));
  const mainCurrency = groupData.main_currency;
  const currencySymbol = currency_symbols[expenseData.currency] || expenseData.currency;
  const mainCurrencySymbol = currency_symbols[mainCurrency] || mainCurrency;
  const payerName = document.querySelector('.payer-name');
  const payerIcon = document.querySelector('.payer-icon');
  const payerText = expenseData.payer_name === userData.name ? '你' : expenseData.payer_name;
  
  if (expenseData.payer_image_name){
    payerIcon.src = 'https://d3q4cpn0fxi6na.cloudfront.net/' + expenseData.payer_image_name;
  } else {
    payerIcon.src = '/images/profile-icon.png';
  }
  if (mainCurrency === expenseData.currency){
    itemAmount.textContent = currencySymbol + expenseData.amount;
    payerName.textContent = payerText + '\u00A0' + '先付'+ '\u00A0' + currencySymbol + expenseData.paid_amount;
  } else {
    itemAmount.textContent = `${currencySymbol}${expenseData.amount}\u00A0(${mainCurrencySymbol}${expenseData.mainCurrencyAmount}) `;
    rate.textContent = '匯率：' + expenseData.exchangeRate;
    payerName.textContent = `${payerText}\u00A0先付\u00A0${currencySymbol}${expenseData.paid_amount}\u00A0(${mainCurrencySymbol}${expenseData.paid_main_currency_amount})`;
  }
  // 想插入的參考點
  const referencePoint = document.getElementById('reference-point');
  expenseData.members.forEach(member => {
    const debtorInfo = document.createElement('div');
    debtorInfo.className = 'debtor-info';
    const debtorIcon = document.createElement('img');
    debtorIcon.className = 'debtor-icon';
    debtorIcon.alt = 'Debtor Icon';
    const debtorName = document.createElement('span');
    debtorName.className = 'debtor-name';
    const memberText = member.member_name === userData.name ? '你' : member.member_name;

    debtorInfo.appendChild(debtorIcon);
    debtorInfo.appendChild(debtorName);
    referencePoint.insertAdjacentElement('beforebegin', debtorInfo);
    
    if (member.member_image_name){
      debtorIcon.src = 'https://d3q4cpn0fxi6na.cloudfront.net/' + member.member_image_name;
    } else {
      debtorIcon.src = '/images/profile-icon.png';
    }
    if (mainCurrency === expenseData.currency){
      debtorName.textContent = memberText + '\u00A0' + '欠款' + '\u00A0' + currencySymbol + member.member_amount;
    } else {
      debtorName.textContent = `${memberText}\u00A0欠款\u00A0${currencySymbol}${member.member_amount}\u00A0(${mainCurrencySymbol}${member.member_main_currency_amount})`;
    }
  });
  const note = document.querySelector('.note');
  if (expenseData.note !== 'null'){
    note.textContent = expenseData.note;
  }
  if (expenseData.image_name !== null){
    const expenseImage = document.querySelector('.expense-image');
    const image = document.createElement('img');
    image.src = 'https://d3q4cpn0fxi6na.cloudfront.net/' + expenseData.image_name;
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
    const confirmed = confirm('確定要刪除這筆花費嗎？');
    if (!confirmed) {
      return; // 如果用戶點擊“取消”，則不刪除
    }
    const groupData = JSON.parse(sessionStorage.getItem('groupData'));
    const groupId = groupData.id
    // 透過路徑獲得 expenseId
    const pathname = window.location.pathname;
    const expenseId = pathname.split('/')[2];
    const token = localStorage.getItem('token');
    fetch((`/api/expense/${groupId}/${expenseId}`), {
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