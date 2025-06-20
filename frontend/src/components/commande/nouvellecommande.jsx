import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { API_URL } from '../../config';
import { usePanier } from '../PanierContext';
import axios from 'axios';

const NouvelleCommande = () => {
  const {ajouterAuPanier, diminuerQuantite, panierItems, retirerDuPanier} = usePanier();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
   const [dateLivraison, setdateLivraison] = useState('');
  const [remarques, setremarques] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [produits,setProduits] = useState([]);

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
      }
    };
    
    fetchProfile();
  }, []);
  // Étape 1 : Récupération des produits validés depuis l'API
  useEffect(() => {
    const fetchProduits = async () => {
      try {
        const response = await fetch(`${API_URL}/produits`);
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des produits');
        }
        const data = await response.json();
        const produitsValidés = data.filter((produit) => produit.validation === 'accepter');
        setProduits(produitsValidés);
      } catch (error) {
        console.error('Erreur:', error);
        setMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduits();
  }, []);

  // Étape 2 : Construction du panier dès que les produits sont disponibles
  useEffect(() => {
    if (loading || produits.length === 0) return;

    const panier = JSON.parse(localStorage.getItem('panier')) || [];

    const quantites = {};
    panier.forEach((ref) => {
      quantites[ref] = (quantites[ref] || 0) + 1;
    });

    const items = Object.entries(quantites).map(([reference, quantity]) => {
      const produit = produits.find((p) => p.reference === reference);
      if (!produit) return null;
      return {
        ...produit,
        quantity
      };
    }).filter(Boolean);

    setOrderItems(items);
  }, [produits, loading]);

const handleQuantityChange = (id, newQuantity) => {
  const itemToUpdate = orderItems.find((item) => item.id === id);
  if (!itemToUpdate) return;

  const currentQuantity = itemToUpdate.quantity;

  // Appeler la bonne fonction AVANT setOrderItems
  if (newQuantity === currentQuantity + 1) {
    ajouterAuPanier(itemToUpdate.reference);
  } else if (newQuantity === currentQuantity - 1) {
    diminuerQuantite(itemToUpdate.reference);
  }

  // Mettre à jour le state
  setOrderItems((prev) =>
    prev.map((item) =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    )
  );
};






  const handleRemoveItem = (reference) => {
    setOrderItems((prev) => prev.filter(item => item.reference !== reference));
     retirerDuPanier(reference);
  };

  // Fonction pour soumettre la commande

const handleSubmitOrder = async () => {
  if (orderItems.length === 0) {
    alert("Votre panier est vide !");
    return;
  }

  const token = localStorage.getItem('token');
  const clientId = profile.id ?? null;

  if (!clientId) {
    alert("Utilisateur non connecté");
    return;
  }

  
  const payload = {
    dateLivraison,
    remarques,
    sousTotal,
    remise,
    livraison,
    tva,
    total,
    client_id: clientId,
    items: orderItems.map((item) => ({
      produit_id: item.id,
      quantite: item.quantity,
      fournisseur_id: item.fournisseur?.id ?? item.fournisseur, // pour gérer les deux cas
    })),
  };

  console.log("Payload envoyé:", payload);

  try {
    const response = await fetch(`${API_URL}/commande`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la création de la commande');
    }

    const data = await response.json();
    console.log('Commande enregistrée avec succès:', data);

    navigate('../../client/commande/confirmation', { state: { order: data } });
    localStorage.removeItem('panier');
  } catch (error) {
    console.error('Erreur:', error);
    alert("Erreur lors de l'envoi de la commande");
  }
};
   // Calcul des totaux
  const sousTotal = orderItems.reduce((sum, item) => sum + (item.prix * item.quantity), 0);
  const remise = 0; // À adapter selon votre logique métier
  const livraison = 0; // À adapter selon votre logique métier
  const tva = sousTotal * 0.2;
  const total = sousTotal - remise + livraison + tva;
  

  return (
    <section className="h-full bg-base-200 p-10">
      <div className="mb-6">
        <button 
        onClick={()=>navigate('../../client/commande')}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
            <img src="../../arrow.png" alt="" width={25}/>
           Retour aux commandes
        </button>
      </div>

      <div className="bg-base-100 shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-base-200">
          <h2 className="text-lg font-semibold text-base-800">Nouvelle commande</h2>
          <p className="text-sm text-base-500">
            Remplissez les informations nécessaires pour passer une nouvelle commande
               {/* <br /> Nom:  {profile.nom}
      <br /> ID: {profile.id} */}
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Colonne des produits */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-base-800 mb-4">Produits à commander</h3>
              
              {/* Barre de recherche */}
              <div className="mb-4">
                <label htmlFor="product-search" className="block text-sm font-medium text-base-700 mb-1">
                  Rechercher un produit
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   
                  </div>
                  <input
                    type="text"
                    id="product-search"
                    className="block w-full pl-10 pr-3 py-2 border border-base-300 rounded-md leading-5 bg-base-100 placeholder-base-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Référence, nom du produit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Tableau des produits */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-base-200">
                  <thead className="bg-base-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-base-500 uppercase tracking-wider">Produit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-base-500 uppercase tracking-wider">Prix</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-base-500 uppercase tracking-wider">Quantité</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-base-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-base-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
<tbody className="bg-base-100 divide-y divide-base-200">
  {orderItems.length === 0 ? (
    <tr>
      <td colSpan="5" className="px-6 py-4 text-center text-sm text-base-500">
        Aucun produit ajouté
      </td>
    </tr>
  ) : (
    orderItems.map((item, index) => (
      <tr key={item.id}>
        <td className="px-6 py-4">
          <div className="flex items-center">
            <div className="ml-4">
              <div className="text-sm font-medium text-base-900">{item.nom} {item.user_id}</div>
              <div className="text-sm text-base-500">Ref: {item.reference}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 text-sm text-base-500">
          {item.prix} €
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center">
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
              className="w-16 px-2 py-1 border rounded ml-2"
            />
          </div>
        </td>
        <td className="px-6 py-4 text-sm font-medium">
          {(item.prix * item.quantity).toFixed(2)} €
        </td>
        <td className="px-6 py-4">
          <button
            onClick={() => handleRemoveItem(item.reference)}
            className="text-red-600 hover:text-red-800 flex items-center"
          >
            Supprimer
          </button>
        </td>
      </tr>
    ))
  )}
</tbody>
                </table>
              </div>

              <div className="mt-4">
                <button
                onClick={() => navigate('../../client/catalogue')}
                  className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                >
                    <img src="../../plus.png" alt="" width={35} className='p-2'/>
                   Ajouter un produit depuis le catalogue
                </button>
              </div>
            </div>

            {/* Colonne récapitulative */}
            <div className="md:col-span-1">
              <div className="bg-base-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-base-800 mb-4">Récapitulatif</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-base-600">Sous-total</span>
                    <span className="font-medium">{sousTotal.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-600">Remise</span>
                    <span className="font-medium text-green-600">-{remise.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between border-t border-base-200 pt-2">
                    <span className="text-base-600">Livraison</span>
                    <span className="font-medium">{livraison.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between border-t border-base-200 pt-2">
                    <span className="text-base-600">TVA (20%)</span>
                    <span className="font-medium">{tva.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between border-t border-base-200 pt-2 font-bold text-lg">
                    <span>Total</span>
                    <span>{total.toFixed(2)} €</span>
                  </div>
                </div>

                <div className="mt-6">
                  <label htmlFor="delivery-date" className="block text-sm font-medium text-base-700 mb-1">
                    Date de livraison souhaitée
                  </label>
                  <input
                    type="date"
                    id="delivery-date"
                    className="block w-full px-3 py-2 border border-base-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={dateLivraison}
                    required
                    onChange={(e) => setdateLivraison(e.target.value)}
                  />
                </div>

                <div className="mt-4">
                  <label htmlFor="order-remarques" className="block text-sm font-medium text-base-700 mb-1">
                    remarques (optionnel)
                  </label>
                  <textarea
                    id="order-remarques"
                    rows="3"
                    className="block w-full px-3 py-2 border border-base-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Instructions spéciales..."
                    value={remarques}
                    onChange={(e) => setremarques(e.target.value)}
                  />
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleSubmitOrder}
                   className='w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors'
                  >
                    Valider la commande
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NouvelleCommande;