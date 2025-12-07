import React, { type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, ArrowLeft } from 'lucide-react';
// import logoImage from 'figma:asset/2c31d9a1a4c94507c44d78aa50205653f7742053.png'; // No funciona en proyectos locales

// Cambiamos a FC (Functional Component) para integrarlo con el ruteo
const ForgotPasswordPage: FC = () => {
  const navigate = useNavigate();
    
  // Manejador del formulario (por ahora solo para simular)
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const emailOrPhone = formData.get('emailOrPhone') as string;
    const recoveryMethod = formData.get('recoveryMethod') as string;
    
    // Lógica de prototipo:
    console.log(`Solicitud de recuperación para: ${emailOrPhone} vía ${recoveryMethod}`);
    
    // Aquí iría la lógica del backend (POST /auth/forgot-password)
    
    // Simular un mensaje de éxito:
    alert("Instrucciones de recuperación enviadas. ¡Revisa tu correo/teléfono!"); 
  };
    
  // Función para volver al Login
  const handleBackToLogin = () => {
      navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          
          {/* Logo y título */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
                <div className="bg-orange-500 rounded-full p-8">
                </div>
            </div>
            <h1 className="text-orange-500 text-3xl font-bold mb-2">El Mercadito</h1>
            <h2 className="text-gray-700 text-xl mb-2">Recuperar Contraseña</h2>
            <p className="text-gray-600">
              Ingresa tu correo electrónico o número de teléfono para recuperar tu cuenta
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Método de recuperación */}
            <div>
              <label className="block text-gray-700 mb-3">
                Método de recuperación
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
                  <input
                    type="radio"
                    name="recoveryMethod"
                    value="email"
                    defaultChecked
                    className="text-orange-500 focus:ring-orange-500"
                  />
                  <Mail className="size-5 text-gray-400" />
                  <span className="text-gray-700">Correo electrónico</span>
                </label>
                
                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
                  <input
                    type="radio"
                    name="recoveryMethod"
                    value="phone"
                    className="text-orange-500 focus:ring-orange-500"
                  />
                  <Phone className="size-5 text-gray-400" />
                  <span className="text-gray-700">Número de teléfono</span>
                </label>
              </div>
            </div>

            {/* Campo de entrada */}
            <div>
              <label htmlFor="emailOrPhone" className="block text-gray-700 mb-2">
                Correo electrónico o teléfono
              </label>
              <input
                type="text"
                id="emailOrPhone"
                name="emailOrPhone"
                required
                placeholder="correo@ejemplo.com o +52 123 456 7890"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Botón de enviar */}
            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Enviar instrucciones de recuperación
            </button>
          </form>

          {/* Botón volver */}
          <button
            onClick={handleBackToLogin} // Usamos el handler de navegación
            className="w-full flex items-center justify-center gap-2 mt-4 text-orange-500 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="size-5" />
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;