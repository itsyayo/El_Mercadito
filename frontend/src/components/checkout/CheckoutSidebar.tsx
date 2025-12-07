import React, { type FC } from 'react';
import { MapPin, CreditCard, Package, CheckCircle } from 'lucide-react';

type CheckoutStep = 1 | 2 | 3;

interface CheckoutSidebarProps {
  currentStep: CheckoutStep;
}

const steps = [
  { id: 1, name: 'Lugar de Recolección', icon: MapPin },
  { id: 2, name: 'Método de Pago', icon: CreditCard },
  { id: 3, name: 'Revisión y Confirmación', icon: Package },
];

const CheckoutSidebar: FC<CheckoutSidebarProps> = ({ currentStep }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Pasos de la Compra</h3>
      
      {steps.map((step) => {
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;
        
        const IconComponent = step.icon;

        return (
          <div key={step.id} className="flex items-center">
            {/* Círculo de Paso */}
            <div
              className={`flex items-center justify-center size-10 rounded-full transition-colors duration-300 ${
                isCompleted
                  ? 'bg-green-500 text-white'
                  : isActive
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {isCompleted ? <CheckCircle className="size-5" /> : step.id}
            </div>

            {/* Línea Divisora (solo si no es el último paso) */}
            {step.id < 3 && (
              <div
                className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
            
            {/* Texto del Paso */}
            <div
              className={`flex-1 ml-4 transition-opacity duration-300 ${
                isActive ? 'font-bold text-gray-900' : 'text-gray-600'
              }`}
            >
              <div className="text-sm">{`Paso ${step.id}`}</div>
              <div className="text-lg">{step.name}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CheckoutSidebar;