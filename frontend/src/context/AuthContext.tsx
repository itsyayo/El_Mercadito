import React, { createContext, useState, useContext, useEffect } from 'react';
import { type ReactNode, type FC } from 'react'; // <-- NUEVA FORMA
import api from '../services/api';

// --- 1. Definición de Tipos ---

// Estructura de la respuesta del endpoint /auth/me
interface UserInfo {
  username: string;
  roles: string[]; // Ej: ["ROLE_CLIENT", "ROLE_SELLER"]
}

// Estructura del Contexto
interface AuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  // Función para verificar si el usuario tiene un rol específico
  hasRole: (roleName: 'CLIENT' | 'SELLER' | 'ADMIN') => boolean; 
}

// Valores iniciales (un usuario no autenticado)
const initialAuthContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  loading: true,
  login: () => {},
  logout: () => {},
  hasRole: () => false,
};

// --- 2. Creación del Contexto ---

const AuthContext = createContext<AuthContextType>(initialAuthContext);

// Hook personalizado para usar el contexto fácilmente
export const useAuth = () => useContext(AuthContext);

// --- 3. Proveedor del Contexto ---

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Verifica la autenticación al cargar el componente
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Llama al endpoint /auth/me para validar el token y obtener datos del usuario
  const checkAuthStatus = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // Endpoint: GET /auth/me (debe incluir el token en el header via api.ts)
      const response = await api.get<UserInfo>('/auth/me'); 
      
      // El backend devuelve { username: '...', roles: [...] }
      if (response.data.username) {
        setUser(response.data);
      } else {
        // Token inválido o expirado
        localStorage.removeItem('authToken');
        setUser(null);
      }
    } catch (error) {
      // Error de red, 401 Unauthorized, etc.
      localStorage.removeItem('authToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Función de Login (llama esto DESPUÉS de un login/register exitoso)
  const login = (token: string) => {
    localStorage.setItem('authToken', token);
    // Vuelve a llamar a checkAuthStatus para obtener los datos del usuario
    checkAuthStatus(); 
  };

  // Función de Logout
  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    // Aquí puedes redirigir al usuario a la página de login
  };
  
  // Función para verificar roles
  const hasRole = (roleName: 'CLIENT' | 'SELLER' | 'ADMIN'): boolean => {
    if (!user) return false;
    // Spring Security añade el prefijo 'ROLE_', así que lo buscamos así
    const requiredRole = `ROLE_${roleName}`; 
    return user.roles.includes(requiredRole);
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    hasRole,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};