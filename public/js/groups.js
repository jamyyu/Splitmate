document.addEventListener('DOMContentLoaded', () => {
  const createGroupButton = document.querySelector('.create-group-button');
  createGroupButton.addEventListener('click', () => {
    window.location.href = '/groups/create-group';
  });
});
