import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Provider, useSelector } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { store } from './store/store'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import CaissePage from './pages/CaissePage'
import ProduitsPage from './pages/ProduitsPage'
import SocialMediaPage from './pages/SocialMediaPage'
import WebsitePage from './pages/WebsitePage'
import OrdersPage from './pages/OrdersPage'
import PublicHomePage from './pages/PublicHomePage'
import { CategoriesPage, StockPage, CustomersPage, SuppliersPage } from './pages/OtherPages'
import { VentesPage, RapportsPage, ParametresPage } from './pages/SalesAndMore'

function AppRoutes() {
  const token = useSelector((s) => s.auth.token)

  return (
    <BrowserRouter>
      <Routes>
        {/* 🌐 Route d'accueil - redirection intelligente */}
        <Route path="/" element={token ? <Navigate to="/admin" replace /> : <PublicHomePage />} />
        
        {/* 🌐 Routes Publiques (sans authentification) */}
        <Route path="/shop" element={<WebsitePage />} />
        <Route path="/login" element={token ? <Navigate to="/admin" replace /> : <LoginPage />} />
        
        {/* 🔐 Routes Admin (avec authentification) */}
        <Route
          path="/admin"
          element={token ? <Layout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<DashboardPage />} />
          <Route path="caisse" element={<CaissePage />} />
          <Route path="produits" element={<ProduitsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="stock" element={<StockPage />} />
          <Route path="clients" element={<CustomersPage />} />
          <Route path="fournisseurs" element={<SuppliersPage />} />
          <Route path="ventes" element={<VentesPage />} />
          <Route path="rapports" element={<RapportsPage />} />
          <Route path="commandes" element={<OrdersPage />} />
          <Route path="parametres" element={<ParametresPage />} />
          <Route path="reseaux-sociaux" element={<SocialMediaPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: '10px', fontSize: '14px' },
        }}
      />
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  )
}

// Public Website Routes
export function PublicWebsiteApp() {
  return (
    <div>
      <WebsitePage />
      <Toaster position="top-right" />
    </div>
  )
}
