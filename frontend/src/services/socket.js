import io from 'socket.io-client';

const userId = localStorage.getItem('user_id');

const socket = io(API_URL, {
  query: { user_id: userId }
});

socket.on('notification:new', (notif) => {
  console.log('📩 Nouvelle notification :', notif.message);
  toast.info(notif.message); // via react-toastify si tu veux
});

socket.on('notification:count', (count) => {
  // Mettre à jour un badge dans la navbar par exemple
  setUnreadNotifCount(count);
});
