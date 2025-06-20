import React, { useState } from 'react';
import { useParams } from "react-router-dom";
import { API_URL } from '../../config';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePanier } from '../../components/PanierContext';
import CartPanel from '../../components/client/CartPanel';

const filterTypes = ['Tous', 'Précommande', 'Arrivages', 'Disponible', 'Déstockage', 'Échantillons'];
const filterCategories = ['Tous les produits', 'Chocolat', 'Fèves de cacao', 'Plariné', 'Autres'];


const ClientCalatogue = () => {
  const {
    panier,
    panierItems,  // Récupéré du contexte
    total,        // Récupéré du contexte
    ajouterAuPanier,
    diminuerQuantite,
    retirerDuPanier,
     updatePanier,
    viderPanier    // Nouvelle fonction
  } = usePanier();
    const { id } = useParams(); // ← récupère l'ID depuis l'URL
  const [produits, setProduits] = useState([]);
  const navigate = useNavigate();
   const [loading, setLoading] = useState(true);
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
const fetchProduits = async () => {
  try {
    const response = await fetch(`${API_URL}/produits`);
    if (!response.ok) {
      throw new Error('Erreur lors du chargement des produits');
    }
    const data = await response.json();

    // 👉 Filtrage ici : on ne garde que les produits validés
    const produitsValidés = data.filter((produit) => produit.validation === 'accepter');

    setProduits(produitsValidés);
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
  const [filterType, setFilterType] = useState('tous');
  const [filterCategory, setFilterCategory] = useState('tous les produits');
  const [searchTerm, setSearchTerm] = useState('');
  
useEffect(() => {
  const items = panier.reduce((acc, ref) => {
    const product = produits.find(p => p.reference === ref);
    if (!product) return acc;

    const existingItem = acc.find(item => item.reference === ref);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      acc.push({ ...product, quantity: 1 });
    }
    return acc;
  }, []);

  const total = items.reduce((sum, item) => sum + (item.prix * item.quantity), 0);

  updatePanier(items, total);
}, [panier, produits]);

 // Ajouter au panier (beaucoup plus simple maintenant)
const addToCart = (ref) => {
  ajouterAuPanier(ref);
  alert(`Produit ${ref} ajouté au panier`);
};

// Augmenter quantité
const handleIncrease = (index) => {
  const ref = panierItems[index].reference;
  ajouterAuPanier(ref);
};

// Diminuer quantité
const handleDecrease = (index) => {
  const ref = panierItems[index].reference;
  diminuerQuantite(ref);
};

// Supprimer produit
const handleDeleteProduct = (index) => {
  const ref = panierItems[index].reference;
  retirerDuPanier(ref);
};


  const handleFilterType = (type) => {
    setFilterType(type);
  };

  const handleFilterCategory = (cat) => {
    setFilterCategory(cat);
  };

  const showProductDetails = (ref) => {
    console.log(`Show details for: ${ref}`);
  };

  // Fonction pour filtrer les produits selon filterType, filterCategory et searchTerm
  const filteredProducts = produits.filter((product) => {
    // Filtre par type (statut)
    const typeMatch =
      filterType === 'tous' ||
      (filterType === 'précommande' && product.statut.toLowerCase() === 'précommander') ||
      (filterType === 'disponible' && product.statut.toLowerCase() === 'disponible') ||
      (filterType === 'déstockage' && product.statut.toLowerCase() === 'déstockage') ||
      (filterType === 'nouveauté' && product.statut.toLowerCase() === 'nouveauté') ||
      (filterType === 'échantillons' && product.statut.toLowerCase() === 'échantillons') ||
      (filterType === 'arrivages' && product.statut.toLowerCase() === 'arrivages');

    // Filtre par catégorie
  const categoryMatch =
  filterCategory.toLowerCase() === 'tous les produits' ||
  (product.categorie?.nom?.toLowerCase() === filterCategory.toLowerCase());


    // Filtre par texte recherche
    const searchMatch =
      product.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.reference.toLowerCase().includes(searchTerm.toLowerCase());

    return typeMatch && categoryMatch && searchMatch;
  });

  // Groupement des produits par catégorie (pour afficher section par section)
 const groupedProducts = filteredProducts.reduce((groups, product) => {
  const catName = product.categorie?.nom || 'Autre';
  if (!groups[catName]) groups[catName] = [];
  groups[catName].push(product);
  return groups;
}, {});


  return (
    <section id="catalog-section" className=" bg-base-200 p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-base-800">Catalogue Produits</h1>
        <p className="text-base-600">Découvrez notre gamme complète de produits professionnels</p>
      </div>

      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="form-control w-full md:w-64 relative">
            <input
              type="text"
              placeholder="Rechercher un produit..."
              className="input input-bordered w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-400">
              <i className="fas fa-search"></i>
            </span>
          </div>

          <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0">
            {filterTypes.map((label, idx) => (
              <button
                key={idx}
                onClick={() => handleFilterType(label.toLowerCase())}
                className={`filter-btn px-4 py-2 border border-base-300 rounded-md text-sm font-medium text-base-700 hover:bg-base-50 ${
                  filterType === label.toLowerCase() ? 'filter-btn active px-4 py-2 border border-base-300 rounded-md text-sm font-medium bg-blue-50 text-blue-700 border-blue-300' : ''
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/6">
          <div className="bg-base-100 p-4 rounded-lg shadow">
            <h3 className="font-bold mb-3">Filtrer par catégorie</h3>
            <ul className="space-y-2">
              {filterCategories.map((cat, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => handleFilterCategory(cat)}
                    className={`text-blue-600 hover:text-base-800 ${
                      filterCategory === cat ? 'font-bold underline' : ''
                    }`}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:w-4/6">
          <div className="overflow-x-auto">
            <div className="max-h-[600px] overflow-y-auto border border-gray-200">
              <table className="table w-full bg-base-100">
                <thead className="bg-base-150 text-base">
                  <tr>
                    <th>Produit</th>
                    <th>Référence</th>
                    <th>Statut</th>
                    <th>Disponibilité</th>
                    <th>Prix</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedProducts).length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-base-500">
                        Aucun produit trouvé
                      </td>
                    </tr>
                  )}
                  {Object.entries(groupedProducts).map(([category, products]) => (
                    <React.Fragment key={category}>
                      <tr className="bg-base-100">
                        <td colSpan="6" className="font-semibold text-base-700">
                          {category}
                        </td>
                      </tr>

                      {products.map((product) => (
                        <tr key={product.reference}>
                          <td>{product.nom}</td>
                          <td>{product.reference}</td>
                           <td>
                          <span className={getBadgeStatut(product.statut)}>
                          {product.statut}</span></td>
                          <td>
                            {product.statut.toLowerCase() === 'précommande'
                              ? `Disponibilité: ${product.availabilityDate}`
                              : `Stock: ${product.stock ?? '-'}`}
                          </td>
                          <td>
                            <span className="font-bold">{product.prix}€</span>
                            {product.oldPrice && (
                              <span className="block text-xs line-through text-gray-400">
                                {product.oldPrice.toFixed(2)}€
                              </span>
                            )}
                          </td>
                          <td>
                            <div className="flex space-x-2">
                              <button
                                className="bg-blue-600 hover:bg-blue-700 text-base-100 py-1 px-2 rounded text-xs"
                                onClick={() => addToCart(product.reference)}
                              >
                                {product.statut.toLowerCase() === 'précommande'
                                  ? 'Précommander'
                                  : 'Commander'}
                              </button>
                              <button
                                className="border border-gray-300 hover:bg-gray-50 text-gray-700 py-1 px-2 rounded text-xs"
                                   onClick={() => navigate(`/client/product/detail/${product.id}`)}
                              >
                                Détails
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

  
 <CartPanel
  cartItems={panierItems}  // Utilisez directement du contexte
  total={total}            // Utilisez directement du contexte
  handleIncrease={handleIncrease}
  handleDecrease={handleDecrease}
  handleDeleteProduct={handleDeleteProduct}
/>
      </div>
    </section>
  );
};

export default ClientCalatogue;
