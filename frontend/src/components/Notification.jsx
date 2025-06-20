import React, { useEffect, useState } from "react";
import { getNotifications, markAsRead } from "../services/notificationService";
import axios from "axios";
import { API_URL } from "../config";

// 🔐 Fonction pour décoder le token JWT et obtenir user_id


const Notifications = () => { 
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setIsLoading] = useState(true);
  const getUserIdFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.user_id || payload.id || payload.sub; // selon comment ton backend encode
  } catch (e) {
    console.error("Erreur lors du décodage du token:", e);
    return null;
  }
};
     const [form, setForm] = useState({
         ajouter_par: '',
         user_id: ''
       });
     const [error, setError] = useState(null);
      const [profile, setProfile] = useState({
           id: null,
           prenom: '',
           nom: '',
           email: '',
           telephone: '',
           entreprise: '',
           poste: '',
           statut: '',
           role: '',
           image_profil: null
         });
     useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Utilisateur non connecté');
        
        const response = await axios.get(`${API_URL}/utilisateur/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(response.data);

            setForm(prev => ({
          ...prev,
          ajouter_par: response.data.role,
          user_id: response.data.id
        }));
      } catch (err) {
        console.error('Erreur:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, []);
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications();

        const userNotifs = data.filter((n)=> n.user_id === profile.id);

        setNotifications(userNotifs);

        // Affiche notification système uniquement s'il y a de nouvelles notifications
        const unread = data.filter(n => !n.isRead);
        if (unread.length > 0 && Notification.permission === "granted") {
          new Notification("Nouvelle notification", {
            body: unread[0].message || "Vous avez une nouvelle notification",
          });
        }
      } catch (error) {
        console.error("Erreur chargement notifications", error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // rafraîchit toutes les 10s

    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-base-100 shadow rounded">
      <h2 className="text-xl font-semibold mb-4">🔔 Mes notifications</h2>

      {notifications.length === 0 && (
        <p className="text-sm text-gray-500">Aucune notification.</p>
      )}

      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`p-3 mb-3 border rounded transition ${
            notif.isRead ? 'bg-base-100' : 'bg-yellow-100'
          }`}
        >
          <p className="text-base text-gray-800">{notif.message}</p>
          {!notif.isRead && (
            <button
              className="mt-2 text-sm text-blue-600 hover:underline"
              onClick={() => handleMarkAsRead(notif.id)}
            >
              Marquer comme lue
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default Notifications;
