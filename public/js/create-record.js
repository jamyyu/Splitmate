document.addEventListener('DOMContentLoaded', () => {
  setCurrentDateTime();
  toggleExpenseAndTransferForms();
  setupCategoryDropdown();
  setupCurrencyDropdown();
  getMember();
  const options = getMember(); 
  initializeCustomSelect('payer', 'payer-options', false, options); // 單選
  initializeCustomSelect('split', 'split-options', true, options);  // 多選
  clickCancelBtn();
  clickSubmitBtn();
});


function setCurrentDateTime() {
  const dateInput = document.getElementById('date');
  const timeInput = document.getElementById('time');

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  dateInput.value = `${year}-${month}-${day}`;
  timeInput.value = `${hours}:${minutes}`;
}


function toggleExpenseAndTransferForms() {
  const expenseTab = document.querySelector('.tab.active');
  const transferTab = document.querySelector('.tab:not(.active)');
  const itemField = document.querySelector('#item').closest('.form-group');
  const payerLabel = document.querySelector('label[for="payer"]');
  const splitLabel = document.querySelector('label[for="split"]');
  const payerButton = document.querySelector('#payer ~ .add-button');
  const splitButton = document.querySelector('#split ~ .add-button');

  transferTab.addEventListener('click', () => {
    expenseTab.classList.remove('active');
    transferTab.classList.add('active');
    // 隱藏品項
    itemField.style.display = 'none';
    // 修改誰付錢為轉帳從
    payerLabel.textContent = '轉帳從';
    // 修改分給誰為轉帳至
    splitLabel.textContent = '轉帳至';
    // 隱藏按鈕
    payerButton.style.display = 'none';
    splitButton.style.display = 'none';
  });

  expenseTab.addEventListener('click', () => {
    expenseTab.classList.add('active');
    transferTab.classList.remove('active');
    // 顯示品項
    itemField.style.display = 'flex';
    // 恢復誰付錢
    payerLabel.textContent = '誰付錢';
    // 恢復分給誰
    splitLabel.textContent = '分給誰';
    // 顯示按鈕
    payerButton.style.display = 'block';
    splitButton.style.display = 'block';
  });
}


function setupCategoryDropdown() {
  const categoryButton = document.getElementById('category-button');
  const categoryDropdown = document.getElementById('category-dropdown');
  // 點擊按鈕顯示或隱藏下拉選單
  categoryButton.addEventListener('click', (e) => {
    e.preventDefault();
    categoryDropdown.classList.toggle('show');
  });
  // 點擊選單項目後，將按鈕修改為選擇的值並隱藏下拉選單
  categoryDropdown.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
      categoryButton.textContent = item.dataset.value; // 修改按鈕內容
      categoryDropdown.classList.remove('show'); // 隱藏下拉選單
    });
  });
  // 點擊下拉選單以外的區域時關閉下拉選單
  document.addEventListener('click', (e) => {
    if (!categoryButton.contains(e.target) && !categoryDropdown.contains(e.target)) {
      categoryDropdown.classList.remove('show'); // 隱藏下拉選單
    }
  });
}

