import React, { useEffect, useState } from "react";
import { getNotifications, markAsRead } from "../services/notificationService";
import { Bell } from 'lucide-react';
import axios from "axios";
import { API_URL } from "../config";

const NotificationIcon = () => {
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setIsLoading] = useState(true);
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
      if (!profile.id) return; // ← attend que le profil soit chargé

      const data = await getNotifications();
      const userNotifs = data.filter((n)=> n.user_id === profile.id);
      setNotifications(userNotifs);

      const unread = userNotifs.filter(n => !n.isRead);
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
  const interval = setInterval(fetchNotifications, 10000);

  return () => clearInterval(interval);
}, [profile.id]);


  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  return (
    <div className="relative">
      {/* Icône cloche avec badge */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative text-base-600 hover:text-base-800"
      >
          <Bell className="w-6 h-6 text-base-700 mr-2 mt-2 mb-1" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-base-100 text-xs rounded-full px-1">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown notifications */}
     {showDropdown && (
  <div className="absolute right-0 mt-2 w-72 bg-base-100 border shadow-lg rounded p-2 z-50 max-h-[75vh] overflow-y-auto">
    <h4 className="font-semibold mb-2">🔔 Notifications</h4>
    {notifications.length === 0 ? (
      <p className="text-base-500 text-sm">Aucune notification</p>
    ) : (
      notifications.map((notif) => (
        <div
          key={notif.id}
          className={`p-2 mb-1 rounded ${notif.isRead ? "bg-base-200" : "bg-yellow-100 text-black-100"}`}
        >
          <p className="text-sm">{notif.message}</p>
          {!notif.isRead && (
            <button
              className="text-xs text-blue-600"
              onClick={() => handleMarkAsRead(notif.id)}
            >
              Marquer comme lue
            </button>
          )}
        </div>
      ))
    )}
  </div>
)}

    </div>
  );
};

export default NotificationIcon;
