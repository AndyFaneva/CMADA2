import React, { useEffect, useState } from "react";
import { API_URL } from "../../config";
import DetailProduit from "../../components/DetailProduit";
import { useNavigate } from "react-router-dom";

export default function AdminProduct() {
  const [produits, setProduits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
   const [message, setMessage] = useState('');
   const navigate = useNavigate();
  
  
   
const getBadgeStatut = (validation) => {
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

  // Fonction pour récupérer les produist
  const fetchProduits = async () => {
    try {
      const response = await fetch(`${API_URL}/produits`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des produits');
      }
      const data = await response.json();
      setProduits(data);
    } catch (error) {
      console.error('Erreur:', error);
      setMessage(error.message);
    } finally {
      setLoading(false); // Fin du chargement
    }
  };

  useEffect(() => {
    fetchProduits();
  }, []);

const toggleProduitValidation = async (produitId, newValidation) => {
  try {
    const response = await fetch(`${API_URL}/produits/${produitId}/validation`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ validation: newValidation }),
    });

    if (!response.ok) {
      throw new Error("Échec de la mise à jour de la validation");
    }

    // Mise à jour locale de la liste
    setProduits((prev) =>
      prev.map((p) =>
        p.id === produitId ? { ...p, validation: newValidation } : p
      )
    );
    setMessage("Validation mise à jour avec succès");
    setTimeout(() => setMessage(''), 5000);
  } catch (error) {
    console.error("Erreur:", error);
    setMessage(error.message);
    setTimeout(() => setMessage(''), 5000);
  }
};


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


  return (
    <div className="h-full p-20 bg-base-200">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Gestion des Produits</h1>
          <p className="text-gray-600">Créez et gérez vos produits</p>
        </div>

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
                        <td>{product.prix} €</td>
                        <td>
                            {product.stock}
                        </td>
                       <td className={`${getBadgeStatut(product.validation)} text-center align-middle mt-3`}>
        {product.validation === "false" && "Non traité"}
        {product.validation === "accepter" && "Accepter"}
        {product.validation === "refuser" && "Refuser"}
      </td>
      <td>
         <button className="text-blue-600 hover:text-blue-900 mr-3"
        onClick={() => navigate(`/admin/product/detail/${product.id}`)}
                            >Détails</button>
        {product.validation === "false" && (
          <>
          <div className="flex space-x-2">
              <button className="text-green-600 hover:text-green-900 mr-3"
                onClick={() => toggleProduitValidation(product.id, "accepter")}
                            >Accepter</button>
              <button className="text-red-600 hover:text-red-900 mr-3"
                  onClick={() => toggleProduitValidation(product.id, "refuser")}
                            >Refuser</button>
            </div>
          </>
        )}
        {product.validation === "accepter" && (
           <>
              <button className="text-red-600 hover:text-red-900 mr-3"
                  onClick={() => toggleProduitValidation(product.id, "refuser")}
                            >Refuser</button>
                            </>
        )}
        {product.validation === "refuser" && (
           <>
              <button className="text-green-600 hover:text-green-900 mr-3"
                onClick={() => toggleProduitValidation(product.id, "accepter")}
                            >Accepter</button>
                               </>
        )}
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

    </div>
  );
}
