document.addEventListener('DOMContentLoaded', () => {
  fetchGroupBalanceData();
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
      console.log(groupBalanceData)
    })
    .catch(error => {
      console.error("Error fetching data:", error);
    });
}