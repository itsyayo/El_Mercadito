import React, { type FC } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; 

// --- Componentes Globales ---
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute'; // Para restringir el acceso

// --- Páginas de Autenticación y Catálogo ---
import CatalogPage from './pages/CatalogPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProductDetail from './pages/ProductDetailPage'; 

// --- Páginas de Cuenta y Vendedor/Admin ---
import UserAccountPage from './pages/UserAccountPage'; // Perfil y Historial de compras
import BecomeSellerPage from './pages/seller/BecomeSellerPage'; // Solicitud de Vendedor
import ProductCreatePage from './pages/seller/ProductCreatePage'; // Creación de Productos
import VendorAdminDashboard from './pages/admin/VendorAdminDashboard'; // Dashboard de Administración

// --- Páginas de Checkout ---
import CheckoutPage from './pages/checkout/CheckoutPage';


/**
 * Componente Wrapper que maneja la redirección de la ruta principal (/).
 * Si el usuario está autenticado, lo envía al catálogo. Si no, lo deja en el Login.
 */
const HomeRedirect: FC = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="flex justify-center items-center h-screen text-lg">Cargando sesión...</div>; 
    }
    
    // Si está autenticado, redirigir al catálogo
    if (isAuthenticated) {
        return <Navigate to="/catalog" replace />;
    }
    
    // Si NO está autenticado, mostrar la página de Login
    return <LoginPage />;
}

const App: FC = () => {
  return (
    // El BrowserRouter envuelve todo para habilitar el ruteo
    <BrowserRouter> 
      {/* Colocar la Navbar fuera de Routes para que se muestre en todas las rutas */}
      <Navbar />
      <main className="content-area min-h-[calc(100vh-64px)]"> {/* Asegura que el contenido ocupe el resto de la pantalla */}
        <Routes>
          
          {/* -------------------- 1. RUTAS PÚBLICAS Y DE AUTENTICACIÓN -------------------- */}
          {/* RUTA PRINCIPAL: '/' -> decide si va a Login o a Catálogo */}
          <Route path="/" element={<HomeRedirect />} /> 
          
          {/* Autenticación */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} /> 
          
          {/* Catálogo y Detalles (Lectura pública) */}
          <Route path="/catalog" element={<CatalogPage />} /> 
          <Route path="/products/:id" element={<ProductDetail />} />
          
          {/* Solicitud de Vendedor (Visible para todos, pero requiere autenticación) */}
          <Route path="/become-seller" element={
              <ProtectedRoute>
                  <BecomeSellerPage />
              </ProtectedRoute>
          } />

          {/* -------------------- 2. RUTAS PROTEGIDAS (REQUIEREN LOGIN) -------------------- */}
          
          {/* Checkout (Requiere Login para pagar) */}
          <Route path="/checkout" element={
              <ProtectedRoute>
                  <CheckoutPage />
              </ProtectedRoute>
          } />
          
          {/* Cuenta de Usuario */}
          <Route path="/account" element={
              <ProtectedRoute>
                  <UserAccountPage />
              </ProtectedRoute>
          } />
          
          {/* -------------------- 3. RUTAS PROTEGIDAS (REQUIEREN ROL) -------------------- */}

          {/* Dashboard de Vendedor/Admin */}
          <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['SELLER', 'ADMIN']}>
                  <VendorAdminDashboard />
              </ProtectedRoute>
          } />

          {/* Creación de Productos (Vendedor/Admin) */}
          <Route path="/products/new" element={
              <ProtectedRoute allowedRoles={['SELLER', 'ADMIN']}>
                  <ProductCreatePage />
              </ProtectedRoute>
          } />


          {/* -------------------- 4. RUTA DE FALLBACK (404) -------------------- */}
          <Route path="*" element={<div className="text-center mt-20 text-4xl font-bold text-gray-700">404 | Página no encontrada</div>} />

        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;