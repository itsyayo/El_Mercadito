import React, { useState, type FC } from 'react';
import api from '../services/api'; 
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Phone } from 'lucide-react'; // Íconos de Figma Maker
// const logoImage = '/assets/images.png'; // Comentado por si la ruta no existe

// No necesitamos esta interfaz ya que no pasamos props de navegación
// interface RegisterPageProps { ... }

const RegisterPage: FC = () => {
  // Estado para los campos adicionales del formulario (aunque no se envían al API de registro)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(''); 
  
  // Campos requeridos por el backend
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth(); // Función para iniciar la sesión tras el registro

  const handleNavigateToLogin = () => navigate('/login');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      // 1. Llamada al endpoint: POST /auth/register
      // Nota: Solo enviamos email y password, tal como lo requiere el Backend de Spring.
      const response = await api.post('/auth/register', {
        email: email, 
        password: password,
      });

      const { token } = response.data;
      
      // 2. Iniciar sesión automáticamente
      login(token); 
      
      console.log('¡Registro exitoso! Sesión iniciada.');

      // 3. Redirigir al usuario
      navigate('/catalog'); 

    } catch (err) {
      let errorMessage = 'Error al registrar el usuario. Intenta de nuevo.';
      if (axios.isAxiosError(err) && err.response) {
        // Manejar el error de "Email already in use" del backend
         if (err.response.status === 409 || (err.response.data as any)?.message?.includes("Email already in use")) {
            errorMessage = "El correo electrónico ya está registrado.";
         } else if (err.response.data && (err.response.data as any).message) {
            errorMessage = (err.response.data as any).message;
         }
      }
      setError(errorMessage);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          
          {/* Logo y título */}
          <div className="text-center mb-8">
             <div className="flex justify-center mb-6">
                <div className="bg-orange-500 rounded-full p-8">
                </div>
              </div>
            <h1 className="text-orange-500 text-3xl font-bold mb-2">El Mercadito</h1>
            <h2 className="text-gray-700 text-xl mb-2">Crear Cuenta</h2>
            <p className="text-gray-600">
              Campos obligatorios marcados con <span className="text-red-500">*</span>
            </p>
          </div>
          
          {/* Mensaje de Error */}
          {error && (
              <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg text-center" role="alert">
                  {error}
              </div>
          )}


          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Campo de Nombre (Conservamos para la interfaz, pero no se envía a /auth/register) */}
            <div>
              <label htmlFor="name" className="block text-gray-700 mb-2">
                Nombre Completo <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="Tu nombre completo"
                  value={name} // CONEXIÓN DE ESTADO
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={loading}
                />
              </div>
            </div>
            
            {/* Campo de Teléfono (Conservamos para la interfaz, pero no se envía a /auth/register) */}
            <div>
              <label htmlFor="phone" className="block text-gray-700 mb-2">
                Teléfono <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  placeholder="+52 123 456 7890"
                  value={phone} // CONEXIÓN DE ESTADO
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={loading}
                />
              </div>
            </div>


            {/* Campo de Correo */}
            <div>
              <label htmlFor="email" className="block text-gray-700 mb-2">
                Correo Electrónico <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="correo@ejemplo.com"
                  value={email} // CONEXIÓN DE ESTADO
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Campo de Contraseña */}
            <div>
              <label htmlFor="password" className="block text-gray-700 mb-2">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  value={password} // CONEXIÓN DE ESTADO
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Campo de Confirmar Contraseña */}
            <div>
              <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">
                Confirmar Contraseña <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  placeholder="••••••••"
                  value={confirmPassword} // CONEXIÓN DE ESTADO
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Botón de Registrarse */}
            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>

          {/* Enlace a Login */}
          <div className="mt-6 text-center">
            <span className="text-gray-600">¿Ya tienes una cuenta? </span>
            <button
              type="button"
              onClick={handleNavigateToLogin}
              className="text-orange-500 hover:underline"
              disabled={loading}
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;