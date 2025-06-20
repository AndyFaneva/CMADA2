import React, { useRef, useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { API_URL } from '../../config';

const DocumentModal = ({ isOpen, onClose, commandeId }) => {
  const contentRef = useRef();
  const [commande, setCommande] = useState(null);
  const [loading, setLoading] = useState(false);
    const [lignes, setLignes] = useState([]);
    const [produits, setProduits] = useState([]);
    const [client, setClient] = useState(null);

useEffect(() => {
  async function fetchProduits() {
    try {
      const res = await fetch(`${API_URL}/produits`); // ton endpoint pour tous les produits
      const data = await res.json();
      setProduits(data);
    } catch (error) {
      console.error('Erreur chargement produits', error);
    }
  }
  fetchProduits();
}, []);

const getReferenceProduit = (produitId) => {
  const produit = produits.find(p => p.id === produitId);
  return produit ? produit.reference : 'Réf inconnue';
};

const getNomProduit = (produitId) => {
  const produit = produits.find(p => p.id === produitId);
  return produit ? produit.nom : 'Réf inconnue';
};

const genererRefCommande = (dateString, id) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  return `#CMD-${year}-${id}`;
};

const formatDateDMY = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // +1 car Janvier = 0
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};
const today = new Date();
const formattedToday = formatDateDMY(today.toISOString());

  useEffect(() => {
    if (!commandeId) return;

    const fetchCommande = async () => {
      setLoading(true);
      try {
        const resCommande = await fetch(`${API_URL}/commande/${commandeId}`);
        if (!resCommande.ok) throw new Error('Erreur commande');
        const dataCommande = await resCommande.json();
        setCommande(dataCommande);

        const resLignes = await fetch(`${API_URL}/commande/produit/${commandeId}`);
        if (!resLignes.ok) throw new Error('Erreur lignes commande');
        const dataLignes = await resLignes.json();
        setLignes(dataLignes);
      } catch (err) {
        console.error(err);
        setCommande(null);
        setLignes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCommande();
  }, [commandeId]);

useEffect(() => {
  if (!commande?.client_id) return;

  const fetchClient = async () => {
    try {
      const res = await fetch(`${API_URL}/utilisateur/${commande.client_id}`);
      const data = await res.json();
      setClient(data);
    } catch (error) {
      console.error('Erreur récupération client:', error);
    }
  };

  fetchClient();
}, [commande]);


  const handleDownloadPDF = async () => {
    const input = contentRef.current;
    if (!input) return;
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${commande?.number || 'document'}.pdf`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-auto rounded-lg shadow-lg">
        <div ref={contentRef} className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              {loading ? 'Chargement...' : ``}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              aria-label="Fermer la fenêtre modale"
            >
              ✕
            </button>
          </div>

          {loading ? (
            <p>Chargement des détails de la commande...</p>
          ) : commande ? (
            <>
              {/* Informations entreprise */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between">
                  <div>
                    <h4 className="text-xl font-bold">C'MADA Pro</h4>
                    <p className="text-sm text-gray-600">123 Rue des Entreprises</p>
                    <p className="text-sm text-gray-600">75000 Paris, France</p>
                    <p className="text-sm text-gray-600">Tél: +33 1 23 45 67 89</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{genererRefCommande(commande.created_at, commande.id)}</p>
                    <p className="text-sm text-gray-600">Date : {formatDateDMY(today)}</p>
                    <p className="text-sm text-gray-600">Statut : {commande.statut || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Client et Livraison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h5 className="font-medium text-gray-800 mb-2">Client</h5>
                  <p>{client?.nom || '-'}</p>
                  <p>{client?.entreprise || '-'}</p>
                  <p>{client?.poste || '-'}</p>
                  <p>Contact : {client?.nom} {client?.prenom} - {client?.email} </p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-800 mb-2">Livraison</h5>
 <p>{client?.entreprise || '-'}</p>
                  <p>{client?.poste || '-'}</p>
                  <p>Date souhaitée : {commande.dateLivraison || '-'}</p>
                </div>
              </div>

              {/* Lignes de commande */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-xs text-left text-gray-500 uppercase">Réf</th>
                      <th className="px-3 py-2 text-xs text-left text-gray-500 uppercase">Désignation</th>
                      <th className="px-3 py-2 text-xs text-left text-gray-500 uppercase">Qté</th>
                      <th className="px-3 py-2 text-xs text-left text-gray-500 uppercase">Prix U.</th>
                      <th className="px-3 py-2 text-xs text-left text-gray-500 uppercase">Remise</th>
                      <th className="px-3 py-2 text-xs text-left text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
           <tbody className="bg-white divide-y divide-gray-200">
  {commande.commandeProduits?.map((line, index) => (
    <tr key={index}>
      <td className="px-3 py-2">{getReferenceProduit(line.produit_id)}</td>
      <td className="px-3 py-2">{getNomProduit(line.produit_id)}</td>
      <td className="px-3 py-2">{line.quantite}</td>
      <td className="px-3 py-2">{line.prix}€</td>
      <td className="px-3 py-2">{line.remise || 0}%</td>
      <td className="px-3 py-2">  {(
    line.prix * line.quantite * (1 - (line.remise || 0) / 100)
  ).toFixed(2)}€</td>
    </tr>
  ))}
</tbody>
                </table>
              </div>

              {/* Totaux */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-800 mb-2">Conditions</h5>
                  <p>Paiement : 30 jours fin de mois</p>
                  <p>Livraison : Sous 5 jours ouvrés</p>
                </div>
                <div className="bg-gray-100 p-3 rounded">
                  <div className="flex justify-between">
                    <span>Total HT :</span>
                    <span>{commande.sousTotal}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TVA (20%) :</span>
                    <span>{commande.tva}€</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-gray-300 mt-1 pt-1">
                    <span>Total TTC :</span>
                    <span>{commande.total}€</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p>Aucune donnée à afficher.</p>
          )}
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-2">
          <button
            onClick={handleDownloadPDF}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={loading || !commande}
          >
            Télécharger PDF
          </button>
          <button
            onClick={onClose}
            className="border px-4 py-2 rounded hover:bg-gray-100"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentModal;
