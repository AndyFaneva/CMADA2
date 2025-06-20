import React from "react";
import { useNavigate } from "react-router-dom";

export default function Accueil(){
  const navigate = useNavigate();
    return(
    <>
  <div className=" bg-base-200 flex items-center justify-center p-20">
    <div className="text-center max-w-md">
      <h1 className="text-5xl font-bold pt-10">Bienvenue sur C'MADA Pro</h1>
      <div className="flex justify-center items-center my-4">
        <img src="Cmada.png" alt="logo" width={100} />
      </div>
      <p className="py-6">
        Commencez à vous connecter avec votre compte professionnel.
      </p>
      <button className="btn btn-neutral" onClick={() => navigate('/login')}>
        Commencer
      </button>
    </div>
  </div>
</>

    );
}