import React, { useState, useEffect, type FC } from 'react';
import { CreditCard, Building2, Banknote, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- Tipos de Datos ---
type PaymentType = 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CASH_ON_DELIVERY';

interface PaymentMethodDTO {
  id: string;
  type: PaymentType;
  label: string;
}

// --- MOCK de Métodos de Pago (Basado en tus requisitos) ---
const mockPaymentMethods: PaymentMethodDTO[] = [
    { id: 'CARD', type: 'CREDIT_CARD', label: 'Tarjeta de Crédito / Débito' },
    { id: 'TRANSFER', type: 'BANK_TRANSFER', label: 'Transferencia Bancaria' },
    { id: 'CASH', type: 'CASH_ON_DELIVERY', label: 'Efectivo (Pago Contra Entrega)' },
];

// Asumimos que esta página será hija de la ruta /checkout
interface PaymentSelectionPageProps {
  onContinue: (paymentId: string) => void; // Función para pasar al siguiente paso
  onBack: () => void; // Función para volver al paso anterior (Recolección)
}

const PaymentSelectionPage: FC<PaymentSelectionPageProps> = ({ onContinue, onBack }) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDTO[]>([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | undefined>('CARD');
  const [loading, setLoading] = useState(true);

  // --- LÓGICA DE CARGA DE DATOS (MOCK/API) ---
  useEffect(() => {
    // Aquí iría la llamada real a Spring: GET /checkout/available-payments
    // Por ahora, usamos mock data
    setTimeout(() => {
        setPaymentMethods(mockPaymentMethods);
        setLoading(false);
    }, 300);
  }, []);
  
  // --- UTILITY: Ícono ---
  const getPaymentIcon = (type: PaymentType) => {
    switch (type) {
      case 'CREDIT_CARD':
        return <CreditCard className="size-6 text-orange-500" />;
      case 'BANK_TRANSFER':
        return <Building2 className="size-6 text-orange-500" />;
      case 'CASH_ON_DELIVERY':
        return <Banknote className="size-6 text-orange-500" />;
      default:
        return null;
    }
  };

  // --- HANDLERS DE INTERACCIÓN ---
  const handleSelectPayment = (id: string) => {
    setSelectedPaymentId(id);
  };

  const handleContinue = () => {
    if (selectedPaymentId) {
      onContinue(selectedPaymentId);
    }
  };
  
  // --- RENDERIZADO ---
  
  if (loading) return <div className="text-center py-12">Cargando métodos de pago...</div>;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6 border-b pb-4">
        <CreditCard className="size-6 text-orange-500" />
        <h2 className="text-xl font-bold text-gray-900">Elegir Método de Pago</h2>
      </div>

      {/* Lista de métodos de pago */}
      <div className="space-y-4 mb-6">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedPaymentId === method.id
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-300 hover:border-orange-400'
            }`}
            onClick={() => handleSelectPayment(method.id)}
          >
            <div className="flex items-center gap-4">
              <input
                type="radio"
                name="paymentMethod"
                checked={selectedPaymentId === method.id}
                onChange={() => handleSelectPayment(method.id)}
                className="text-orange-500 focus:ring-orange-500"
              />
              
              {getPaymentIcon(method.type)}
              
              <div className="flex-1">
                <p className="text-gray-900 font-medium">{method.label}</p>
                {method.type === 'CASH_ON_DELIVERY' && (
                  <p className="text-gray-500 mt-1 text-sm">
                    Paga cuando recibas tu pedido
                  </p>
                )}
                {method.type === 'BANK_TRANSFER' && (
                  <p className="text-gray-500 mt-1 text-sm">
                    Transferencia electrónica segura
                  </p>
                )}
                {method.type === 'CREDIT_CARD' && (
                  <p className="text-gray-500 mt-1 text-sm">
                    Aceptamos tarjetas Visa, Mastercard, AMEX
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botones de navegación */}
      <div className="flex gap-4 border-t pt-4">
        <button
          onClick={onBack}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
            <ArrowLeft className="size-5" />
          Volver a Recolección
        </button>
        <button
          onClick={handleContinue}
          disabled={!selectedPaymentId}
          className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-bold"
        >
          CONTINUAR CON REVISIÓN
        </button>
      </div>
    </div>
  );
};

export default PaymentSelectionPage;