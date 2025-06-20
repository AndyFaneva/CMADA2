import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const ConfirmationCommande = () => {
  const navigate = useNavigate();
    const { state } = useLocation();
  const order = state?.order ;

  const viewOrder = (id) => {
    // Navigue vers la page de détail de commande
    navigate(`/client/commande/${id}`);
  };

  const downloadOrder = (id) => {
    // Télécharger le PDF (implémenter selon backend)
    console.log('Télécharger le PDF de la commande', id);
  };

  const printOrder = (id) => {
    // Impression (peut être un redirect vers une page imprimable ou window.print)
    window.print();
  };

  const retourCatalogue = () => {
    navigate('/client/catalogue');
  };

  if (!order) {
    return (
      <div className="text-center mt-10 text-red-500 font-semibold">
        Aucune commande à afficher.
      </div>
    );
  }

  return (
    <div className="bg-base-100 p-6 m-20 rounded-lg shadow-md max-w-2xl mx-auto">
      <div className="text-center mb-6">
            <img src="../../accept.png" alt="" width={50} className='mx-auto'/>
        <h2 className="text-2xl font-bold text-base-800">Commande confirmée !</h2>
        <p className="text-base-600 mt-2">Votre commande a été passée avec succès</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-base-800 mb-2">Récapitulatif</h3>
        <div className="bg-base-50 p-4 rounded-lg">
          <p><strong>N° Commande:</strong> {order.id}</p>
          <p><strong>Date:</strong> {order.date}</p>
          <p><strong>Total TTC:</strong> {order.total} €</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button onClick={() => viewOrder(order.id)} className="bg-blue-600 flex hover:bg-blue-700 text-base-100 py-2 px-4 rounded-md font-medium">
          <i className="fas fa-file-alt mr-2"><img src="../../document.png" width={25} alt="" /></i> Voir le bon de commande
        </button>
        <button onClick={() => downloadOrder(order.id)} className="border flex border-base-300 hover:bg-base-50 text-base-700 py-2 px-4 rounded-md font-medium">
          <i className="fas fa-download mr-2"><img src="../../download.png" width={25} alt="" /></i> Télécharger PDF
        </button>
        <button onClick={() => printOrder(order.id)} className="border border-base-300 hover:bg-base-50 text-base-700 py-2 px-4 rounded-md font-medium flex">
          <i className="fas fa-print mr-2"><img src="../../printing.png" alt="" width={25}/></i> Imprimer
        </button>
        
      </div>

      <div className="mt-6 text-center">
        <button onClick={retourCatalogue} className="text-blue-600  flex mx-auto hover:text-blue-800">
          <i className="fas fa-arrow-left mr-2"><img src="../../arrow.png" alt="" width={25}/></i> Retour au catalogue
        </button>
      </div>
    </div>
  );
};

export default ConfirmationCommande;
