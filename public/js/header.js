window.onload = function() {
  checkAuth();
};


document.addEventListener('DOMContentLoaded', () => {
  const profilePic = document.getElementById('profile-pic');
  const dropdownMenu = document.getElementById('dropdown-menu');

  // 點擊頭像顯示或隱藏下拉菜單
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
          console.log('個人檔案');
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

