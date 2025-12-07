import React, {useState, type FC} from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react'; // Iconos de Figma Maker
import api from '../services/api'; // Cliente Axios conectado al Backend
import axios from 'axios'; // Para manejo de errores de Axios
import { useAuth } from '../context/AuthContext'; // Para iniciar la sesión global

//const logoImage = '/assets/images.png'; 

const LoginPage: FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();
    const { login } = useAuth(); // Importación clave: obtenemos la función login del contexto

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try{
            // 1. Reemplazamos mockLogin con la llamada real al Backend: POST /auth/login
            const response = await api.post('/auth/login', {
                // Las claves deben coincidir con el DTO LoginRequest de Spring
                username: email, 
                password: password,
            });

            const { token } = response.data; // El Backend devuelve { token: "..." }
            
            // 2. Usamos la función de contexto para guardar el token y verificar la sesión
            login(token);

            // 3. Redirigir al usuario (HomeRedirect en App.tsx se encargará de enviarlo a /catalog)
            navigate('/', {replace: true});

        } catch (err: unknown){
            let errorMessage = "Error al iniciar sesión. Inténtalo de nuevo.";
            
            if (axios.isAxiosError(err) && err.response) {
                // Manejo de errores 401 (Unauthorized) o 403 (Forbidden)
                if (err.response.status === 401 || err.response.status === 403) {
                    errorMessage = "Credenciales inválidas o cuenta inactiva.";
                } else if (err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
                    // Si el backend envía un mensaje de error específico
                    errorMessage = (err.response.data as { message: string }).message;
                }
            }
            
            setError(errorMessage);

        } finally {
            setIsLoading(false);
        }
    };

    // Handlers para la navegación de la interfaz de Figma
    const handleNavigateToRegister = () => navigate('/register');
    const handleNavigateToForgotPassword = () => navigate('/forgot-password');


    return(
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          
          {/* Logo y título (BLOQUE CORREGIDO) */}
          <div className="text-center mb-8">
             <div className="flex justify-center mb-6">
                <div className="bg-orange-500 rounded-full p-4">
                </div>
              </div>
            <h1 className="text-orange-500 text-3xl font-bold mb-2">El Mercadito</h1>
            <h2 className="text-gray-700 text-xl">Iniciar Sesión</h2>
          </div>
          
          {/* Mensaje de Error */}
          {error && (
              <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg text-center" role="alert">
                  {error}
              </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Campo de Correo */}
            <div>
              <label htmlFor="email" className="block text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                {/* Ícono de Lucide */}
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" /> 
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="correo@ejemplo.com"
                  // CONEXIÓN DE ESTADO
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Campo de Contraseña */}
            <div>
              <label htmlFor="password" className="block text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                {/* Ícono de Lucide */}
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  // CONEXIÓN DE ESTADO
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Enlace Recuperar Contraseña */}
            <div className="text-right">
              {/* CORRECCIÓN: Usamos el handler de navegación local */}
              <button
                type="button"
                onClick={handleNavigateToForgotPassword}
                className="text-orange-500 hover:underline"
                disabled={isLoading}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Botón de Iniciar Sesión */}
            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Enlace a Registro */}
          <div className="mt-6 text-center">
            <span className="text-gray-600">¿No tienes una cuenta? </span>
            {/* CORRECCIÓN: Usamos el handler de navegación local */}
            <button
              type="button"
              onClick={handleNavigateToRegister}
              className="text-orange-500 hover:underline"
              disabled={isLoading}
            >
              Registrarse
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;