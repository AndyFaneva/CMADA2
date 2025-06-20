import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../config";
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export default function PublicDetailProduit() {
  const { id } = useParams(); // ← récupère l'ID depuis l'URL
  const [produits, setProduits] = useState([]);
  const navigate = useNavigate();
    const [quantite, setQuantite] = useState(1);

  const increment = () => setQuantite(prev => prev + 1);
  const decrement = () => setQuantite(prev => (prev > 1 ? prev - 1 : 1));
  const addToCartFromDetails = () => {
    console.log(`Ajouté au panier : quantité ${quantite}`);
    // Ajoute ici la logique pour ajouter au panier
  };

 
     const exportToPDF = () => {
    const doc = new jsPDF();
      const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, "0"); // mois 2 chiffres
const dd = String(today.getDate()).padStart(2, "0");
const fileName = `Fiche_Technique_${produits.reference}.pdf`;

        // --- Header ---
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text("FICHE TECHNIQUE", 80, 15);
  doc.line(14,20,200,20)
  doc.setFontSize(10);
    doc.setFont(undefined, 'normal');


  doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
  doc.text("Désignation:", 14, 37);
      doc.setFont(undefined, 'normal');
    doc.text(`${produits.nom}`, 50, 37);

      doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
  doc.text("Référence:", 14, 43);
      doc.setFont(undefined, 'normal');
    doc.text(`${produits.reference}`, 50, 43);

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
  doc.text("CARACTERISTIQUES TECHNIQUES", 14, 63);
  doc.line(14,64,57,64);
      doc.setFont(undefined, 'normal');


let y = 70; // Position verticale initiale (ajuste selon ton besoin)

// Vérifie si les caractéristiques existent et sont un tableau
if (Array.isArray(produits.caracteristiques) && produits.caracteristiques.length > 0) {
  // Supprimer les doublons (comme dans ton affichage React)
  const uniqueCaracteristiques = [
    ...new Map(
      produits.caracteristiques.map(item => [`${item.nom}:${item.valeur}`, item])
    ).values()
  ];

  uniqueCaracteristiques.forEach((item) => {
    doc.text(`${item.nom} : ${item.valeur}`, 14, y);
    y += 7; // Décalage pour la prochaine ligne
  });
} else {
  doc.text("Aucune caractéristique disponible.", 14, y);
}


// Ajouter une 2e page
doc.addPage();

// Titre
doc.setFontSize(14);
doc.setFont(undefined, 'bold');
doc.text("INFORMATIONS NUTRITIONNELLES", 14, 20);

// Ligne sous le titre
doc.line(14, 22, 57, 22);

doc.setFontSize(12);
doc.setFont(undefined, 'normal');

let y2 = 30; // Position de départ verticale
const nutriments = [
  ["Énergie", "550 kcal"],
  ["Matières grasses", "38g"],
  ["- dont acides gras saturés", "22g"],
  ["Glucides", "45g"],
  ["- dont sucres", "30g"],
  ["Protéines", "8g"],
  ["Sel", "0.1g"],
];
// Afficher le tableau
autoTable(doc, {
  startY: 30,
  head: [["Nutriment", "Valeur pour 100g"]],
  body: nutriments,
  styles: {
    fontSize: 11,
    cellPadding: 4,
  },
  alternateRowStyles: { fillColor: [240, 240, 240] }, // gris clair
  headStyles: { fillColor: [41, 128, 185], textColor: 255 }, // bleu foncé
});

// Texte de fin
let finalY = doc.lastAutoTable.finalY + 10;
doc.setFontSize(11);
doc.setTextColor(100);
doc.text("Les valeurs nutritionnelles sont données à titre indicatif et peuvent varier.", 14, finalY);
doc.text("Ne pas consommer si l'emballage est endommagé.", 14, finalY + 7);


doc.setTextColor(0);


  doc.setFontSize(10);
  doc.text(`Merci pour votre confiance - C'MADA Pro`, 70, 295);



    doc.save(fileName);
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
        setProduits(data);
      } catch (error) {
        console.error("Erreur:", error);
      }
    };

    fetchProduit();
  }, [id]);

  if (!produits) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <>
     <div className="h-full p-6 bg-base-200">
            <div className="bg-base-100 rounded-lg shadow-md overflow-hidden">
                <div className="md:flex">
                    <div className="md:w-1/2 p-6">
                        <div className="mb-4">
                            <button 
                            onClick={() =>navigate('../product')} className="text-blue-600 hover:text-blue-800 flex items-center">
                                <img src="/arrow.png" alt="" width={25} /> Retour
                            </button>
                        </div>
                        <div className="relative">
                            <span  className={getBadgeStatut(produits.statut)}>{produits.statut}</span>
                        </div>
                        <div className="mt-4 flex space-x-2">
  <img
  src={
     produits.image && !["null", null, ""].includes(produits.image)
       ? `${API_URL}/uploads/${produits.image}`
       : "/photo.png"
  }
  alt={produits.nom}
 className="w-200 h-200 object-cover mb-4"
 />
                        </div>
                    </div>
                    <div className="md:w-1/2 p-6">
                        <h1  className="text-2xl font-bold text-base-800">Produit Professionnel</h1>
                        <p  className="text-base-600 text-sm">Réf: {produits.reference}</p>
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
                            <p  className="text-3xl font-bold text-base-900">{produits.prix}€</p>
                            <p className="text-green-600">Remise ...%</p>
                        </div>
                        <div className="mt-6">
                            <h2 className="text-lg font-semibold text-base-800">Disponibilité</h2>
                            <p className="text-base-600 mt-1">En stock: <span className="font-medium text-base-800">{produits.stock} unités</span></p>
                        </div>
                        <div className="mt-6">
                            <h2 className="text-lg font-semibold text-base-800">Description</h2>
                            <p  className="text-base-600 mt-1">{produits.description}</p>
                        </div>
                      <div className="mt-6">
  <h2 className="text-lg font-semibold text-base-800">Caractéristiques</h2>
 <ul className="mt-2 space-y-1 text-base-600">
  {produits.caracteristiques && produits.caracteristiques.length > 0 ? (
    [...new Map(
      produits.caracteristiques.map(item => [`${item.nom}:${item.valeur}`, item])
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
        onClick={exportToPDF}
          className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
        >
          <img src="../../pdf.png" alt="" width={15} className="pr-1"/> Fiche technique
        </button>
        <button className="text-blue-600 hover:text-blue-800 flex items-center">
          <img src="../../share.png" alt="" width={15} className="pr-1"/> Partager
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
