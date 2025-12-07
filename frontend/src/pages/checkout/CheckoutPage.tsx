import React, { useState, type FC, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import axios from 'axios';
import { AlertTriangle, ShoppingCart } from 'lucide-react';

// --- Importaciones de Componentes de Pasos ---
// CORRECCIÓN 1: Aseguramos el nombre correcto del archivo de Recolección
import RecoleccionSelectionPage from './RecolectSelectionPage'; 
import PaymentSelectionPage from './PaymentSelectionPage';     // Paso 2
// CORRECCIÓN 2: Importamos CheckoutRevision desde su archivo correcto
import CheckoutRevision from './CheckoutRevision';             // Paso 3
// Asegúrate de crear este componente sidebar:
import CheckoutSidebar from '../../components/checkout/CheckoutSidebar';


// --- Tipos de Datos (Deben coincidir con los DTOs de los pasos) ---
type CheckoutStep = 1 | 2 | 3;

interface Location { id: number; name: string; description: string; }
interface PaymentMethod { id: string; label: string; type: string; }
interface Product { id: number; name: string; price: number; }
interface CartItem { product: Product; quantity: number; }

// --- MOCK de Carrito (Para que la revisión tenga datos) ---
const mockCartItemsInitial: CartItem[] = [
    { product: { id: 101, name: "Laptop HP Pavilion", price: 12000.50 }, quantity: 1 },
    { product: { id: 102, name: "Mouse Inalámbrico", price: 250.00 }, quantity: 2 },
    { product: { id: 103, name: "Café de Especialidad", price: 150.00 }, quantity: 3 },
];

const CheckoutPage: FC = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);
    
    // Estados para almacenar la selección de los pasos
    const [selectedLocation, setSelectedLocation] = useState<Location | undefined>(undefined);
    const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | undefined>(undefined);
    const [currentCart, setCurrentCart] = useState<CartItem[]>(mockCartItemsInitial);
    
    const [isProcessingOrder, setIsProcessingOrder] = useState(false);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);

    // MOCK para obtener los objetos completos por ID (necesario para el paso de revisión)
    const mockFindLocationById = (id: number): Location => ({ id, name: "Salón Seleccionado", description: "Descripción detallada del lugar." });
    const mockFindPaymentById = (id: string): PaymentMethod => {
        if (id === 'CARD') return { id: 'CARD', label: "Tarjeta de Crédito / Débito", type: "CREDIT_CARD" };
        if (id === 'TRANSFER') return { id: 'TRANSFER', label: "Transferencia Bancaria", type: "BANK_TRANSFER" };
        return { id: 'CASH', label: "Efectivo (Pago Contra Entrega)", type: "CASH_ON_DELIVERY" };
    };


    // --- LÓGICA DE NAVEGACIÓN ---
    
    // Avanza un paso y guarda la selección (Lugar o Pago)
    const handleContinue = (data: any, nextStep: CheckoutStep) => {
        if (currentStep === 1) {
            // Guardar ubicación (data es el ID)
            setSelectedLocation(mockFindLocationById(data));
        } else if (currentStep === 2) {
            // Guardar pago (data es el ID)
            setSelectedPayment(mockFindPaymentById(data));
        }
        setCheckoutError(null);
        setCurrentStep(nextStep);
    };

    // Vuelve al paso anterior
    const handleBack = (prevStep: CheckoutStep) => {
        setCheckoutError(null);
        setCurrentStep(prevStep);
    };
    
    // --- LÓGICA DE CONFIRMACIÓN DE ORDEN (API) ---
    const handleConfirmOrder = async (locationId: number, paymentId: string) => {
        if (isProcessingOrder || !selectedLocation || !selectedPayment) return;
        setIsProcessingOrder(true);
        setCheckoutError(null);

        try {
            // Endpoint real para crear la orden: POST /orders (ASUMIDO)
            const orderPayload = {
                locationId: locationId,
                paymentMethodId: paymentId,
                // Items del carrito se gestionan usualmente por el backend basado en la sesión
            };
            
            // Reemplazar con la llamada a tu API de Spring
            // const response = await api.post('/orders', orderPayload);
            
            // SIMULACIÓN DE ÉXITO: 
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log("Orden confirmada con éxito. ID de la orden: MOCK-123");

            // Después del éxito, vaciamos el carrito (para que el CheckoutRevisionPage muestre el modal)
            setCurrentCart([]); 
            
        } catch (err) {
            let errorMessage = 'Error al procesar el pedido. Intenta de nuevo.';
            if (axios.isAxiosError(err) && err.response && err.response.data && (err.response.data as any).message) {
                 errorMessage = (err.response.data as any).message;
            }
            setCheckoutError(errorMessage);
        } finally {
            setIsProcessingOrder(false);
        }
    };
    
    // Si el carrito está vacío al llegar a esta página, redirigir
    if (currentCart.length === 0 && !isProcessingOrder) {
        // Si el carrito está vacío DESPUÉS de una compra exitosa o si nunca hubo items
        if (currentStep !== 3) {
            return (
                <div className="text-center mt-20 p-8 bg-white rounded-lg shadow-lg max-w-lg mx-auto">
                    <ShoppingCart className="size-12 text-orange-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Tu carrito está vacío.</h2>
                    <p className="text-gray-600">
                        Añade productos para comenzar el proceso de compra.
                    </p>
                    <button 
                        onClick={() => navigate('/catalog')}
                        className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                        Ir al Catálogo
                    </button>
                </div>
            );
        }
    }


    // --- Renderizado del Paso Actual ---
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return <RecoleccionSelectionPage 
                            onContinue={(id) => handleContinue(id, 2)} 
                        />;
            case 2:
                return <PaymentSelectionPage 
                            onContinue={(id) => handleContinue(id, 3)} 
                            onBack={() => handleBack(1)} 
                        />;
            case 3:
                if (!selectedLocation || !selectedPayment) {
                    // Evitar que el usuario salte a la revisión sin datos
                    return <div className="text-center mt-20 text-red-600">Falta información de Recolección o Pago. Vuelve al paso 1.</div>
                }
                return <CheckoutRevision 
                            location={selectedLocation}
                            paymentMethod={selectedPayment}
                            cartItems={currentCart}
                            onConfirmOrder={handleConfirmOrder}
                            onBack={() => handleBack(2)}
                            isProcessing={isProcessingOrder}
                        />;
            default:
                return <div className="text-center mt-20 text-red-600">Paso no válido</div>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Columna Izquierda: Sidebar de Pasos */}
                <div className="lg:col-span-1">
                    {/* El CheckoutSidebar necesita ser creado, pero aquí iría su uso: */}
                    <div className="bg-white rounded-lg shadow-lg p-6 sticky top-20">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Proceso de Compra</h2>
                        <CheckoutSidebar currentStep={currentStep} />
                    </div>
                </div>

                {/* Columna Derecha: Contenido del Paso */}
                <div className="lg:col-span-2">
                    {checkoutError && (
                        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg flex items-center gap-2" role="alert">
                            <AlertTriangle className="size-4 flex-shrink-0" />
                            {checkoutError}
                        </div>
                    )}
                    {renderStepContent()}
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;