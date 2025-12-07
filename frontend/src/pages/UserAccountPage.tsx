import React, { useState, useEffect, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Save, Upload, Package, AlertTriangle, Calendar, Mail, Phone, MapPin } from 'lucide-react'; // Añadimos iconos necesarios
import api from '../services/api';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// --- Tipos de Datos (Alineados con el Backend/Mocks) ---
interface UserDetailsDTO {
  id: number;
  name: string;
  email: string; // Usado para login
  phone: string;
  imageUrl?: string;
  role: 'CLIENT' | 'SELLER' | 'ADMIN';
}

// --- TIPOS DETALLADOS DEL HISTORIAL DE PEDIDOS (Basado en OrderHistoryPage.tsx) ---
interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
}

type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

interface Order {
  id: number;
  orderDate: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  deliveryLocation: string;
  seller: {
    name: string;
    email: string;
    phone: string;
  };
}


// --- MOCKS ---
const mockUserDetails: UserDetailsDTO = {
    id: 1,
    name: 'Juan Pérez',
    email: 'juan.perez@uam.mx',
    phone: '55 84552489',
    imageUrl: 'https://placehold.co/100x100/FDBA74/ffffff?text=JP',
    role: 'CLIENT',
};

const mockOrdersHistory: Order[] = [
    { 
        id: 12345, 
        orderDate: new Date().toISOString(), 
        status: 'COMPLETED', 
        items: [
            { productName: "Laptop HP Pavilion", quantity: 1, price: 12000.50 },
            { productName: "Mouse Inalámbrico", quantity: 2, price: 250.00 }
        ],
        total: 12500.50,
        deliveryLocation: "Salón 528, 5to piso, lado poniente",
        seller: { name: "Edgar Morales", email: "edgar@seller.com", phone: "555-1234" }
    },
    { 
        id: 12346, 
        orderDate: new Date(Date.now() - 86400000 * 10).toISOString(), 
        status: 'PENDING', 
        items: [
            { productName: "Café de Especialidad", quantity: 3, price: 150.00 }
        ],
        total: 450.00,
        deliveryLocation: "Entrada Principal, junto a seguridad",
        seller: { name: "Sergio Maximiliano", email: "sergio@seller.com", phone: "555-5678" }
    },
];
// --- FIN MOCKS ---


