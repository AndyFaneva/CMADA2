import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import DocumentModal from '../../components/fenêtremodal/DocumentModal';

export default function AdminCommande() {
const [commandes, setCommandes] = useState([]);
         const [modalOpen, setModalOpen] = useState(false);
     const [selectedCommandeId, setSelectedCommandeId] = useState(null);
         const [loading, setIsLoading] = useState(true);
       const [form, setForm] = useState({
       ajouter_par: '',
       user_id: ''
     });

       const getBadgeStatut = (statut) => {
         switch (statut) {
    case 'en attente':
      return 'bg-yellow-100 text-yellow-800 px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
       case 'annulée':
      return 'bg-red-100 text-red-800 px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
    case 'validé':
      return 'bg-green-100 text-green-800 px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
    case 'en préparation':
      return 'bg-blue-100 text-blue-800 px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
    case 'expédiée':
      return 'bg-indigo-100 text-indigo-800 px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
    case 'livrée':
      return 'bg-purple-100 text-purple-800 px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
    default:
      return 'neutral';
  }
  };

     const commandeEnPreparation = async (id) => {
  try {
    const token = localStorage.getItem('token');
    await axios.patch(`${API_URL}/commande/${id}/enPreparation`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // ✅ Met à jour la liste des commandes après validation
    const response = await axios.get(`${API_URL}/commande`);
    setCommandes(response.data);
  } catch (error) {
    console.error("Erreur lors de la validation de la commande :", error);
    alert("Erreur lors de la validation !");
  }
};

     const commandeLivrer = async (id) => {
  try {
    const token = localStorage.getItem('token');
    await axios.patch(`${API_URL}/commande/${id}/livrer`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // ✅ Met à jour la liste des commandes après validation
    const response = await axios.get(`${API_URL}/commande`);
    setCommandes(response.data);
  } catch (error) {
    console.error("Erreur lors de la validation de la commande :", error);
    alert("Erreur lors de la validation !");
  }
};

     const commandeExpedier = async (id) => {
  try {
    const token = localStorage.getItem('token');
    await axios.patch(`${API_URL}/commande/${id}/expedier`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // ✅ Met à jour la liste des commandes après validation
    const response = await axios.get(`${API_URL}/commande`);
    setCommandes(response.data);
  } catch (error) {
    console.error("Erreur lors de la validation de la commande :", error);
    alert("Erreur lors de la validation !");
  }
};
     const openModal = (id) => {
       setSelectedCommandeId(id);
       setModalOpen(true);
     };
useEffect(() => {
  const fetchCommandes = async () => {
    try {
      const response = await axios.get(`${API_URL}/commande`);
      console.log("Toutes les commandes:", response.data);
      setCommandes(response.data); // ✅ plus de filtre
    } catch (error) {
      console.error("Erreur chargement commandes :", error);
    }
  };

  fetchCommandes();
}, []);


  const calculerJoursRestants = (date_creation) => {
    const dateCreation = new Date(date_creation);
    const dateSuppression = new Date(dateCreation);
    dateSuppression.setDate(dateCreation.getDate() + 10);

    const maintenant = new Date();
    const diff = Math.ceil((dateSuppression - maintenant) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

const formatDateDMY = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // +1 car Janvier = 0
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};
const genererRefCommande = (dateString, id) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  return `#CMD-${year}-${id}`;
};

  return (
    <div className="h-full p-20 bg-base-200">
    <section id="orders-section" className="p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-base-800">Gestion des commandes</h1>
        <p className="text-base-600">Suivez et gérez vos commandes professionnelles</p>
      </div>

      <div className="bg-base-100 shadow rounded-box overflow-hidden">
        <div className="px-6 py-4 border-b border-base-300">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-lg font-semibold text-base-content">Historique des commandes</h2>
              <p className="text-sm text-base-content opacity-70">Consultez l'état de vos commandes passées</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead className="bg-base-200 text-base-content">
              <tr>
                <th>N° Commande</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Supprimer dans</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
                  {commandes.map((commande)=>(
                <tr key={commande.id}>
    <td>{genererRefCommande(commande.created_at, commande.id)}</td>
    <td>{formatDateDMY(commande.created_at)}</td>
                  <td>{commande.total} €</td>
                  <td>
                    <span className={getBadgeStatut(commande.statut)}>{commande.statut}</span>
                  </td>
                  <td>
        🕒  <strong>{calculerJoursRestants(commande.created_at)}</strong> jour{calculerJoursRestants(commande.created_at) > 1 ? 's' : ''}
                  </td>
                  <td>
                    <button className="text-blue-600 hover:text-blue-900 mr-5" onClick={()=>openModal(commande.id)}>Détails</button>
                                     {commande.statut === 'validé' && (
    <button
      className="text-blue-600 hover:text-blue-900"
      onClick={() => commandeEnPreparation(commande.id)}
    >
      En préparation
    </button>
  )}
    {commande.statut === 'en préparation' && (
    <button
      className="text-indigo-600 hover:text-indigo-900"
      onClick={() => commandeExpedier(commande.id)}
    >
      Expédiée
    </button>
  )}
    {commande.statut === 'expédiée' && (
    <button
      className="text-purple-600 hover:text-purple-900"
      onClick={() => commandeLivrer(commande.id)}
    >
      Livrée
    </button>
  )}
                  </td>
                </tr>
              ))}
              
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-base-300">
          <div className="flex justify-between items-center">
            <p className="text-sm text-base-content opacity-70">
              Affichage de <span className="font-medium">1</span> à <span className="font-medium">4</span> sur <span className="font-medium">12</span> commandes
            </p>
            <div className="join">
              <button className="join-item btn btn-sm">
                <i className="fas fa-chevron-left" />
              </button>
              <button className="join-item btn btn-sm btn-active">1</button>
              <button className="join-item btn btn-sm">2</button>
              <button className="join-item btn btn-sm">3</button>
              <button className="join-item btn btn-sm">
                <i className="fas fa-chevron-right" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
     <DocumentModal
       isOpen={modalOpen}
  onClose={() => setModalOpen(false)}
  commandeId={selectedCommandeId}
      />
    </div>
  );
}
