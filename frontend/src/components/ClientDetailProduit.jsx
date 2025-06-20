import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../config";

export default function ClientDetailProduit() {
  const { id } = useParams(); // ← récupère l'ID depuis l'URL
  const [produit, setProduit] = useState(null);
  const navigate = useNavigate();
    const [quantite, setQuantite] = useState(1);

  const increment = () => setQuantite(prev => prev + 1);
  const decrement = () => setQuantite(prev => (prev > 1 ? prev - 1 : 1));

  const addToCartFromDetails = () => {
    console.log(`Ajouté au panier : quantité ${quantite}`);
    // Ajoute ici la logique pour ajouter au panier
  };

  const downloadFicheTechnique = (ref) => {
    console.log(`Téléchargement de la fiche technique : ${ref}`);
    // Ajoute ici ta logique pour le téléchargement
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
     <div className="h-full p-10 bg-base-200">
            <div className="bg-base-100 rounded-lg shadow-md overflow-hidden">
                <div className="md:flex">
                    <div className="md:w-1/2 p-6">
                        <div className="mb-4">
                            <button 
                            onClick={() =>navigate('../client/catalogue')} className="text-blue-600 hover:text-blue-800 flex items-center">
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
 className="w-200 h-200 object-cover mb-4"
 />
                        </div>
                    </div>
                    <div className="md:w-1/2 p-6">
                        <h1  className="text-2xl font-bold text-base-800">Produit Professionnel</h1>
                        <p  className="text-base-600 text-sm">Réf: {produit.reference}</p>
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
                            <p  className="text-3xl font-bold text-base-900">{produit.prix}€</p>
                            <p className="text-green-600">Remise ...%</p>
                        </div>
                        <div className="mt-6">
                            <h2 className="text-lg font-semibold text-base-800">Disponibilité</h2>
                            <p className="text-base-600 mt-1">En stock: <span className="font-medium text-base-800">{produit.stock} unités</span></p>
                        </div>
                        <div className="mt-6">
                            <h2 className="text-lg font-semibold text-base-800">Description</h2>
                            <p  className="text-base-600 mt-1">{produit.description}</p>
                        </div>
                      <div className="mt-6">
  <h2 className="text-lg font-semibold text-base-800">Caractéristiques</h2>
 <ul className="mt-2 space-y-1 text-base-600">
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
    <li className="text-base-500 italic">Aucune caractéristique disponible.</li>
  )}
</ul>
         <div className="mt-8">
      <div className="flex items-center">
        <span className="mr-4 text-gray-700">Quantité :</span>
        <div className="flex items-center border border-gray-300 rounded">
          <button
            onClick={decrement}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
          >
            -
          </button>
          <input
            type="text"
            value={quantite}
            readOnly
            className="w-12 text-center border-x border-gray-300 py-1"
          />
          <button
            onClick={increment}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <button
          onClick={addToCartFromDetails}
          className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium transition-colors"
        >
          Ajouter au panier
        </button>
        <button
          className="border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center"
        >
          <i className="far fa-star mr-2"></i> Favoris
        </button>
      </div>

      <div className="mt-4 flex justify-between text-sm">
        <button
          onClick={() => downloadFicheTechnique('PRO-A-2023')}
          className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
        >
          <i className="far fa-file-pdf mr-1"></i> Fiche technique
        </button>
        <button className="text-blue-600 hover:text-blue-800 flex items-center">
          <i className="fas fa-share-alt mr-1"></i> Partager
        </button>
      </div>
    </div>
</div>
                    </div>
                </div>
            </div>
        </div>
</>
    
  );
}
