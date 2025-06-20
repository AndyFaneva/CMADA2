import React, { useEffect, useState } from "react";
import { API_URL } from "../../config";
import {Edit3} from "lucide-react";
import AjouterProduitModal from "../../components/fenêtremodal/AjouterProduitModal";
import axios from "axios";

export default function FournisseurProduct() {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [produits, setProduits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setIsLoading] = useState(true);
   const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

    const [form, setForm] = useState({
      nom: '',
      reference: '',
      description: '',
      prix: '',
      tva: '',
      stock: '',
      stock_alert: '',
      statut: '',
      categorie_id: '',
      ajouter_par:'',
      user_id:'',
      caracteristiques: [{ nom: '', valeur: '' }],
    });

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

      const getBadgeValidation = (validation) => {
  const baseClasses = "px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full";
  
  switch (validation?.toLowerCase()) {
    case "false":
      return `${baseClasses} bg-neutral-100 text-neutral-800`;
    case "accepter":
      return `${baseClasses} bg-green-100 text-green-800`;
    case "refuser":
      return `${baseClasses} bg-red-100 text-red-800`;
  }
};
      const getBadgeStatut = (statut) => {
  const baseClasses = "px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full";
  
  switch (statut?.toLowerCase()) {
    case "arrivages":
      return `${baseClasses} bg-blue-100 text-blue-800`;
    case "disponible":
      return `${baseClasses} bg-green-100 text-green-800`;
    case "précommander":
      return `${baseClasses} bg-purple-100 text-purple-800`;
    case "déstockage":
      return `${baseClasses} bg-red-100 text-red-800`;
         case "échantillons":
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    default:
      return `${baseClasses} bg-neutral-100 text-neutral-800`;
  }
};


  
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

  const handleModifierClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleProductUpdated = () => {
    fetchProduits();
    setIsModalOpen(false);
  };


  useEffect(() => {
    fetchProduits();
  }, []);

  // Obtenir la classe du badge en fonction du rôle
  const getBadgeClass = (role) => {
    switch (role) {
      case "admin":
        return "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800";
      case "fournisseur":
        return "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800";
      case "client":
        return "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800";
      default:
        return "badge badge-ghost";
    }
  };

  // Obtenir la classe du badge en fonction du statut


  // Filtrer les produits en fonction du terme de recherche
  const filteredProduits = produits.filter(product => {
    // Vérifier si 'product' est défini
    if (!product) return false;
  
    // Si 'product' est défini, on vérifie les propriétés nom, email et role
    return (
      product.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.categorie_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

    //SUPRIMER DES PRODUITS
    const handleDeleteProduct = async (productId) => {
      const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?");
      if (!confirmDelete) return;
    
      try {
        const response = await fetch(`${API_URL}/produits/${productId}`, {
          method: "DELETE",
        });
    
        if (!response.ok) {
          throw new Error("Erreur lors de la suppression du produits");
        }
    
        // Mettre à jour la liste sans le produit supprimé
        setProduits((prev) => prev.filter((product) => product.id !== productId));
        setMessage("Produit supprimé avec succès");
    
        // Message temporaire
        setTimeout(() => setMessage(''), 5000);
      } catch (error) {
        console.error("Erreur:", error);
        setMessage(error.message);
        setTimeout(() => setMessage(''), 5000);
      }
    };
const fetchProduits = async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    console.error('Aucun token trouvé');
    return;
  }

  try {
    // Décodage manuel du payload du token (base64)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const { userId, role } = JSON.parse(jsonPayload);

    // Appel à l'API avec ID et rôle extraits du token
    const response = await fetch(`${API_URL}/produits/${role}/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors du chargement des produits');
    }

    const data = await response.json();
    setProduits(data);
  } catch (error) {
    console.error('Erreur:', error);
    setMessage(error.message);
  } finally {
    setIsLoading(false);
  }
};



  return (
    
    <div className="h-full p-20 bg-base-200">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Gestion des Produits</h1>
          <p className="text-gray-600">Créez et gérez vos produits</p>
        </div>
{/* <div>Role: {profile.role}</div>
<div>Id: {profile.id}</div> */}
        {/* Carte principale */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body p-6">
            {/* Barre de recherche et bouton */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold">Liste des Produits</h2>
                <p className="text-sm text-gray-500">Création et modification des produits</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Rechercher un produit..."
                    className="input input-bordered w-full pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                 <button 
                  className="btn btn-primary"
                 onClick={()=>setIsModalOpen(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Nouveau produit
                </button>
              </div>
            </div>

            {/* Tableau */}
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th className="bg-base-300">IMAGE</th>
                    <th className="bg-base-300">REFERENCE</th>
                    <th className="bg-base-300">NOM</th>
                    <th className="bg-base-300">CATEGORIE</th>
                    <th className="bg-base-300">PRIX</th>
                    <th className="bg-base-300">STOCK</th>
                    <th className="bg-base-300">STATUT</th>
                     <th className="bg-base-300">VALIDATION</th>
                    <th className="bg-base-300">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8">
                        Chargement des produits...
                      </td>
                    </tr>
                  ) : filteredProduits.length > 0 ? (
                    filteredProduits.map((product) => (
                      <tr key={product.id} className="hover:bg-base-200">
                        <td>
                          <div className="font-bold">
<img
 src={
    product.image && ![null, undefined, "null", ""].includes(product.image)
      ? `${API_URL}/uploads/${product.image}`
      : '/photo.png'
  }
  alt={product.nom}
                  className="size-8 " />
                          </div>
                        </td>
                        <td>{product.reference}</td>
                        <td>{product.nom}</td>
                        <td>{product.categorie?.nom}</td>
                        <td>{product.prix}</td>
                        <td>
                            {product.stock}
                        </td>
                        <td>
                          <span className={getBadgeStatut(product.statut)}>
                          {product.statut}</span></td>
                                <td className={`${getBadgeValidation(product.validation)} text-center align-middle mt-3`}>
        {product.validation === "false" && "Non traité"}
        {product.validation === "accepter" && "Accepter"}
        {product.validation === "refuser" && "Refuser"}
      </td>                        <td>
                          <div className="flex space-x-2">
                            {/* BOUTTON MODIFIER */}
                          <button className="text-blue-600 hover:text-blue-900 mr-3"
onClick={() => handleModifierClick(product)}
  title="Modifier le produit">
                          <Edit3 className="h-5 w-5"/>
                          </button>
                          <button
  onClick={() => handleDeleteProduct(product.id)}
  className="text-red-600 hover:text-red-900 mr-2"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v1h6V4a1 1 0 00-1-1m-4 0h4"
    />
  </svg>
</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-8">
                        Aucun produit trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-base-300">
              <div className="text-sm mb-4 sm:mb-0">
                Affichage de <span className="font-bold">1</span> à <span className="font-bold">{filteredProduits.length}</span> sur <span className="font-bold">{produits.length}</span> produits
              </div>
              <div className="btn-group">
                <button className="btn btn-sm">«</button>
                <button className="btn btn-sm btn-active">1</button>
                <button className="btn btn-sm">»</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AjouterProduitModal
        show={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        produit={selectedProduct}
        onProductUpdated={handleProductUpdated}
      />

    </div>
  );
}
