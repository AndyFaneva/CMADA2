import React, { createContext, useContext, useReducer, useEffect } from 'react';

const PanierContext = createContext();

const panierReducer = (state, action) => {
  switch (action.type) {
    case 'AJOUTER':
      return { ...state, panier: [...state.panier, action.ref] };
      case 'DIMINUER':
      const refToDecrease = action.ref;
      const panierCopy = [...state.panier];
      
      // Trouve le dernier index de la référence dans le panier
      const lastIndex = panierCopy.lastIndexOf(refToDecrease);
      
      if (lastIndex !== -1) {
        // Supprime seulement la dernière occurrence
        panierCopy.splice(lastIndex, 1);
        return { ...state, panier: panierCopy };
      }
      return state; 
       case 'UPDATE_PANIER':
      return {
        ...state,
        panierItems: action.items,
        total: action.total
      };
    case 'RETIRER':
      return { ...state, panier: state.panier.filter(ref => ref !== action.ref) };
    case 'VIDER_PANIER':
      return { panier: [], panierItems: [], total: 0 };
    case 'UPDATE_ITEMS':
      return { ...state, panierItems: action.items, total: action.total };
       case 'UPDATE_FROM_LOCALSTORAGE':
      return {
        ...state,
        panier: action.panier || [],
        panierItems: action.items || [],
        total: action.total || 0
      };
    default:
      return state;
  }
};

export const PanierProvider = ({ children }) => {
  let savedPanier = [];
try {
  savedPanier = JSON.parse(localStorage.getItem('panier')) || [];
} catch (e) {
  console.error("Erreur de parsing JSON :", e);
}
  const [state, dispatch] = useReducer(panierReducer, {
   panier: savedPanier,
    panierItems: [],
    total: 0
  });

  // Sauvegarde dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('panier', JSON.stringify(state.panier));
  }, [state.panier]);

const updatePanierItems = (items, total) => {
  dispatch({ type: 'UPDATE_ITEMS', items, total });
};

const updatePanier = (items, total) => {
    dispatch({ type: 'UPDATE_PANIER', items, total });
  };

  const ajouterAuPanier = (ref) => dispatch({ type: 'AJOUTER', ref });
  const diminuerQuantite = (ref) => dispatch({ type: 'DIMINUER', ref });
  const retirerDuPanier = (ref) => dispatch({ type: 'RETIRER', ref });
  const viderPanier = () => {
    dispatch({ type: 'VIDER_PANIER' });
    localStorage.removeItem('panier'); // Supprime explicitement du localStorage
  };

  return (
    <PanierContext.Provider value={{
      panier: state.panier,
      panierItems: state.panierItems,
      total: state.total,
      ajouterAuPanier,
       updatePanier,
      diminuerQuantite,
      retirerDuPanier,
      updatePanierItems,
      viderPanier
    }}>
      {children}
    </PanierContext.Provider>
  );
};

export const usePanier = () => useContext(PanierContext);