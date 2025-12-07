import React, { useState, useEffect, type FC, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import api from '../services/api'; 
import axios from 'axios';
import { ShoppingCart, ArrowLeft, Package } from 'lucide-react'; // Íconos

// Definición del tipo ProductDetailDTO (ajústala a la estructura real de tu DTO)
interface ProductDetailDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryName: string; 
  sellerName: string;
  images: string[]; // Lista de URLs de imágenes
  // ... cualquier otro detalle que devuelva Spring
}

const ProductDetail: FC = () => { // Usamos FC
  const { id } = useParams<{ id: string }>(); 
  const productId = Number(id); 
  
  const [product, setProduct] = useState<ProductDetailDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); // Hook de navegación

  useEffect(() => {
    if (isNaN(productId) || productId <= 0) {
        setError('ID de producto no válido.');
        setLoading(false);
        return;
    }
    
    fetchProductDetail(productId);
  }, [productId]);

  const fetchProductDetail = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      // Endpoint: GET /products/{id}
      const response = await api.get<ProductDetailDTO>(`/products/${id}`); 
      setProduct(response.data);
      
    } catch (err) {
      console.error(`Error al cargar el producto ${id}:`, err);
       if (axios.isAxiosError(err) && err.response && err.response.status === 404) {
           setError('Producto no encontrado.');
       } else {
           setError('Error de conexión o al cargar los detalles.');
       }
    } finally {
      setLoading(false);
    }
  };
  
  // Handler para volver al catálogo
  const handleBack = () => navigate('/catalog');

  // Handler para añadir al carrito (placeholder)
  const handleAddToCart = (e: FormEvent) => {
      e.preventDefault();
      
      if (!product) return;

      // CORRECCIÓN: Casteamos e.currentTarget a HTMLFormElement
      const form = e.currentTarget as HTMLFormElement;
      
      const quantityInput = form.elements.namedItem('quantity') as HTMLInputElement;
      const quantity = parseInt(quantityInput.value, 10);
      
      if (quantity > 0 && quantity <= product.stock) {
          console.log(`Añadir ${quantity} de ${product.name} (ID: ${productId}) al carrito.`);
          // IMPORTANT: Reemplazar alert() con un modal o notificación real
          // alert(`¡${quantity} unidades de ${product.name} añadidas al carrito!`);
          console.log(`¡${quantity} unidades de ${product.name} añadidas al carrito!`);
          
          // Aquí iría la lógica real de la API: api.post('/cart/add', { productId, quantity })
      } else {
          // alert(`Cantidad inválida. Máximo disponible: ${product.stock}`);
          console.error(`Cantidad inválida. Máximo disponible: ${product.stock}`);
      }
  };

  if (loading) return <div className="text-center mt-20">Cargando detalles del producto...</div>;
  if (error) return <div className="text-center mt-20 text-red-600">Error: {error}</div>;
  if (!product) return <div className="text-center mt-20">No se encontró el producto.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Botón volver */}
        <button
          onClick={handleBack} // Usamos el handler de navegación
          className="flex items-center gap-2 text-orange-500 hover:text-orange-600 mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="size-5" />
          Volver al catálogo
        </button>

        {/* Detalle del producto */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Imagen del producto */}
            <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
              {(product.images && product.images.length > 0) ? (
                <img 
                  src={product.images[0]} // Muestra la primera imagen de la lista
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Package className="size-24 text-gray-400" />
              )}
            </div>

            {/* Información del producto */}
            <div className="flex flex-col">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-4">{product.name}</h1>
              
              <div className="mb-6 border-b pb-4">
                <p className="text-4xl font-bold text-orange-600 mb-4">${product.price.toFixed(2)}</p>
                <div className="flex items-center gap-2 mb-4">
                  <Package className="size-5 text-gray-500" />
                  <span className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Stock disponible: {product.stock} unidades
                  </span>
                </div>
                <p className="text-sm text-gray-500">Vendido por: {product.sellerName || 'Vendedor Desconocido'}</p>
              </div>

              {/* Descripción */}
              <div className="mb-6 flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Descripción</h3>
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {product.description || 'Sin descripción disponible.'}
                </p>
              </div>

              {/* Formulario de añadir al carrito */}
              <form onSubmit={handleAddToCart} className="space-y-4 pt-4 border-t">
                <div>
                  <label htmlFor="quantity" className="block text-gray-700 mb-2 font-medium">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    min="1"
                    max={product.stock}
                    defaultValue="1"
                    className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    disabled={product.stock === 0}
                  />
                </div>

                <button
                  type="submit"
                  disabled={product.stock === 0}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="size-5" />
                  {product.stock === 0 ? 'Agotado' : 'Añadir al Carrito'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;