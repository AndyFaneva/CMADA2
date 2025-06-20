import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../config";

export default function DetailProduit() {
  const { id } = useParams(); // ← récupère l'ID depuis l'URL
  const [produit, setProduit] = useState(null);
  const navigate = useNavigate();

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
    const fetchProduit = async () => {
      try {
        const response = await fetch(`${API_URL}/produits/${id}`);
        if (!response.ok) {
          throw new Error("Erreur lors du chargement du produit");
        }
        const data = await response.json();
        setProduit(data);
      } catch (error) {
        console.error("Erreur:", error);
      }
    };

    fetchProduit();
  }, [id]);

  if (!produit) {
    return <div className="p-6">Chargement...</div>;
  }

  return (

    <>
     <div className="h-full p-20 bg-base-200">
            <div className="bg-base-100 rounded-lg shadow-md overflow-hidden">
                <div className="md:flex">
                    <div className="md:w-1/2 p-6">
                        <div className="mb-4">
                            <button 
                            onClick={() =>navigate('../admin/product')} className="text-blue-600 hover:text-blue-800 flex items-center">
                                 <img src="/arrow.png" alt="" width={25} /> Retour
                            </button>
                        </div>
                        <div className="relative">
                            <span  className={getBadgeStatut(produit.statut)}>{produit.statut}</span>
                        </div>
                        <div className="mt-4 flex space-x-2">
  <img
  src={
     produit.image && !["null", null, ""].includes(produit.image)
       ? `${API_URL}/uploads/${produit.image}`
       : "/photo.png"
  }
  alt={produit.nom}
 className="w-300 h-300 object-cover mb-4"
 />
                        </div>
                    </div>
                    <div className="md:w-1/2 p-6">
                        <h1  className="text-2xl font-bold text-gray-800">Produit Professionnel</h1>
                        <p  className="text-gray-600 text-sm">Réf: {produit.reference}</p>
                        
                        <div className="mt-4 flex items-center">
                            <div className="flex items-center text-yellow-400">
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="far fa-star"></i>
                            </div>
                        </div>
                        
                        <div className="mt-4">
                            <p  className="text-3xl font-bold text-gray-900">{produit.prix}€</p>
                            <p className="text-green-600">Remise 10%</p>
                        </div>
                        
                        <div className="mt-6">
                            <h2 className="text-lg font-semibold text-gray-800">Disponibilité</h2>
                            <p className="text-gray-600 mt-1">En stock: <span className="font-medium text-gray-800">{produit.stock} unités</span></p>
                            <p  className="text-gray-600 mt-1">Livraison estimée: <span className="font-medium text-gray-800">2-3 jours</span></p>
                        </div>
                        
                        <div className="mt-6">
                            <h2 className="text-lg font-semibold text-gray-800">Description</h2>
                            <p  className="text-gray-600 mt-1">{produit.description}</p>
                        </div>
                        
                      <div className="mt-6">
  <h2 className="text-lg font-semibold text-gray-800">Caractéristiques</h2>
 <ul className="mt-2 space-y-1 text-gray-600">
  {produit.caracteristiques && produit.caracteristiques.length > 0 ? (
    [...new Map(
      produit.caracteristiques.map(item => [`${item.nom}:${item.valeur}`, item])
    ).values()].map((item, index) => (
      <li key={index} className="flex items-center">
     <img src="../../check.png" alt="" width={20} className="pr-1"/>
        <span className="font-semibold">{item.nom} :</span>
        <span className="ml-1">{item.valeur}</span>
      </li>
    ))
  ) : (
    <li className="text-gray-500 italic">Aucune caractéristique disponible.</li>
  )}
</ul>
</div>

                        
                    </div>
                </div>
            </div>
        </div>
</>
    
  );
}
