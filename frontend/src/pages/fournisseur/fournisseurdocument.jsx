import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';
import { useState, useEffect } from 'react';
import axios from "axios";
import React from 'react';
import DocumentModal from '../../components/fenêtremodal/DocumentModal';

export default function FournisseurDocument() {
   const [commandes, setCommandes] = useState([]);
     const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setIsLoading] = useState(true);
     const [error, setError] = useState(null);
           const [modalOpen, setModalOpen] = useState(false);
     const [selectedCommandeId, setSelectedCommandeId] = useState(null);
       const [form, setForm] = useState({
       ajouter_par: '',
       user_id: ''
     });
     
     const openModal = (id) => {
       setSelectedCommandeId(id);
       setModalOpen(true);
     };
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

        //     setForm(prev => ({
        //   ...prev,
        //   ajouter_par: response.data.role,
        //   user_id: response.data.id
        // }));
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
  const fetchFournisseurs = async () => {
    try {
      const res = await axios.get(`${API_URL}/utilisateur`);
      setFournisseurs(res.data);
    } catch (error) {
      console.error('Erreur lors du chargement des fournisseurs :', error);
    }
  };

  fetchFournisseurs();
}, []);
const getNomFournisseur = (fournisseur_id) => {
  const fournisseur = fournisseurs.find(f => f.id === fournisseur_id);
  return fournisseur ? fournisseur.nom : "Inconnu";
};


useEffect(() => {
  const fetchCommandesClient = async () => {
    try {
      const response = await axios.get(`${API_URL}/commande`);
      const commandesClient = response.data.filter(cmd => cmd.fournisseur_id === profile.id);
      setCommandes(commandesClient);
    } catch (error) {
      console.error("Erreur lors du chargement des commandes :", error);
    }
  };

  if (profile?.id) {
    fetchCommandesClient();
  }
}, [profile]);


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
    <div className="h-full  bg-base-200 p-20">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-gray-600">Gérez vos bons de commande et factures</p>
        </div>

        {/* Carte principale */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body p-6">
            {/* Barre de recherche et bouton */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold">Historique des documents</h2>
                <p className="text-sm text-gray-500">Bons de commandes et factures générés</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center">
             <img src="../file-export.svg" alt="" width={20} className="mr-2"/>
                Exporter
              </button>
                <div className="relative w-full md:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Rechercher un utilisateur..."
                    className="input input-bordered w-full pl-10"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Tableau */}
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th className="bg-base-300">TYPE</th>
                    <th className="bg-base-300">N° DOCUMENT</th>
                    <th className="bg-base-300">DATE</th>
                    <th className="bg-base-300">CLIENT</th>
                    <th className="bg-base-300">MONTANT</th>
                    <th className="bg-base-300">STATUT</th>
                    <th className="bg-base-300">SUPPRIMER DANS</th>
                    <th className="bg-base-300">ACTIONS</th>
                  </tr>
                </thead>
         <tbody>
              {commandes.map((commande)=>(
                <tr key={commande.id}>
                  <td>BDC</td>
    <td>{genererRefCommande(commande.created_at, commande.id)}</td>
    <td>{formatDateDMY(commande.created_at)}</td>
      <td>{getNomFournisseur(commande.client_id)}</td>
                  <td>{commande.total} €</td>
                  <td>
                    <span className={`badge badge-${commande.color} badge-sm`}>{commande.statut}</span>
                  </td>
                  <td>
        🕒  <strong>{calculerJoursRestants(commande.created_at)}</strong> jour{calculerJoursRestants(commande.created_at) > 1 ? 's' : ''}
                  </td>
                  <td>
                    <button className="text-blue-600 hover:text-blue-900 mr-5" onClick={()=>openModal(commande.id)}>Voir</button>
                    <button className="text-blue-600 hover:text-blue-900 mr-5">PDF</button>
                  </td>
                </tr>
              ))}
            </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-base-300">
      
              <div className="btn-group">
                <button className="btn btn-sm">«</button>
                <button className="btn btn-sm btn-active">1</button>
                <button className="btn btn-sm">»</button>
              </div>
            </div>
          </div>
        </div>
      </div>
  <DocumentModal
       isOpen={modalOpen}
  onClose={() => setModalOpen(false)}
  commandeId={selectedCommandeId}
      />
    
    </div>
  );
}