const UserAccountPage: FC = () => {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated } = useAuth();
  
  // Estado para los datos del formulario
  const [formData, setFormData] = useState<Partial<UserDetailsDTO>>({});
  // USAMOS EL TIPO DETALLADO DE ORDEN
  const [ordersHistory, setOrdersHistory] = useState<Order[]>([]); 
  
  const [activeTab, setActiveTab] = useState<'account' | 'security' | 'history'>('account');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- HANDLERS DE ESTADO DE LA UI ---
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full font-medium">Pendiente</span>;
      case 'COMPLETED':
        return <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium">Completado</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full font-medium">Cancelado</span>;
      default:
        return null;
    }
  };

  // --- CARGA INICIAL DE DATOS Y PERFIL ---
  useEffect(() => {
    if (!isAuthenticated || !authUser) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Asumimos que el backend tiene un endpoint para obtener los detalles del usuario logueado
        // const response = await api.get<UserDetailsDTO>(`/users/me`);
        
        // Usamos mock para inicializar el formulario con los datos de Figma
        const responseData = mockUserDetails;
        
        setFormData(responseData);
        
      } catch (err) {
        setError('Error al cargar la información del perfil.');
      } finally {
        setLoading(false);
      }
    };
    
    const fetchOrderHistory = async () => {
        try {
            // Asumimos GET /orders/me para el historial de compras del usuario autenticado
            // const historyResponse = await api.get<Order[]>(`/orders/me`);
            
            // Usamos mock con la nueva estructura detallada
            setOrdersHistory(mockOrdersHistory);
        } catch (err) {
            console.error("Error al cargar historial:", err);
        }
    };

    fetchUserData();
    fetchOrderHistory();

  }, [isAuthenticated, authUser, navigate]);
  
  // --- HANDLERS DE FORMULARIO ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData({
          ...formData,
          [e.target.name]: e.target.value,
      });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    
    if (!authUser) return;

    try {
        // Enviar solo los campos que cambiaron o son necesarios
        const payload = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
        };

        // Asumimos PUT /users/me para actualizar el perfil
        // const response = await api.put(`/users/${authUser.id}`, payload);
        
        // Simulación de éxito
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        alert('Cambios guardados con éxito!');

    } catch (err) {
        setError('Error al guardar los cambios.');
    } finally {
        setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSaving(true);
    setError(null);

    const data = new FormData();
    data.append('file', file);

    try {
        // Asumimos POST /users/me/photo para subir la foto
        // const response = await api.post('/users/me/photo', data);
        
        // Simulación: Actualizar la URL de la imagen en el estado local
        const mockImageUrl = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, imageUrl: mockImageUrl }));

        alert('Foto de perfil actualizada!');

    } catch (err) {
        setError('Error al subir la foto de perfil.');
    } finally {
        setIsSaving(false);
    }
  };


  if (loading) return <div className="text-center mt-20">Cargando perfil...</div>;
  if (error && !formData.id) return <div className="text-center mt-20 text-red-600">Error fatal: {error}</div>;


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Cuenta</h1>

        {/* Pestañas */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="border-b border-gray-200">
            <div className="flex">
              {/* Pestaña: Mi Cuenta */}
              <button 
                onClick={() => setActiveTab('account')}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors font-medium ${
                  activeTab === 'account' 
                    ? 'border-orange-500 text-orange-500' 
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <User className="size-5" />
                Mi cuenta
              </button>
              
              {/* Pestaña: Seguridad (Prototipo) */}
              <button 
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors font-medium ${
                  activeTab === 'security' 
                    ? 'border-orange-500 text-orange-500' 
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Shield className="size-5" />
                Seguridad
              </button>

              {/* Pestaña: Historial de Compras */}
              <button 
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors font-medium ${
                  activeTab === 'history' 
                    ? 'border-orange-500 text-orange-500' 
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Package className="size-5" />
                Historial de Pedidos
              </button>
            </div>
          </div>

          {/* Contenido de la pestaña */}
          <div className="p-8">
            {error && (
                <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg flex items-center gap-2" role="alert">
                    <AlertTriangle className="size-4 flex-shrink-0" />
                    {error}
                </div>
            )}

            {activeTab === 'account' && (
              <>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Información Personal</h2>

                {/* Foto de perfil */}
                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
                  <div className="size-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {formData.imageUrl ? (
                      <img 
                        src={formData.imageUrl} 
                        alt={formData.name || 'Perfil'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="size-12 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-gray-700 mb-2 font-medium">Foto de perfil</p>
                    <label className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors cursor-pointer ${isSaving ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-600'}`}>
                      <Upload className="size-5" />
                      <span>{isSaving ? 'Subiendo...' : 'Seleccionar archivo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload} // CONECTADO A LA FUNCIÓN DE SUBIDA
                        className="hidden"
                        disabled={isSaving}
                      />
                    </label>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nombre completo */}
                  <div>
                    <label htmlFor="name" className="block text-gray-700 mb-2 font-medium">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name || ''} // CONECTADO
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      disabled={isSaving}
                    />
                  </div>

                  {/* Correo Electrónico */}
                  <div>
                    <label htmlFor="email" className="block text-gray-700 mb-2 font-medium">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email || ''} // CONECTADO
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      disabled={isSaving}
                    />
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label htmlFor="phone" className="block text-gray-700 mb-2 font-medium">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone || ''} // CONECTADO
                      onChange={handleInputChange}
                      placeholder="+52 123 456 7890"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      disabled={isSaving}
                    />
                  </div>

                  {/* Rol (solo lectura) */}
                  <div>
                    <label htmlFor="role" className="block text-gray-700 mb-2 font-medium">
                      Tipo de Cuenta
                    </label>
                    <input
                      type="text"
                      id="role"
                      value={formData.role ? (
                        formData.role === 'CLIENT' ? 'Comprador' : 
                        formData.role === 'SELLER' ? 'Vendedor' : 'Administrador'
                      ) : 'Cargando...'}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 font-medium"
                    />
                  </div>

                  {/* Botón guardar */}
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-bold disabled:opacity-50"
                    disabled={isSaving}
                  >
                    <Save className="size-5" />
                    {isSaving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </form>
              </>
            )}

            {activeTab === 'security' && (
              <>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Seguridad</h2>
                <p className="text-gray-600">Configuración de seguridad próximamente...</p>
              </>
            )}

            {activeTab === 'history' && (
              <>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Historial de Pedidos</h2>
                {ordersHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="size-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No tienes compras realizadas</p>
                    <button onClick={() => navigate('/catalog')} className="mt-4 text-orange-500 hover:underline">
                      Ir al catálogo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {ordersHistory.map((order) => (
                      <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* Header del pedido */}
                        <div className="bg-orange-50 p-4 border-b border-orange-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div>
                                <p className="text-gray-600 font-medium">Pedido #{order.id}</p>
                                <div className="flex items-center gap-2 text-gray-600 mt-1 text-sm">
                                  <Calendar className="size-4" />
                                  <span>
                                    {new Date(order.orderDate).toLocaleDateString('es-MX', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {getStatusBadge(order.status)}
                          </div>
                        </div>

                        {/* Contenido del pedido */}
                        <div className="p-6">
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Columna Izquierda: Productos y Total */}
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Package className="size-5 text-orange-500" />
                                Productos
                              </h3>
                              
                              {/* Lista de Productos */}
                              <div className="space-y-3 mb-4">
                                {order.items.map((item, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm"
                                  >
                                    <div>
                                      <p className="text-gray-900 font-medium">{item.productName}</p>
                                      <p className="text-gray-600">
                                        Cantidad: {item.quantity}
                                      </p>
                                    </div>
                                    <p className="text-orange-600 font-semibold">
                                      ${(item.price * item.quantity).toFixed(2)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                              
                              {/* Lugar de recolección */}
                              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <MapPin className="size-5 text-orange-500 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-gray-700 font-medium">Lugar de Recolección</p>
                                    <p className="text-gray-600 text-sm">{order.deliveryLocation}</p>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Total */}
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-900 text-lg font-bold">Total Pagado:</span>
                                  <span className="text-orange-600 text-lg font-bold">
                                    ${order.total.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Columna Derecha: Información del vendedor */}
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="size-5 text-orange-500" />
                                Información del Vendedor
                              </h3>
                              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                <div>
                                  <p className="text-gray-600 text-sm mb-1">Nombre</p>
                                  <p className="text-gray-900 font-medium">{order.seller.name}</p>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Mail className="size-4 text-gray-400" />
                                  <p className="text-gray-700 text-sm">{order.seller.email}</p>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Phone className="size-4 text-gray-400" />
                                  <p className="text-gray-700 text-sm">{order.seller.phone}</p>
                                </div>
                              </div>

                              {/* Botón de contacto */}
                              <button className="w-full mt-4 px-4 py-3 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition-colors font-medium">
                                Contactar al Vendedor
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAccountPage;