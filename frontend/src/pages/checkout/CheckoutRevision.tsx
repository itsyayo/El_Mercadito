import React, { useState, type FC } from 'react';
import { useNavigate } from 'react-router-dom'; // Importamos useNavigate
import { Package, MapPin, CreditCard, CheckCircle, Mail, ArrowLeft } from 'lucide-react';
// Asegúrate de que los tipos Address, PaymentMethod y Product existan en ../../types
// Por ahora, usamos las interfaces locales para asegurar la funcionalidad:

interface Product {
  id: number;
  name: string;
  price: number;
}
interface Location {
  id: number;
  name: string;
  description: string; 
}
interface PaymentMethod {
  id: string;
  label: string;
  type: string;
}
interface CartItem { 
    product: Product; 
    quantity: number; 
}

interface CheckoutRevisionProps {
  location: Location;
  paymentMethod: PaymentMethod;
  cartItems: CartItem[];
  
  // Handlers del componente padre
  onConfirmOrder: (locationId: number, paymentId: string) => void;
  onBack: () => void;
  
  // Estado de la orden para deshabilitar el botón
  isProcessing: boolean;
}


// CORRECCIÓN CLAVE: Usamos const y FC, y desestructuramos las props.
const CheckoutRevision: FC<CheckoutRevisionProps> = ({
  location,
  paymentMethod,
  cartItems,
  onConfirmOrder,
  onBack,
  isProcessing
}) => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate(); // Hook para navegar tras el éxito

  // Cálculo del subtotal
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const total = subtotal; 

  const handleConfirm = () => {
    // Llama a la función del padre para iniciar el proceso de la API
    onConfirmOrder(location.id, paymentMethod.id);
  };
  
  // Lógica para mostrar el modal de éxito (después de que el padre termina el procesamiento)
  if (!isProcessing && cartItems.length === 0 && !showSuccessModal) {
      // Si el carrito está vacío (significa que la orden se confirmó y se vació el carrito)
      setTimeout(() => setShowSuccessModal(true), 100); 
  }


  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-3">Revisión Final de Pedido</h2>

        {/* Resumen de productos */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="size-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900">Productos ({cartItems.length} items)</h3>
          </div>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {cartItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">{item.product.name}</p>
                  <p className="text-gray-600 text-sm">
                    Cantidad: {item.quantity}
                  </p>
                </div>
                <p className="text-orange-600 font-medium">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Lugar de recolección */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="size-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900">Lugar de Recolección</h3>
          </div>
          {/* Se usa location.name y location.description para reflejar el DTO de RecoleccionSelectionPage */}
          <p className="text-gray-900 font-medium">{location.name}</p> 
          <p className="text-gray-600 text-sm">
            {location.description}
          </p>
        </div>

        {/* Método de pago */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="size-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900">Método de Pago</h3>
          </div>
          <p className="text-gray-700 font-medium">{paymentMethod.label}</p>
        </div>

        {/* Total */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Subtotal:</span>
            <span className="text-gray-900 font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <span className="text-gray-900 text-xl font-bold">Total a Pagar:</span>
            <span className="text-orange-600 text-xl font-bold">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            disabled={isProcessing}
          >
            <ArrowLeft className="size-5" />
            Volver
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-bold disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={isProcessing}
          >
            {isProcessing ? 'Procesando...' : 'Confirmar Pedido'}
          </button>
        </div>
      </div>

      {/* Modal de éxito (Pop-up) */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 transition-opacity duration-300">
            {/* Icono de éxito */}
            <div className="flex justify-center mb-6">
              <div className="size-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="size-12 text-green-600" />
              </div>
            </div>

            {/* Título */}
            <h2 className="text-center text-2xl font-bold text-gray-900 mb-4">
              ¡Compra Exitosa!
            </h2>

            {/* Mensaje */}
            <div className="text-center mb-6 border-b pb-4">
              <Mail className="size-8 text-orange-500 mx-auto mb-3" />
              <p className="text-gray-600">
                Los datos de tu compra han sido enviados a tu correo electrónico
              </p>
            </div>

            {/* Botón de cerrar */}
            <button
              onClick={() => { setShowSuccessModal(false); navigate('/catalog'); }} // Navegar al catálogo tras cerrar
              className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-bold"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CheckoutRevision; // Usar exportación por defecto