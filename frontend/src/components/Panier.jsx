import React from 'react';
import { usePanier } from './PanierContext';
import { ShoppingCart } from 'lucide-react';

const Panier = () => {
  const { panier } = usePanier();

  return (
    <div className="relative">
      <ShoppingCart className="text-base-500 w-6 h-6" />
      {panier.length > 0 && (
        <span className="absolute -top-0 -right-0 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center transform translate-x-1/2 -translate-y-1/2">
          {panier.length}
        </span>
      )}
    </div>
  );
};

export default Panier;