function setupCurrencyDropdown() {
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
  const currencyButton = document.getElementById('currency-display');
  const currencyDropdown = document.getElementById('currency-dropdown');
  const searchInput = document.getElementById('currency-search');
  // 按鈕預設為主要貨幣
  const groupData = JSON.parse(sessionStorage.getItem('groupData'));
  const mainCurrency = groupData.main_currency;
  currencyButton.textContent = mainCurrency
  // 動態生成貨幣選項
  currencies.forEach(currency => {
    const item = document.createElement('div');
    item.classList.add('dropdown-item');
    item.textContent = currency;
    item.addEventListener('click', () => {
      currencyButton.textContent = currency;
      currencyDropdown.classList.remove('show'); 
      // 如果選擇的貨幣不是 mainCurrency，則插入匯率和 mainCurrency 金額欄位
      const groupData = JSON.parse(sessionStorage.getItem('groupData'));
      const mainCurrency = groupData.main_currency;
      if (currency !== mainCurrency) {
        createExchangeRateDiv(currency);
      } else {
        removeExchangeRateDiv(); // 如果選擇的是 mainCurrency，則移除匯率和 mainCurrency 金額欄位
      }
    });
    currencyDropdown.appendChild(item);
  });
  // 點擊按鈕顯示或隱藏下拉選單
  currencyButton.addEventListener('click', (e) => {
    e.preventDefault();
    currencyDropdown.classList.toggle('show');
  });
  // 搜索功能
  searchInput.addEventListener('input', () => {
    const filter = searchInput.value.toUpperCase();
    const items = currencyDropdown.querySelectorAll('.dropdown-item');
    items.forEach(item => {
      if (item.textContent.toUpperCase().includes(filter)) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  });
  // 點擊下拉選單以外的區域時關閉下拉選單
  document.addEventListener('click', (e) => {
    if (!currencyButton.contains(e.target) && !currencyDropdown.contains(e.target)) {
      currencyDropdown.classList.remove('show');
    }
  });
}


async function createExchangeRateDiv(currency) {
  const payerGroup = document.querySelector('.form-group label[for="payer"]').closest('.form-group');
  // 刪除舊的匯率欄位，如果有的話
  removeExchangeRateDiv();
  // 向匯率 API 發送請求以獲得匯率
  const exchangeRate = await fetchExchangeRate(currency);
  // 清空金額輸入框
  const amountInput = document.getElementById('amount');
  amountInput.value = '';
  // 創建一個容器，用於包裹匯率和 mainCurrency 金額
  const formGroupInline = document.createElement('div');
  formGroupInline.classList.add('form-group-inline');
  // 創建匯率的 div
  const exchangeRateDiv = document.createElement('div');
  exchangeRateDiv.classList.add('form-group', 'rate-item');
  exchangeRateDiv.id = 'exchange-rate';

  const exchangeRateLabel = document.createElement('label');
  exchangeRateLabel.textContent = '匯率';
  exchangeRateDiv.appendChild(exchangeRateLabel);

  const exchangeRateValue = document.createElement('input');
  exchangeRateValue.type = 'number';
  exchangeRateValue.name = 'rate';
  exchangeRateValue.classList.add('text-input');
  exchangeRateValue.value = exchangeRate; // 使用從 API 獲得的匯率
  exchangeRateValue.readOnly = true; // 設置為 readonly
  exchangeRateDiv.appendChild(exchangeRateValue);
  // 創建 mainCurrency 金額的 div
  const mainCurrencyAmountDiv = document.createElement('div');
  mainCurrencyAmountDiv.classList.add('form-group', 'rate-item');
  mainCurrencyAmountDiv.id = 'main-currency-amount';

  const mainCurrencyAmountLabel = document.createElement('label');
  mainCurrencyAmountLabel.textContent = '換算成主要貨幣金額';
  mainCurrencyAmountDiv.appendChild(mainCurrencyAmountLabel);

  const mainCurrencyAmountValue = document.createElement('input');
  mainCurrencyAmountValue.type = 'number';
  mainCurrencyAmountValue.name = 'mainCurrencyAmount';
  mainCurrencyAmountValue.classList.add('text-input');
  const groupData = JSON.parse(sessionStorage.getItem('groupData'));
  const mainCurrency = groupData.main_currency;
  mainCurrencyAmountValue.placeholder = `${mainCurrency} 金額`;  // 這裡可以根據實際情況計算和設置
  mainCurrencyAmountValue.readOnly = true; // 設置為 readonly
  mainCurrencyAmountDiv.appendChild(mainCurrencyAmountValue);
  // 將 exchangeRateDiv 和 mainCurrencyAmountDiv 添加到 formGroupInline 中
  formGroupInline.appendChild(exchangeRateDiv);
  formGroupInline.appendChild(mainCurrencyAmountDiv);
  // 將 formGroupInline 插入到 "誰付錢" 的表格之前
  payerGroup.parentNode.insertBefore(formGroupInline, payerGroup);
  // 添加事件監聽器到金額輸入框，用於計算和顯示台幣金額
  amountInput.addEventListener('input', () => {
    const amount = parseFloat(amountInput.value) || 0;
    mainCurrencyAmountValue.value = (amount * exchangeRate).toFixed(2); // 計算台幣金額，並顯示在 mainCurrency 金額欄位中
  });
}


function removeExchangeRateDiv() {
  const formGroupInline = document.querySelector('.form-group-inline');
  if (formGroupInline) {
    formGroupInline.remove();
  }
}


async function fetchExchangeRate(currency) {
  const groupData = JSON.parse(sessionStorage.getItem('groupData'));
  const mainCurrency = groupData.main_currency;
  try {
    const response = await fetch(`/api/expense/exchange-rate?mainCurrency=${mainCurrency}&currency=${currency}`);
    const result = await response.json();
    return result.exchangeRate;
  } catch (error) {
    console.error('獲取匯率失敗:', error);
    return 1; // 如果 API 請求失敗，默認為 1
  }
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


function getMember(){
  const options = [];
  const token = localStorage.getItem('token');
  userData = parseJwt(token);
  const memberData = JSON.parse(sessionStorage.getItem('memberData'));
  memberData.forEach(member => {
    const name = member.user_name || member.member_name;
    if (name === userData.name){
      options.push('你');
    } else {
      options.push(name);
    }
  })
  return options; // 返回 options 陣列 
}


function initializeCustomSelect(selectBtnId, optionGroupId, multiple, options) {
  const selectBtn = document.getElementById(selectBtnId);
  const optionGroup = document.getElementById(optionGroupId);
  const placeholderText = selectBtn.getAttribute('data-title');
  // 動態生成選項
  options.forEach(option => {
    const label = document.createElement('label');
    if (multiple) {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = option;
      label.appendChild(checkbox);
    }
    label.appendChild(document.createTextNode(' ' + option));
    optionGroup.appendChild(label);
  });
  // 如果是單選，添加 single-select 樣式
  if (!multiple) {
    optionGroup.classList.add('single-select');
  }
  // 顯示/隱藏下拉選單
  selectBtn.addEventListener('click', function(e) {
    e.stopPropagation(); // 防止事件冒泡
    optionGroup.classList.toggle('show');
  });
  // 更新選擇內容
  const checkOptions = optionGroup.querySelectorAll('input[type="checkbox"], label');
  const selected = [];

  checkOptions.forEach(function(option) {
    option.addEventListener('click', function() {
      if (multiple) {
        const parentLabel = option.parentElement;
        if (parentLabel.classList.contains('checked')) {
          parentLabel.classList.remove('checked');
          selected.splice(selected.indexOf(option.value), 1);
        } else {
          parentLabel.classList.add('checked');
          selected.push(option.value);
        }
      } else {
        // 單選邏輯
        checkOptions.forEach(opt => {
          opt.classList.remove('checked');
        });
        option.classList.add('checked');
        selected.length = 0; // 清空選擇的項目
        selected.push(option.textContent.trim());
        optionGroup.classList.remove('show'); // 關閉選單
      }
      selectBtn.textContent = selected.length > 0 ? selected.join(', ') : placeholderText;
    });
  });

  // 點擊其他地方時關閉下拉選單
  document.addEventListener('click', function(e) {
    if (!selectBtn.contains(e.target) && !optionGroup.contains(e.target)) {
      optionGroup.classList.remove('show');
    }
  });
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


function clickSubmitBtn() {
  const expenseForm = document.getElementById('expense-form');
  const submitBtn = document.querySelector('.submit-button');
  const token = localStorage.getItem('token');
  const userData = parseJwt(token);
  const currentUserName = userData.name;

  expenseForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // 防止表單的預設提交行為

    // 禁用提交按鈕，防止重複提交
    submitBtn.disabled = true;

    // 獲取數據
    const groupData = JSON.parse(sessionStorage.getItem('groupData'));
    const groupId = groupData.id;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const category = document.getElementById('category-button').textContent.trim();
    const item = document.getElementById('item').value.trim();
    const currency = document.getElementById('currency-display').textContent.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const exchangeRateElement = document.getElementById('exchange-rate');
    const exchangeRate = exchangeRateElement ? parseFloat(exchangeRateElement.querySelector('input').value) : null;
    const mainCurrencyAmount = document.getElementById('main-currency-amount') ? parseFloat(document.getElementById('main-currency-amount').querySelector('input').value) : amount;
    let payer = document.getElementById('payer').textContent.trim();
    if (payer === '你') {
      payer = currentUserName;
    }
    let splitMembers = Array.from(document.getElementById('split').textContent.trim().split(','))
    .map(member => member.trim())
    .filter(member => member !== '')
    .map(member => member === '你' ? currentUserName : member);
    const note = document.getElementById('note').value.trim() || null;
    const image = document.getElementById('image').files.length > 0 ? document.getElementById('image').files[0] : null; // 檢查是否有圖片
    // 檢查必填字段
    if (!payer) {
      alert('請選擇一個付款人');
      submitBtn.disabled = false;
      return; // 阻止提交
    }
    if (splitMembers.length === 0 || (splitMembers.length === 1 && splitMembers[0] === '')) {
      alert('請選擇至少一個分帳成員');
      submitBtn.disabled = false;
      return; // 阻止提交
    }
    // 構建表單數據物件
    const formData = new FormData();
    formData.append('groupId', groupId);
    formData.append('date', date);
    formData.append('time', time);
    formData.append('category', category);
    formData.append('item', item);
    formData.append('currency', currency);
    formData.append('amount', amount);
    formData.append('exchangeRate', exchangeRate);
    formData.append('mainCurrencyAmount', mainCurrencyAmount);
    formData.append('payer', payer);
    splitMembers.forEach(member => formData.append('splitMembers[]', member)); // 添加分給誰
    formData.append('note', note);
    formData.append('image', image); // 添加圖片文件

    try {
      // 發送 POST 請求到後端 API
      const response = await fetch('/api/expense', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (response.ok) {
        // 成功處理後的操作
        alert('紀錄已成功新增');
        window.location.href = `/group/${groupId}`; 
      } else {
        // 顯示錯誤信息
        alert(`新增失敗: ${result.message}`);
        submitBtn.disabled = false; // 重新啟用提交按鈕
      }
    } catch (error) {
      console.error('提交失敗:', error);
      alert('提交失敗，請稍後再試。');
      submitBtn.disabled = false; // 重新啟用提交按鈕
    }
  });
}