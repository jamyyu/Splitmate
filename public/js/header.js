window.onload = function() {
  checkAuth();
};


document.addEventListener('DOMContentLoaded', () => {
  updateProfilePicture();
  // 點擊logo回我的群組
  const logo = document.querySelector('.logo img');
  if (logo) {
    logo.addEventListener('click', () => {
      window.location.href = '/groups';
    });
  }
  // 點擊頭像顯示或隱藏下拉菜單
  const profilePic = document.getElementById('profile-pic');
  const dropdownMenu = document.getElementById('dropdown-menu');

  profilePic.addEventListener('click', () => {
    dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
  });

  // 點擊其他地方時隱藏下拉菜單
  window.addEventListener('click', (event) => {
    if (!profilePic.contains(event.target) && !dropdownMenu.contains(event.target)) {
      dropdownMenu.style.display = 'none';
    }
  });

  // 處理下拉菜單中的點擊事件
  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
      const action = item.getAttribute('data-action');
      switch (action) {
        case 'profile':
          // 跳轉到個人檔案頁面
          window.location.href = '/profile';
          break;
        case 'groups':
          window.location.href = '/groups';
          break;
        case 'payments':
          // 跳轉到我的收款頁面
          console.log('我的收款');
          break;
        case 'logout':
          // 執行登出操作，跳轉到登入頁面
          localStorage.removeItem("token");
          sessionStorage.removeItem('groupData');
          sessionStorage.removeItem('memberData');
          window.location.href = '/'; 
          break;
        default:
          break;
      }
    });
  });
});


function checkAuth() {
  const token = localStorage.getItem("token");
  fetch("/api/user/auth",{
      method: "GET",
      headers: {
          "Authorization": `Bearer ${token}`,
      }
  })
  .then(response => {
      return response.json();
  })
  .then(data => {
      user_info = data["data"]
      if (user_info === "null"){
        window.location.href = "/";
      }
  })
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


function updateProfilePicture() {
  const token = localStorage.getItem('token');
  const userData = parseJwt(token);
  const imageName = userData.imageName;
  if (imageName) {
    const profilePic = document.getElementById('profile-pic');
    profilePic.src = 'https://d3q4cpn0fxi6na.cloudfront.net/' + imageName;
  }
}