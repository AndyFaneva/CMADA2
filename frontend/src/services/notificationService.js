import axios from 'axios';

const API_URL = 'http://localhost:3000'; // modifie si nécessaire

export async function getNotifications() {
  const response = await fetch(`${API_URL}/notifications`);
  if (!response.ok) throw new Error('Erreur lors du chargement des notifications');
  return await response.json();
}

export const markAsRead = async (notificationId) => {
  try {
    await axios.patch(`${API_URL}/notifications/${notificationId}/read`);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la notification:', error);
  }
};
