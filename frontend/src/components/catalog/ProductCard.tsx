import React, { type FC } from 'react';
import { Link } from 'react-router-dom'; // Importamos Link para la navegación
import { ShoppingCart } from 'lucide-react';

// Tipos unificados con el CatalogPage.tsx
interface ProductListDTO {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl?: string;
  stock?: number; // Añadimos stock basado en el uso que le diste
}

interface ProductCardProps {
  product: ProductListDTO;
  // Eliminamos onViewDetails y onAddToCart props, manejamos la navegación directamente
}

const ProductCard: FC<ProductCardProps> = ({ product }) => {
  // Aseguramos que stock exista para el botón de carrito
  const stock = product.stock !== undefined ? product.stock : 1; 

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
      {/* Enlace para Ver Detalles - Usa el ruteo /products/:id */}
      <Link to={`/products/${product.id}`} className="block">
        {/* Imagen del producto */}
        <div className="h-48 bg-gray-200 flex items-center justify-center">
          {product.imageUrl ? (
            <img 
              // Usar placeholder si el URL es solo un string vacío o nulo
              src={product.imageUrl || `https://placehold.co/400x300/FDBA74/ffffff?text=${encodeURIComponent(product.name)}`} 
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => { 
                // Fallback a placeholder en caso de error de carga
                (e.target as HTMLImageElement).onerror = null; 
                (e.target as HTMLImageElement).src = `https://placehold.co/400x300/FDBA74/ffffff?text=${encodeURIComponent(product.name)}`;
              }}
            />
          ) : (
            <span className="text-gray-400">Sin imagen</span>
          )}
        </div>
      </Link>

      {/* Información del producto */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold text-orange-600">${product.price.toFixed(2)}</p>
          <p className="text-sm text-gray-500">
            Stock: {stock}
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2">
          <Link
            to={`/products/${product.id}`} // Enlace directo a la página de detalles
            className="flex-1 px-3 py-2 text-center border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition-colors duration-200"
          >
            Ver Detalles
          </Link>
          <button
            // Aquí se implementaría la lógica de añadir al carrito
            onClick={() => console.log(`Añadir al carrito: ${product.id}`)}
            className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50"
            disabled={stock === 0}
          >
            <ShoppingCart className="size-5" />
          </button>
        </div>

        {stock === 0 && (
          <p className="text-red-500 text-center mt-2 font-medium">¡Agotado!</p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;