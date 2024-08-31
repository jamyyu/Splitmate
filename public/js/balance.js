document.addEventListener('DOMContentLoaded', () => {
  fetchGroupBalanceData();
  clickBackBtn()
});


function fetchGroupBalanceData(){
  const pathname = window.location.pathname;
  const groupId = pathname.split('/')[2];
  const token = localStorage.getItem('token');
    fetch((`/api/expense/${groupId}/balance`), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    })
    .then(response => response.json())
    .then(result => {
      const groupBalanceData = result.groupBalanceData;
      const payments = result.payments;
      renderGroupBalanceData(groupBalanceData, payments, token);
    })
    .catch(error => {
      console.error("Error fetching data:", error);
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


function renderGroupBalanceData(groupBalanceData, payments, token){
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
  const groupData = JSON.parse(sessionStorage.getItem('groupData'));
  const mainCurrency = groupData.main_currency;
  const mainCurrencySymbol = currency_symbols[mainCurrency] || mainCurrency;
  const balanceInfo = document.querySelector('.balance-info');
  groupBalanceData.forEach(member => {
    const memberInfo = document.createElement('div')
    memberInfo.className = 'member-info';
    const memberIcon = document.createElement('img');
    memberIcon.className = 'member-icon';
    if (member.image){
      memberIcon.src = 'https://d3q4cpn0fxi6na.cloudfront.net/' + member.image;
    } else {
      memberIcon.src = '/images/profile-icon.png';
    }
    const memberName = document.createElement('span');
    memberName.className = 'member-name';
    const memberText = member.member === userData.name ? '你' : member.member;
    // 處理 balance，先移除逗號，然後加入貨幣符號和正負號
    let balance = parseFloat(member.balance.replace(/,/g, ''));
    let balanceText;
    if (balance > 0) {
      balanceText = `+${mainCurrencySymbol}${balance.toLocaleString()}`;
    } else if (balance == 0) {
      balanceText = mainCurrencySymbol + '0';
    } else {
      balanceText = `-${mainCurrencySymbol}${Math.abs(balance).toLocaleString()}`;
    } 
    memberName.textContent = memberText + '\u00A0' + balanceText;
    
    memberInfo.appendChild(memberIcon);
    memberInfo.appendChild(memberName);
    balanceInfo.appendChild(memberInfo);
  })
  const divider = document.createElement('hr');
  divider.className = 'divider';
  balanceInfo.appendChild(divider);

  payments.forEach(payment => {
    const paymentContainer = document.createElement('div');
    paymentContainer.className = 'payment-container';
    const payerInfo = document.createElement('div');
    payerInfo.className ='payer-info';
    const payerIcon = document.createElement('img');
    payerIcon.className = 'payer-icon';
    if (payment.payerImage) {
      payerIcon.src = 'https://d3q4cpn0fxi6na.cloudfront.net/'+ payment.payerImage;
    } else {
      payerIcon.src = '/images/profile-icon.png';
    }
    
    const payerName = document.createElement('span');
    payerName.className = 'payer-name';
    payerName.textContent = payment.from;

    payerInfo.appendChild(payerIcon);
    payerInfo.appendChild(payerName);

    const transferContainer = document.createElement('div');
    transferContainer.className ='transfer-container';
    const arrowImage = document.createElement('img');
    arrowImage.src = '/images/down-arrow.png';
    const transferInfo = document.createElement('div');
    transferInfo.className = 'transfer-info';
    const amount = document.createElement('div');
    amount.id = 'amount';
    amount.textContent = mainCurrencySymbol + payment.amount;

    transferInfo.appendChild(amount);
    transferContainer.appendChild(arrowImage);
    transferContainer.appendChild(transferInfo);

    const receiverInfo = document.createElement('div');
    receiverInfo.className = 'receiver-info';
    const receiverIcon = document.createElement('img');
    receiverIcon.className = 'receiver-icon';
    if (payment.receiverImage) {
      receiverIcon.src = 'https://d3q4cpn0fxi6na.cloudfront.net/'+ payment.receiverImage;
    } else {
      receiverIcon.src = '/images/profile-icon.png';
    }
    const receiverName = document.createElement('span');
    receiverName.className = 'receiver-name';
    receiverName.textContent = payment.to;

    receiverInfo.appendChild(receiverIcon);
    receiverInfo.appendChild(receiverName);

    paymentContainer.appendChild(payerInfo);
    paymentContainer.appendChild(transferContainer);
    paymentContainer.appendChild(receiverInfo);
    balanceInfo.appendChild(paymentContainer);
  })
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