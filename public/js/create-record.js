document.addEventListener('DOMContentLoaded', () => {
  setCurrentDateTime();
  toggleExpenseAndTransferForms();
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