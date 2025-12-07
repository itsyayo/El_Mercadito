import React, { type FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Upload, DollarSign, Calendar, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext'; // Para verificar roles si es necesario

// Definimos el DTO de datos del formulario para tipado
interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  deliverySchedule: string;
  image?: File;
}

const ProductCreatePage: FC = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth(); // Para seguridad del lado del cliente
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const categories = [
    'Comida',
    'Maquillaje',
    'Accesorio',
    'Electrónica',
    'Ropa',
    'Libros',
    'Artesanía',
    'Otro',
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // 1. Obtener los datos del formulario (necesario para manejar el archivo)
      const formElement = e.currentTarget as HTMLFormElement;
      const formData = new FormData(formElement);
      
      // La API de Spring requiere un formato específico para JSON y archivos.
      // Como estamos enviando un archivo, usamos FormData y el backend debe
      // esperar un request que incluya el archivo y los otros campos.

      // Asumiendo que Spring espera los campos como parte del mismo FormData,
      // y el archivo bajo la clave 'image':

      // 2. Convertir los datos numéricos (FormData los trae como strings)
      formData.set('price', parseFloat(formData.get('price') as string).toFixed(2));
      formData.set('stock', parseInt(formData.get('stock') as string, 10).toString());
      
      // 3. Realizar la petición POST
      // **IMPORTANTE**: No configuramos el header 'Content-Type' aquí;
      // Axios lo hará automáticamente como 'multipart/form-data' debido al FormData.
      const response = await api.post('/products', formData); 

      // Éxito
      setSuccess(`Producto "${formData.get('name')}" publicado con éxito! ID: ${response.data}`);
      formElement.reset(); // Limpiar el formulario
      
    } catch (err: unknown) {
      let errorMessage = 'Error al publicar el producto.';
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
            errorMessage = 'Acceso denegado: No tienes permisos de Vendedor/Admin.';
        } else if (err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
            errorMessage = (err.response.data as { message: string }).message;
        } else {
            errorMessage = `Error del servidor: Código ${err.response.status}.`;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Volver al catálogo
    navigate('/catalog');
  };
  
  // Verificación de rol del lado del cliente (para mejor UX, no seguridad)
  // La seguridad real la aplica el @PreAuthorize de Spring.
  if (!hasRole('SELLER') && !hasRole('ADMIN')) {
      return (
        <div className="text-center mt-20 p-8 bg-white rounded-lg shadow-lg max-w-lg mx-auto">
            <AlertTriangle className="size-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
            <p className="text-gray-600">
                Debes tener el rol de Vendedor o Administrador para publicar productos.
            </p>
            <button 
                onClick={handleCancel}
                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
                Volver
            </button>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <Package className="size-8 text-orange-500" />
            <h1 className="text-2xl font-bold text-gray-900">Publicar Producto</h1>
          </div>

          <p className="text-gray-600 mb-6">
            Completa la información de tu producto para comenzar a vender
          </p>
          
          {/* Mensajes de Estado */}
          {error && (
              <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg text-center" role="alert">
                  {error}
              </div>
          )}
          {success && (
              <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg text-center" role="alert">
                  {success}
              </div>
          )}


          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Fotografía del producto */}
            <div>
              <label htmlFor="image" className="block text-gray-700 mb-2 font-medium">
                Fotografía del Producto <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors cursor-pointer">
                <Upload className="size-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">
                  Arrastra una imagen o haz clic para seleccionar
                </p>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  required
                  className="w-full opacity-0 h-0 absolute" // Ocultar input pero mantener funcionalidad
                />
                <button type="button" onClick={() => document.getElementById('image')?.click()} className="text-orange-500 hover:text-orange-600 font-medium">
                    Seleccionar Archivo
                </button>
              </div>
            </div>

            {/* Nombre del producto */}
            <div>
              <label htmlFor="name" className="block text-gray-700 mb-2 font-medium">
                Nombre del Producto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="Ej: Laptop HP Pavilion 15"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                disabled={loading}
              />
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="description" className="block text-gray-700 mb-2 font-medium">
                Descripción <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                placeholder="Describe tu producto en detalle..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                disabled={loading}
              />
            </div>

            {/* Tipo de Producto (Categoría) */}
            <div>
              <label htmlFor="category" className="block text-gray-700 mb-2 font-medium">
                Tipo de Producto <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                disabled={loading}
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Precio y Cantidad en fila */}
            <div className="grid grid-cols-2 gap-4">
              {/* Precio */}
              <div>
                <label htmlFor="price" className="block text-gray-700 mb-2 font-medium">
                  Precio (MXN) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
                  <input
                    type="number"
                    id="price"
                    name="price"
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Cantidad */}
              <div>
                <label htmlFor="stock" className="block text-gray-700 mb-2 font-medium">
                  Cantidad Disponible <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  required
                  min="1"
                  placeholder="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Horarios de Entrega */}
            <div>
              <label htmlFor="deliverySchedule" className="block text-gray-700 mb-2 font-medium">
                Horarios de Entrega <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 text-gray-400 size-5" />
                <textarea
                  id="deliverySchedule"
                  name="deliverySchedule"
                  required
                  rows={3}
                  placeholder="Ej: Lunes a Viernes de 9:00 AM a 5:00 PM"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleCancel} // Usa el handler de navegación
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-bold disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Publicando...' : 'Publicar Producto'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductCreatePage;