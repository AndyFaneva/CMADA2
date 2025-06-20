import React, { useState, useEffect } from 'react';
import axios from "axios";
import { API_URL } from '../../config';

const featureTypes = [
  { id: "couleur", label: "Couleur", placeholder: "Ex: Rouge" },
  { id: "taille", label: "Taille", placeholder: "Ex: Medium" },
  { id: "poids", label: "Poids", placeholder: "Ex: 500g" },
];

export default function AjouterProduitModal({ show, onClose, product ,onProductUpdated}) {
  const [selectedFile, setSelectedFile] = useState(null);
   const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState(null);

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
        console.log('Données reçues:', response.data); // Debug
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
    if (product) {
      setForm({
         id: product.id || null,
        nom: product.nom || "",
        reference: product.reference || "",
        description: product.description || "",
        tva: product.tva || "",
        stock: product.stock || "",
           entrcategorie_ideprise: product.categorie_id || "",
             ajouter_par: product.ajouter_par || "",
        user_id: product.user_id || "",
           caracteristiques: product.caracteristiques || "",
      });
    }
  }, [product]);

  const [form, setForm] = useState({
    id:null,
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
    caracteristiques: [],
  });

  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const removeCaracteristique = (index) => {
  const updated = form.caracteristiques.filter((_, i) => i !== index);
  setForm({ ...form, caracteristiques: updated });
};

  const handleCaracteristiqueChange = (index, field, value) => {
    const updated = [...form.caracteristiques];
    updated[index][field] = value;
    setForm({ ...form, caracteristiques: updated });
  };

  const addCaracteristique = () => {
    setForm({
      ...form,
      caracteristiques: [...form.caracteristiques, { nom: '', valeur: '' }],
    });
  };

   const [selectedImage, setSelectedImage] = useState(null);

  const handleFileChange = (e) => {
     setImage(e.target.files[0]);
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(URL.createObjectURL(file));
    }
  };
const placeholders = {
  "":"",
  Poids: "500g",
  Origine: "Madagascar",
  Composition: "Cacao, sucre, beurre, ...",
  Allergènes: "Peut contenir des traces de lait",
  DLUO: "12 mois",
  Conservation: "À conserver au sec",
  Certification: "Bio, Commerce équitable",
};

const handleSubmit = async (e) => {
  e.preventDefault();

  const updatedForm = { ...form };

  if (!updatedForm.reference) {
    alert("La référence est requise.");
    return;
  }

  switch (String(updatedForm.categorie_id)) {
    case "1":
      updatedForm.reference = `CHOCO-${form.reference}`;
      break;
    case "2":
      updatedForm.reference = `FEVE-${form.reference}`;
      break;
    case "3":
      updatedForm.reference = `PLARI-${form.reference}`;
      break;
    case "4":
      updatedForm.reference = `AUTRE-${form.reference}`;
      break;
    default:
      updatedForm.reference = `NC-${form.reference}`;
  }

  const formData = new FormData();
    formData.append("nom", updatedForm.nom);
    formData.append("description", updatedForm.description);
    formData.append("statut", updatedForm.statut);
  formData.append("reference", updatedForm.reference);
  formData.append("prix", Number(updatedForm.prix));
  formData.append("tva", Number(updatedForm.tva));
  formData.append("stock", Number(updatedForm.stock));
  formData.append("stock_alert", Number(updatedForm.stock_alert));
  formData.append("ajouter_par", String(updatedForm.ajouter_par));
  formData.append("user_id", Number(updatedForm.user_id));
  formData.append("categorie_id", Number(updatedForm.categorie_id));
  formData.append("validation", updatedForm.validation ? "1" : "false");

  if (image) {
    formData.append("image", image);
  } else {
    alert("Veuillez ajouter une image.");
    return;
  }

  formData.append("caracteristiques", JSON.stringify(updatedForm.caracteristiques || []));

  // 🔍 DEBUG : Affiche toutes les paires clé/valeur
  for (const [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }

  try {
    const response = await axios.post("http://localhost:3000/produits", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    alert("✅ Produit ajouté !");
    console.log(response.data);
    onClose();
  } catch (error) {
    console.error("❌ Erreur lors de la création :", error.response?.data || error.message);
    alert("Erreur 400 : Données invalides. Vérifie tous les champs obligatoires.");
  }
};






  if (!show) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b">
          <h2 className="text-xl font-bold">
        {form && form.id ? "Modifier le produit" : "Ajouter un nouveau produit"}
          </h2>
          <button onClick={onClose} className="btn btn-sm btn-circle">✕</button>
        </div>
{/* <div>Role: {profile.role}</div>
<div>Id: {profile.id}</div> */}
   <form className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6"   onSubmit={handleSubmit} 
  method="POST" 
  encType="multipart/form-data">
      {/* Colonne gauche */}
      <div>
        {/* Informations de base */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-base-800 mb-3">Informations de base</h4>
           <input name="ajouter_par" value={profile.role} type='hidden'/>
     <input name="user_id" value={profile.id} type='hidden'/>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-base-700">Nom du produit *</label>
              <input
                type="text"
        name="nom"
        placeholder="Nom"
        value={form.nom}
        onChange={handleChange} 
        className="mt-1 block w-full border border-base-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="reference" className="block text-sm font-medium text-base-700">Référence *</label>
              <input 
               type="text"
        name="reference"
        placeholder="Référence"
        value={form.reference}
        onChange={handleChange}
              className="mt-1 block w-full border border-base-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-base-700">Description</label>
              <textarea
              name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
               className="mt-1 block w-full border border-base-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
            </div>
          </div>
        </div>

        {/* Prix et stock */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-base-800 mb-3">Prix et stock</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-base-700">Prix HT *</label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <input 
                 type="number"
        name="prix"
        placeholder="Prix"
        value={form.prix}
        onChange={handleChange}
                className="mt-1 block w-full border border-base-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-base-500 sm:text-sm">€</span>
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="tax" className="block text-sm font-medium text-base-700">TVA *</label>
              <select 
              type="number"
        name="tva"
        placeholder="TVA"
        value={form.tva}
        onChange={handleChange}
              className="mt-1 block w-full border border-base-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
               <option value="">...%</option>
                <option value="5.5">5.5%</option>
                <option value="10">10%</option>
                <option value="20">20%</option>
              </select>
            </div>
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-base-700">Stock *</label>
              <input 
              type="number"
        name="stock"
        placeholder="Stock"
        value={form.stock}
        onChange={handleChange}
               className="mt-1 block w-full border border-base-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="minStock" className="block text-sm font-medium text-base-700">Stock d'alerte</label>
              <input 
                type="number"
        name="stock_alert"
        placeholder="Stock Alerte"
        value={form.stock_alert}
        onChange={handleChange}
              className="mt-1 block w-full border border-base-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Colonne droite */}
      <div>
        {/* Catégorie et statut */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-base-800 mb-3">Catégorie et statut</h4>
          <div className="space-y-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-base-700">Catégorie *</label>
              <select 
             name="categorie_id"
        value={form.categorie_id}
        onChange={handleChange}
              className="mt-1 block w-full border border-base-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option value="">Sélectionnez une catégorie</option>
                <option value="1">Chocolat</option>
                <option value="2">Fèves de cacao</option>
                <option value="3">Plariné</option>
                <option value="4">Autres</option>
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-base-700">Statut *</label>
              <select 
       name="statut"
        value={form.statut}
        onChange={handleChange}
              className="mt-1 block w-full border border-base-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                 <option value="">Sélectionnez...</option>
                <option value="arrivages">Arrivages</option>
                <option value="disponible">Disponible</option>
                <option value="précommander">Précommande</option>
                <option value="déstockage">Déstockage</option>
                 <option value="échantillons">Echantillons</option>
              </select>
            </div>
          </div>
        </div>

        {/* Image */}
    <div className="mb-6">
      <h4 className="text-md font-medium text-base-800 mb-3">Images du produit</h4>
      
      <div className="flex items-center justify-center w-full">
        <label htmlFor="image" className="flex flex-col items-center justify-center w-full h-32 border-2 border-base-300 border-dashed rounded-lg cursor-pointer bg-base-50 hover:bg-base-100">
          <div >
            <i className="fas fa-cloud-upload-alt text-base-400 text-3xl mb-2"></i>
            <p className="mb-2 text-sm text-base-500">
              <span className="font-semibold">Cliquez pour télécharger</span>
            </p>
            <p className="text-xs text-base-500">PNG, JPG, JPEG (MAX. 5MB)</p>
          </div>
          <input 
            type="file"
            accept="image/*"
            name="image"
            className="hidden"
            id="image"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {selectedImage && (
        <div className="mt-4 text-center">
          <img src={selectedImage} alt="Aperçu du produit" className="max-h-48 mx-auto rounded shadow" 
          width={100}/>
        </div>
      )}
    </div>

        {/* Caractéristiques */}
        <div>
          <h4 className="text-md font-medium text-base-800 mb-3">Caractéristiques</h4>
          <div className="space-y-2">
             {form.caracteristiques.map((c, i) => (
        <div key={i} className="flex gap-2 mb-2">
  <select
  value={c.nom}
  onChange={(e) => handleCaracteristiqueChange(i, 'nom', e.target.value)}
  className="flex-1 border border-base-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
>
  <option value="">Sélectionnez...</option>
  <option value="Poids">Poids</option>
  <option value="Origine">Origine</option>
  <option value="Composition">Composition</option>
  <option value="Allergènes">Allergènes</option>
  <option value="DLUO">DLUO</option>
  <option value="Conservation">Conservation</option>
  <option value="Certification">Certification</option>
</select>

<input
  placeholder={placeholders[c.nom] || "Valeur"}
  value={c.valeur}
  onChange={(e) => handleCaracteristiqueChange(i, 'valeur', e.target.value)}
  className="flex-1 border border-base-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
/>

          <button
            type="button"
             onClick={() => removeCaracteristique(i)}
            className="btn btn-error btn-sm"
          >
            X
          </button>
        </div>
      ))}
          </div>
          <button  
          type="button"
        onClick={addCaracteristique} className="btn-add-feature">
            <i className="mt-2 inline-flex items-center px-3 py-1 border border-base-300 shadow-sm text-sm leading-4 font-medium rounded-md text-base-700 bg-base-100 hover:bg-base-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"></i>+ Ajouter une caractéristique
          </button>
        </div>
          <div className="flex justify-end gap-2 mt-6">
    <button type="submit" className="btn btn-primary">
      {form.id ? 'Modifier' : 'Ajouter'}
    </button>
    <button type="button" onClick={onClose} className="btn btn-outline">
      Annuler
    </button>
  </div>
      </div>
    </form>
      </div>
    </div>
  );
}



