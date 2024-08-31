document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem('token');
  handleProfilePictureUpload();
  renderProfile();
  handleProfileSubmit();
});


function handleProfilePictureUpload() {
  const profilePictureUpload = document.getElementById('profile-picture-upload');
  const preview = document.getElementById('profile-picture-preview');
  profilePictureUpload.addEventListener('change', (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();  
        reader.onload = (e) => {
          if (preview) {
            preview.src = e.target.result;
            preview.style.display = 'block';
          } else {
            console.error("無法找到用於顯示圖片預覽的元素");
          }
        };
        reader.readAsDataURL(file);
      } else {
        console.error("請選擇有效的圖像文件");
      }
    } else {
      if (preview) {
        preview.src = '/images/profile-icon.png'; 
      }
    }
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


function renderProfile(){
  const token = localStorage.getItem('token');
  const userData = parseJwt(token);
  const userName = document.getElementById('name');
  userName.value = userData.name;

  const profilePicture = document.getElementById('profile-picture-preview')
  const imageName = userData.imageName;
  console.log(userData);
  if (imageName !== null){
    profilePicture.src = 'https://d3q4cpn0fxi6na.cloudfront.net/'+imageName;
  }
}


function handleProfileSubmit() {
  let token = localStorage.getItem('token');
  const profileForm = document.querySelector('.profile-form')
  profileForm.addEventListener('submit',(e) => {
    e.preventDefault();
    // 獲取群組名稱
    const newUserName = document.getElementById('name').value;
    // 獲取圖片文件
    const newprofilePicture = document.getElementById('profile-picture-upload').files[0];
    // 創建 FormData 對象
    const formData = new FormData();
    formData.append('userName', newUserName);
    formData.append('profilePicture', newprofilePicture);
    // 表單數據發送到後端
    fetch('/api/user', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    })
    .then(response => response.json())
    .then(result => {
      token = result.token;
      if (token) {
        localStorage.setItem('token', token);
        console.log(token)
        window.location.reload();
      } else {
        throw result;
      }
    })
    .catch(error => {
      console.error('Error', error);
      alert('發生錯誤: ' + error.message);
    });
  });
}