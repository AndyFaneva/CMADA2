import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from 'react'
import './App.css'
import Accueil from './pages/public/accueil'
import DefaultLayout from "./layouts/defaultlayouts";
import AdminDashboard from "./pages/admin/admindashboard";
import AdminLayout from "./layouts/adminlayouts";
import About from "./pages/public/about";
import Product from "./pages/public/product";
import Login from "./components/authentification/Login";
import Signup from "./components/authentification/Signup";
import AdminUser from "./pages/admin/adminuser";
import NotFound from "./components/autres/PageNotFound";
import PrivateRoute from "./routes/PrivateRoute";
import NonAutoriser from "./components/autres/NonAutoriser";
import ClientLayout from "./layouts/clientlayouts";
import FournisseurLayout from "./layouts/fournisseurlayouts";
import ClientDashboard from "./pages/client/clientdashboard";
import FournisseurDashboard from "./pages/fournisseur/fournisseurdashboard";
import AdminProduct from "./pages/admin/adminproduct";
import ProfilUtilisateur from "./components/ProfilUtilisateur";
import AdminRemise from "./pages/admin/adminremise";
import AdminDoc from "./pages/admin/admindoc";
import AdminStock from "./pages/admin/adminstock";
import AdminCommande from "./pages/admin/admincommande";
import CatalogueProduits from "./pages/client/clientcatalogue";
import FournisseurCommande from "./pages/fournisseur/fournisseurcommande";
import FournisseurStock from "./pages/fournisseur/fournisseurstock";
import FournisseurDocument from "./pages/fournisseur/fournisseurdocument";
import FournisseurRemise from "./pages/fournisseur/fournisseurremise";
import FournisseurProduct from "./pages/fournisseur/fournisseurproduit";
import ClientCommande from "./pages/client/clientcommande";
import ClientDocument from "./pages/client/clientdocument";
import ClientRemise from "./pages/client/clientremise";
import DetailProduit from "./components/DetailProduit";
import ClientDetailProduit from "./components/ClientDetailProduit";
import PublicDetailProduit from "./components/PublicDetailProduit";
import PanierProvider from "./components/Panier";
import NouvelleCommande from "./components/commande/nouvellecommande";
import ConfirmationCommande from "./components/commande/confirmationCommande";
import Notifications from "./components/Notification";

function App() {
  return (
      <Routes>
        {/* PUBLIC */}
        <Route element={<DefaultLayout />}>
              <Route path="/" index element={<Accueil />} />
              <Route path="/about" element={<About />} />
              <Route path="/product" element={<Product/>}/>
              <Route path="/login" element={<Login/>}/>
              <Route path="/signup" element={<Signup/>} />
               <Route path="/product/detail/:id" element={<PublicDetailProduit/>} />
            
      </Route>
      {/* ADMIN */}
      <Route  element={<AdminLayout />}>
          <Route path="/admin/dashboard" index element={<PrivateRoute roleAttendu="admin"><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/user" element={<PrivateRoute roleAttendu="admin"><AdminUser/></PrivateRoute>}/>
          <Route path="/admin/product" element={<PrivateRoute roleAttendu="admin"><AdminProduct/></PrivateRoute>}/>
          <Route path="/profil/admin" element={<PrivateRoute roleAttendu="admin"><ProfilUtilisateur/></PrivateRoute>}/>
          <Route path="/admin/doc" element={<PrivateRoute roleAttendu="admin"><AdminDoc/></PrivateRoute>}/>
          <Route path="/admin/remise" element={<PrivateRoute roleAttendu="admin"><AdminRemise/></PrivateRoute>}/>
          <Route path="/admin/stock" element={<PrivateRoute roleAttendu="admin"><AdminStock/></PrivateRoute>}/>
          <Route path="/admin/commande" element={<PrivateRoute roleAttendu="admin"><AdminCommande/></PrivateRoute>}/>
            <Route path="/admin/product/detail/:id" element={<PrivateRoute roleAttendu="admin"><DetailProduit/></PrivateRoute>} />
            <Route path="/admin/notification" element={<PrivateRoute roleAttendu="admin"><Notification/></PrivateRoute>} />
     </Route>
      {/* CLIENT */}
      <Route  element={
        <ClientLayout />
        }>
          <Route path="/client/dashboard" index element={<PrivateRoute roleAttendu="client"><ClientDashboard /></PrivateRoute>} />
          <Route path="/profil/client" element={<PrivateRoute roleAttendu="client"><ProfilUtilisateur/></PrivateRoute>}/>
          <Route path="/client/catalogue" element={<PrivateRoute roleAttendu="client"><CatalogueProduits/></PrivateRoute>}/>
           <Route path="/client/commande" element={<PrivateRoute roleAttendu="client"><ClientCommande/></PrivateRoute>}/>
           <Route path="/client/document" element={<PrivateRoute roleAttendu="client"><ClientDocument/></PrivateRoute>}/>
           <Route path="/client/commande/confirmation" element={<PrivateRoute roleAttendu="client"><ConfirmationCommande/></PrivateRoute>}/>
           <Route path="/client/commande/ajoutercommande" element={<PrivateRoute roleAttendu="client"><NouvelleCommande/></PrivateRoute>}/>
           <Route path="/client/remise" element={<PrivateRoute roleAttendu="client"><ClientRemise/></PrivateRoute>}/>
                       <Route path="/client/product/detail/:id" element={<PrivateRoute roleAttendu="client"><ClientDetailProduit/></PrivateRoute>} />
      </Route>
      {/* FOURNISSEUR */}
      <Route  element={<FournisseurLayout />}>
          <Route path="/fournisseur/dashboard" index element={<PrivateRoute roleAttendu="fournisseur"><FournisseurDashboard /></PrivateRoute>} />
          <Route path="/profil/fournisseur" element={<PrivateRoute roleAttendu="fournisseur"><ProfilUtilisateur/></PrivateRoute>}/>
          <Route path="/fournisseur/commande" element={<PrivateRoute roleAttendu="fournisseur"><FournisseurCommande/></PrivateRoute>}/>
        <Route path="/fournisseur/stock" element={<PrivateRoute roleAttendu="fournisseur"><FournisseurStock/></PrivateRoute>}/>
           <Route path="/fournisseur/document" element={<PrivateRoute roleAttendu="fournisseur"><FournisseurDocument/></PrivateRoute>}/>
           <Route path="/fournisseur/remise" element={<PrivateRoute roleAttendu="fournisseur"><FournisseurRemise/></PrivateRoute>}/>
           <Route path="/fournisseur/product" element={<PrivateRoute roleAttendu="fournisseur"><FournisseurProduct/></PrivateRoute>}/>
      </Route>
      
      <Route path="/nonautoriser" element={<NonAutoriser />}/>
          <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} /> {/* Catch-all */}
      </Routes>
  )
}

export default App;