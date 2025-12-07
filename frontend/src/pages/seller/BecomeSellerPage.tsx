import React, { useState, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, CheckCircle, ArrowRight, AlertTriangle } from 'lucide-react';
import api from '../../services/api'; // Cliente Axios
import axios from 'axios';

// Nota: Eliminamos la interfaz BecomeSellerPageProps ya que usamos hooks.

const BecomeSellerPage: FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Endpoint simulado para solicitar el cambio de rol
  const REQUEST_SELLER_ENDPOINT = '/auth/request-seller-role'; 

  const handleSubmitRequest = async () => {
    setError(null);
    setLoading(true);

    try {
        // Asumimos que el backend de Spring tiene un endpoint que recibe el JWT
        // y registra la solicitud de cambio de rol para el usuario autenticado.
        const response = await api.post(REQUEST_SELLER_ENDPOINT);

        if (response.status === 200 || response.status === 201) {
            setSuccess(true);
        } else {
             // Manejo genérico si el backend devuelve un código 2xx inesperado
            setError('Solicitud enviada, pero se recibió una respuesta inusual.');
        }

    } catch (err: unknown) {
        let errorMessage = 'Error al enviar la solicitud.';
        if (axios.isAxiosError(err) && err.response) {
            if (err.response.status === 409) {
                 errorMessage = 'Ya tienes una solicitud pendiente o el rol de vendedor.';
            } else if (err.response.status === 401) {
                 errorMessage = 'Debes iniciar sesión para enviar una solicitud.';
            }
             
        }
        setError(errorMessage);
    } finally {
        setLoading(false);
    }
  };
  
  const handleCancel = () => {
      // Volver a la página principal/catálogo
      navigate('/catalog');
  };
  
  // Si la solicitud fue exitosa, mostramos un mensaje diferente
  if (success) {
      return (
          <div className="text-center mt-20 p-8 bg-white rounded-lg shadow-lg max-w-lg mx-auto">
              <CheckCircle className="size-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">¡Solicitud Enviada con Éxito!</h2>
              <p className="text-gray-600">
                  Tu solicitud para convertirte en vendedor ha sido enviada. El equipo de administración te contactará tras la revisión.
              </p>
              <button 
                  onClick={handleCancel}
                  className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                  Volver al Catálogo
              </button>
          </div>
      );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center size-20 bg-orange-100 rounded-full mb-4">
              <Store className="size-10 text-orange-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Conviértete en Vendedor</h1>
            <p className="text-gray-600">
              Comienza a vender tus productos en El Mercadito
            </p>
          </div>
          
          {/* Mensaje de Error */}
          {error && (
              <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg flex items-center gap-2" role="alert">
                  <AlertTriangle className="size-4 flex-shrink-0" />
                  {error}
              </div>
          )}

          {/* Beneficios */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Beneficios de ser vendedor</h2>
            <div className="space-y-3">
              {[
                'Publica productos ilimitados',
                'Gestiona tu inventario fácilmente',
                'Recibe pagos de forma segura',
                'Accede a estadísticas de ventas',
                'Conecta con compradores de tu universidad',
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="size-5 text-orange-500 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Proceso */}
          <div className="bg-orange-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">¿Cómo funciona?</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex items-center justify-center size-8 bg-orange-500 text-white rounded-full flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="text-gray-700 font-medium">
                    Envía tu solicitud para convertirte en vendedor (Presiona el botón abajo).
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center justify-center size-8 bg-orange-500 text-white rounded-full flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="text-gray-700">
                    El equipo de administración revisará tu solicitud.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center justify-center size-8 bg-orange-500 text-white rounded-full flex-shrink-0">
                  3
                </div >
                <div>
                  <p className="text-gray-700">
                    Una vez aprobado, podrás comenzar a vender inmediatamente.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-4">
            <button
              onClick={handleCancel} // Usa el handler de navegación local
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              Volver
            </button>
            <button
              onClick={handleSubmitRequest} // Conectado a la función de la API
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 font-bold"
              disabled={loading}
            >
              {loading ? 'Enviando Solicitud...' : 'Solicitar ser vendedor'}
              <ArrowRight className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeSellerPage;