import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import { API_URL } from "../../config";
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const FournisseurStock = () => {
  const [produits, setProduits] = useState([]);
    const [loading, setIsLoading] = useState(true);
      const [error, setError] = useState(null);
 

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
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, []);
    useEffect(() => {
      fetchProduits();
    }, []);
      const produitsEnStock = produits.filter(p => p.stock > 0).length;
  const produitsEnRupture = produits.filter(p => p.stock === 0).length;
  const quantiteTotaleEnStock = produits.reduce((acc, p) => acc + p.stock, 0);
  const stockMoyen =
    produits.length > 0
   ? Math.round(produits.reduce((acc, p) => acc + p.stock, 0) / produits.length)
      : 0;

  const valeurTotale = produits.reduce((acc, p) => acc + (p.stock * p.prix), 0);
  const stats = {
  produitsEnStock: produitsEnStock,
  produitsEnRupture: produitsEnRupture,
  quantiteTotale: quantiteTotaleEnStock,
  stockMoyen: stockMoyen,
  valeurTotale: valeurTotale,
};

     const exportToPDF = () => {
    const doc = new jsPDF();
      const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, "0"); // mois 2 chiffres
const dd = String(today.getDate()).padStart(2, "0");
const fileName = `stock_${yyyy}-${mm}-${dd}.pdf`;

        // --- Header ---
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text("C'MADA Pro", 14, 15);
  doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
  doc.text(`${profile.prenom} ${profile.nom}`, 14, 21);
  doc.text(`${profile.entreprise}`, 14, 26);
  doc.text( `Téléphone: ${profile.telephone}`, 14, 31);

  doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
  doc.text(fileName, 150, 15);
  doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
  doc.text(`Date: ${yyyy}-${mm}-${dd}`, 150, 21);


  doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
  doc.text("Résumé du stock", 14, 47);

  doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
  doc.text(`Produits en stock : ${stats.produitsEnStock}`, 14, 54);
  doc.text(`Quantité totale en stock : ${stats.quantiteTotale}`, 14, 58);
  doc.text(`Produits en rupture : ${stats.produitsEnRupture}`, 75, 54);
  doc.text(`Stock moyen : ${stats.stockMoyen}`, 120, 54);
  doc.text(`Valeur totale : ${stats.valeurTotale.toFixed(2)} €`, 160, 54);
  // --- Table produits ---
  const columns = [
    { header: "Référence", dataKey: "reference" },
    { header: "Produits", dataKey: "designation" },
    { header: "Stock", dataKey: "quantite" },
    { header: "Prix Unitaire", dataKey: "prixUnitaire" },
    { header: "Total", dataKey: "total" },
  ];

  const rows = produits.map((p) => ({
    reference: p.reference,
    designation: p.nom,
    quantite: p.stock,
    prixUnitaire: p.prix,
    total: (p.stock * p.prix).toFixed(2) + "€",
  }));

  autoTable(doc, {
    startY: 63,
    columns,
    body: rows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [0, 0, 0] },
  });

  doc.setFontSize(10);
  doc.text(`Merci pour votre confiance - C'MADA Pro`, 70, 295);



    doc.save(fileName);
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
  return (
    <div className="h-full p-20 bg-base-200">
    <section id="inventory-section" className="page-section">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-base-800">Gestion du stock</h1>
        <p className="text-base-600">
          Suivez et gérez votre inventaire en temps réel
        </p>
      </div>

      <div className="bg-base-100 shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-base-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-lg font-semibold text-base-800">
                Inventaire des produits
              </h2>
              <p className="text-sm text-base-500">
                Statut actuel du stock et alertes
              </p>
            </div>
            <div className="flex space-x-3">
             <button className="border border-gray-300 hover:bg-base-50 text-base-700 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center"
              onClick={exportToPDF}>
             <img src="../file-export.svg" alt="" width={20} className="mr-2"
            />
                Exporter
              </button>
              <button className="btn btn-primary">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                Nouveau produit
              </button>
            </div>
          </div>
        </div>

           <div className="px-6 py-4 border-b border-base-200 bg-base-150">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-base-100 p-3 rounded shadow-sm">
          <p className="text-sm text-base-500">Produits en stock:    <span className="text-xl font-bold text-base-800">{produitsEnStock}</span></p>
          <p className="text-sm text-base-500">Quantité total en stock:    <span className="text-xl font-bold text-base-800">{quantiteTotaleEnStock}</span></p>
        </div>
        <div className="bg-base-100 p-3 rounded shadow-sm">
          <p className="text-sm text-base-500">Produits en rupture</p>
          <p className="text-xl font-bold text-red-600">{produitsEnRupture}</p>
        </div>
        <div className="bg-base-100 p-3 rounded shadow-sm">
          <p className="text-sm text-base-500">Stock moyen</p>
          <p className="text-xl font-bold text-base-800">{stockMoyen}</p>
        </div>
        <div className="bg-base-100 p-3 rounded shadow-sm">
          <p className="text-sm text-base-500">Valeur totale</p>
          <p className="text-xl font-bold text-base-800">
            {valeurTotale.toLocaleString("fr-FR", {
              style: "currency",
              currency: "EUR",
            })}
          </p>
        </div>
      </div>
    </div>

        <div className="overflow-x-auto">
           <table className="min-w-full divide-y divide-base-200">
      <thead className="bg-base-50">
        <tr>
          {[
            "Référence",
            "Produit",
            "Catégorie",
            "Stock",
            "Statut",
            "Actions",
          ].map((head) => (
            <th
              key={head}
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-base-500 uppercase tracking-wider"
            >
              {head}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-base-100 divide-y divide-base-200">
        {produits.map((item, index) => (
          <tr key={index}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-base-900">
              {item.reference}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-base-500">
              {item.nom}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-base-500">
              {item.categorie?.nom}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-base-500">
              {item.stock}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
  ${item.stock === 0
    ? "bg-red-100 text-red-800"
    : item.stock < item.stock_alert
    ? "bg-yellow-100 text-yellow-800"
    : "bg-green-100 text-green-800"
  }`}>
  {item.stock === 0
    ? "Rupture"
    : item.stock < item.stock_alert
    ? "Stock faible"
    : "Disponible"}
</span>

            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-base-500">
              <button className="text-blue-600 hover:text-blue-900 mr-3">
                Modifier
              </button>
              <button className="text-red-600 hover:text-red-900">
                Supprimer
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
        </div>
      </div>
    </section>
    </div>
  );
};

export default FournisseurStock;
