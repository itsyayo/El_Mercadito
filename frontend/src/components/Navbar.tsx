import React, { type FC } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Usamos Link y useNavigate
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, User, LogOut, Store } from 'lucide-react'; // Iconos requeridos

// Nota: Eliminamos la interfaz NavbarProps ya que usamos hooks en su lugar.

const Navbar: FC = () => {
  const navigate = useNavigate();
  // user contiene { username, roles }
  const { isAuthenticated, user, logout, hasRole } = useAuth(); 
  
  // Hardcodeamos la cuenta del carrito por ahora (funcionalidad futura)
  const cartItemCount = 3; 
  
  // Handler para cerrar la sesión
  const handleLogout = () => {
    logout();
    navigate('/', { replace: true }); // Redirigir a la raíz tras el logout (donde está Login/HomeRedirect)
  };

  // Handler para la opción de Vender
  const handleNavigateToSell = () => {
      // Navegar a la página de subida de productos
      navigate('/products/new');
  };

  return (
    <nav className="bg-orange-500 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo y Enlace a Home/Catálogo */}
          <Link to={isAuthenticated ? "/catalog" : "/"} className="flex items-center">
            <h1 className="text-xl font-bold hover:text-gray-200 transition-colors">
              🛒 El Mercadito
            </h1>
          </Link>

          {/* Navegación y Acciones */}
          <div className="flex items-center gap-4">
            
            {/* 1. Botón Vender (Solo visible si es CLIENT o no tiene rol de vendedor) */}
            {isAuthenticated && !hasRole('SELLER') && (
              <button
                onClick={handleNavigateToSell}
                className="flex items-center gap-2 px-3 py-1 bg-white text-orange-500 rounded-full font-medium hover:bg-gray-100 transition-colors"
              >
                <Store className="size-5" />
                <span>Vender</span>
              </button>
            )}

            {/* 2. Carrito (Visible para todos los autenticados) */}
            {isAuthenticated && (
                <button
                  onClick={() => navigate('/cart')} // Ruta futura para el carrito
                  className="relative p-2 hover:bg-orange-600 rounded-lg transition-colors"
                >
                  <ShoppingCart className="size-6" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full size-5 flex items-center justify-center font-bold">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </span>
                  )}
                </button>
            )}


            {/* 3. Opciones de Autenticación */}
            {!isAuthenticated ? (
              // Opciones si el usuario NO está logueado
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 hover:bg-orange-600 rounded-lg transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-white text-orange-500 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Registrarse
                </Link>
              </>
            ) : (
              // Opciones si el usuario SÍ está logueado
              <>
                {/* Perfil del Usuario */}
                <button
                  onClick={() => navigate('/account')} // Ruta futura para la cuenta
                  className="flex items-center gap-2 px-4 py-2 hover:bg-orange-600 rounded-lg transition-colors"
                >
                  <User className="size-5" />
                  {/* Mostrar solo el nombre de usuario (parte antes del @) */}
                  <span>{user?.username.split('@')[0]}</span> 
                </button>
                
                {/* Cerrar Sesión */}
                <button
                  onClick={handleLogout} // Llamamos a la función local que usa logout() del contexto
                  className="flex items-center gap-2 px-4 py-2 hover:bg-orange-600 rounded-lg transition-colors"
                >
                  <LogOut className="size-5" />
                  <span>Salir</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;