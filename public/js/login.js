document.addEventListener("DOMContentLoaded", function() {
  // 自動填入測試用帳號和密碼
  document.getElementById('sign-in-email').value = 'testuser@example.com';
  document.getElementById('sign-in-password').value = 'testpassword';
  clickToggleForms();
  signUp();
  signIn();

  // 點擊 "立即登入使用" 按鈕顯示登入/註冊表單和遮罩層
  const showLoginButton = document.querySelector('.signup-button');
  const loginContainer = document.querySelector('.login-container');
  const overlay = document.getElementById('overlay');

  showLoginButton.addEventListener('click', function(event) {
    loginContainer.classList.remove('hide'); // 顯示登入/註冊表單
    overlay.classList.remove('hide'); // 顯示遮罩層
    event.stopPropagation();
  });

  // 點擊遮罩層或表單外部時隱藏登入/註冊表單和遮罩層
  document.addEventListener('click', function(event) {
    if (!loginContainer.classList.contains('hide') && !loginContainer.contains(event.target) && !showLoginButton.contains(event.target)) {
      loginContainer.classList.add('hide'); // 隱藏登入/註冊表單
      overlay.classList.add('hide'); // 隱藏遮罩層
    }
  });

  // 阻止點擊登入/註冊表單本身時關閉表單
  loginContainer.addEventListener('click', function(event) {
    event.stopPropagation();
  });
});

function clickToggleForms() {
  const signInButton = document.getElementById('sign-in');
  const signUpButton = document.getElementById('sign-up');
  const signInForm = document.getElementById('sign-in-form');
  const signUpForm = document.getElementById('sign-up-form');

  // 初始狀態：顯示登入表單，隱藏註冊表單
  signInForm.style.display = 'block';
  signUpForm.style.display = 'none';

  // 點擊登入按鈕
  signInButton.addEventListener('click', function() {
    // 自動填入測試用帳號和密碼
    document.getElementById('sign-in-email').value = 'testuser@example.com';
    document.getElementById('sign-in-password').value = 'testpassword';
    signInForm.style.display = 'block';
    signUpForm.style.display = 'none';
    signInButton.classList.add('active');
    signUpButton.classList.remove('active');
  });

  // 點擊註冊按鈕
  signUpButton.addEventListener('click', function() {
    // 清空登入表單的值
    document.getElementById('sign-up-email').value = '';
    document.getElementById('sign-up-password').value = '';
    signInForm.style.display = 'none';
    signUpForm.style.display = 'block';
    signUpButton.classList.add('active');
    signInButton.classList.remove('active');
  });
}

function signUp() {
  const signUpForm = document.getElementById('sign-up-form');
  signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const signUpName = document.getElementById('sign-up-name').value;
    const signUpEmail = document.getElementById('sign-up-email').value;
    const signUpPassword = document.getElementById('sign-up-password').value;
    fetch('/api/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: signUpName, email: signUpEmail, password: signUpPassword })
    })
    .then(response => response.json())
    .then(result => {
      const signUpResponse = document.getElementById('sign-up-response');
      const signUpFont = document.querySelector('.sign-up-font');
      if (result.ok) {
        signUpResponse.textContent = '註冊成功，請登入系統';
        signUpFont.style.color = 'green';
      } else {
        throw result;
      }
      signUpResponse.classList.remove('hide');
      setTimeout(() => {
        signUpResponse.classList.add('hide');
      }, 2000);
    })
    .catch(error => {
      console.error('Error', error);
      const signUpResponse = document.getElementById('sign-up-response');
      const signUpFont = document.querySelector('.sign-up-font');
      if (error.message === 'Invalid email format') {
        signUpResponse.textContent = '電子郵件格式錯誤';
      } else if (error.message === 'Email already registered') {
        signUpResponse.textContent = '電子郵件已經註冊帳戶';
      } else {
        signUpResponse.textContent = '註冊失敗';
      }
      signUpFont.style.color = 'red';
      signUpResponse.classList.remove('hide');
      setTimeout(() => {
        signUpResponse.classList.add('hide');
      }, 2000);
    });
  });
}

function signIn() {
  const signin = document.getElementById('sign-in-form');
  signin.addEventListener('submit', (e) => {
    e.preventDefault();
    const signInEmail = document.getElementById('sign-in-email').value;
    const signInPassword = document.getElementById('sign-in-password').value;
    fetch('/api/user/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: signInEmail, password: signInPassword })
    })
    .then(response => { return response.json() })
    .then(result => {
      token = result.token;
      if (token) {
        localStorage.setItem('token', token);
        window.location.href = '/groups';
      } else {
        throw result;
      }
    })
    .catch(error => {
      console.error('Error', error);
      if (error.message === 'Invalid email or password') {
        const signInResponse = document.getElementById('sign-in-response');
        const signInFont = document.querySelector('.sign-in-font');
        signInResponse.textContent = '電子郵件或密碼錯誤';
        signInFont.style.color = 'red';
        signInResponse.classList.remove('hide');
        setTimeout(() => {
          signInResponse.classList.add('hide');
        }, 2000);
      }
    });
  });
}