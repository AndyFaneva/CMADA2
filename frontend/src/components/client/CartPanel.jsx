import React from 'react';
import { useNavigate } from 'react-router-dom';

const CartPanel = ({ cartItems, total, handleIncrease, handleDecrease, handleDeleteProduct }) => {
  const handlePasserCommande = () => {
  if (total === 0) {
    alert("Votre panier est vide.");
    return;
  }else{
navigate('../../client/commande/ajoutercommande')
  }

  // Sinon, continuer la commande
  console.log("Commande en cours...");
  // redirection, envoi API, etc.
};
  const navigate = useNavigate();
  return (
    <div className="lg:w-1/4">
      <div className="max-w-4xl mx-auto bg-base-100 rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-base-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-base-800">Votre Panier</h2>
          </div>
        </div>

        {/* Cart Items */}
        <div id="cart-items" className="p-6">
          {cartItems.length === 0 ? (
            <p className="text-gray-500 py-4">Votre panier est vide</p>
          ) : (
            <ul className="space-y-4">
              {cartItems.map((item, index) => (
                <li key={index} className="flex items-center">
                  <div className='ml-4 flex-1'>
                    <div className="flex justify-between">
                      <span className="text-base font-semibold">{item.nom}</span>
                      <span className="text-base font-bold">
                        {(item.prix * item.quantity).toFixed(2)}€
                      </span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <div className='flex items-center'>
                        <button
                          onClick={() => handleDecrease(index)}
                          className='text-gray-500 hover:text-gray-700 px-1'
                        >
                          -
                        </button>
                        <span className='mx-2 text-base-800'>{item.quantity}</span>
                        <button
                          onClick={() => handleIncrease(index)}
                          className='text-gray-500 hover:text-gray-700 px-1'
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteProduct(index)}
                    className="text-red-600 hover:text-red-900 mr-2 ml-10"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 
                          0a1 1 0 00-1 1v1h6V4a1 1 0 00-1-1m-4 0h4"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-base-50">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-base-600">Total:</span>
              <span id="cart-total" className="ml-2 text-xl font-bold text-base-800 mr-5">
                {total.toFixed(2)}€
              </span>
            </div>
            <button
            onClick={()=> handlePasserCommande()}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium px-4 py-2 transition-colors"
            >
              Passer la commande
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPanel;
