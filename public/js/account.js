document.addEventListener("DOMContentLoaded", function() {
  initializeRemoveButtons();
  clickAddAccountButton();
  handleSave();
  fetchAccount();
});


function clickAddAccountButton() {
  const addAccountButton = document.getElementById("addAccountButton");
  addAccountButton.addEventListener("click", () => {
    addAccountInput();
  })
}


function addAccountInput() {
  const accountContainer = document.querySelector(".account-container");
  const addAccountButton = document.getElementById("addAccountButton");
  const accountInputsDiv = document.createElement("div");
  accountInputsDiv.classList.add("account-inputs");

  const swiftCodeInput = document.createElement("input");
  swiftCodeInput.type = "text";
  swiftCodeInput.placeholder = "銀行代碼";
  swiftCodeInput.required = true;
  swiftCodeInput.pattern = "[0-9]+";
  swiftCodeInput.classList.add("swift-code");

  const bankAccountInput = document.createElement("input");
  bankAccountInput.type = "text";
  bankAccountInput.placeholder = "帳號";
  bankAccountInput.required = true;
  bankAccountInput.pattern = "[0-9]+";
  bankAccountInput.classList.add("bank-account");

  const removeButton = document.createElement("button");
  removeButton.classList.add("remove-btn");
  removeButton.textContent = "×";

  removeButton.addEventListener("click", function() {
    accountInputsDiv.remove();
  });

  accountInputsDiv.appendChild(swiftCodeInput);
  accountInputsDiv.appendChild(bankAccountInput);
  accountInputsDiv.appendChild(removeButton);

  accountContainer.insertBefore(accountInputsDiv, addAccountButton.parentElement);
}

function initializeRemoveButtons() {
  const removeButtons = document.querySelectorAll(".remove-btn");
  removeButtons.forEach(button => {
    button.addEventListener("click", function() {
      button.parentElement.remove();
    });
  });
}


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


function handleSave() {
  const token = localStorage.getItem('token');
  const userData = parseJwt(token);
  const accountForm = document.getElementById("account-form"); 

  accountForm.addEventListener("submit", (e) => {
    e.preventDefault(); 
    const saveButton = document.querySelector(".save-button");
    saveButton.disabled = true;

    const accountInputs = document.querySelectorAll(".account-inputs");
    const accounts = [];

    // 遍歷所有輸入容器並檢查數據
    accountInputs.forEach((inputContainer) => {
      const swiftCode = inputContainer.querySelector(".swift-code").value.trim();
      const bankAccount = inputContainer.querySelector(".bank-account").value.trim();
      const userId = userData.id;

      // 確認輸入欄位是否有值
      if (swiftCode && bankAccount) {
        accounts.push({
          user_id: userId,
          SWIFT: swiftCode,
          bankAccountNumber: bankAccount,
        });
      }
    });

    // 如果沒有有效數據，則顯示提示並停止提交
    if (accounts.length === 0) {
      saveButton.disabled = false;
      return;
    }

    // 發送有效數據到後端
    fetch("/api/account", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(accounts),
    })
    .then((response) => response.json())
    .then((result) => {
      if(result.ok) {
        window.location.href = '/account'; 
      } 
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("儲存帳戶時出錯，請稍後重試。");
    })
    .finally(() => {
      saveButton.disabled = false;
    });
  });
}


function fetchAccount() {
  const token = localStorage.getItem('token');
  const userData = parseJwt(token);
  const userId = userData.id;
  fetch(`/api/account/${userId}`, {
    method: "GET",
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  })
  .then((response) => response.json())
  .then((result) => {
    renderAccount(result.accountsData);
  })
  .catch((error) => {
    console.error("Error:", error);
  })
}


function renderAccount(accountsData) {
  const accountForm = document.getElementById("account-form");
  const existAccountContainer = document.createElement("div");
  existAccountContainer.classList.add("exist-account-container");

  accountsData.forEach(account => {
    const accountDiv = document.createElement("div");
    accountDiv.classList.add("account");

    // 創建銀行代碼顯示元素
    const swiftDiv = document.createElement("div");
    swiftDiv.classList.add("exist-account");
    swiftDiv.innerHTML = `銀行代碼：<span>${account.SWIFT}</span>`;

    // 創建銀行帳號顯示元素
    const bankAccountDiv = document.createElement("div");
    bankAccountDiv.classList.add("exist-account");
    bankAccountDiv.innerHTML = `帳號：<span>${account.bankAccountNumber}</span>`;

    // 創建刪除按鈕
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-btn");
    deleteButton.textContent = "×";
    deleteButton.addEventListener("click", () => {
      clickDeleteBtn(account.id, accountDiv); // 傳遞帳戶ID和該DIV進行刪除操作
    });

    // 創建隱藏的帳戶 ID
    const accountIdInput = document.createElement("input");
    accountIdInput.type = "hidden";
    accountIdInput.value = account.id;
    accountIdInput.classList.add("account-id");

    accountDiv.appendChild(accountIdInput); // 隱藏帳戶 ID
    accountDiv.appendChild(swiftDiv);
    accountDiv.appendChild(bankAccountDiv);
    accountDiv.appendChild(deleteButton);

    existAccountContainer.appendChild(accountDiv);
  });
  accountForm.insertBefore(existAccountContainer, accountForm.firstChild);
}


function clickDeleteBtn(accountId, accountDiv) {
  const token = localStorage.getItem('token');
  fetch((`/api/account/${accountId}`), {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  })
  .then(response => response.json())
  .then(result => {
    if (result.ok){
      accountDiv.remove();
    }
  })
  .catch(error => {
    console.error("Error deleting data:", error);
  });
}