import React from "react";
import { useNavigate } from "react-router-dom";
import { usePanier } from "../PanierContext";

export default function LogOut(){
    const {viderPanier} = usePanier();
    const navigate = useNavigate();
    const handleLogout = () => {
        const confirmLogout = window.confirm("Voulez-vous vraiment vous déconnecter ?");
        if (confirmLogout) {
          viderPanier();
         localStorage.removeItem('panier'); // Supprime le token
          localStorage.removeItem('token'); // Supprime le token
          navigate('/'); // Redirige vers la page de connexion
        }
      };
    return(
<button  onClick={handleLogout}>
                    Déconnexion
                    </button>
    );
}