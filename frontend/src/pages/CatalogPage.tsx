import React, { useState, useEffect, useCallback, type FC } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Search } from 'lucide-react'; // Ícono de búsqueda
import ProductCard from '../components/catalog/ProductCard'; // Componente de tarjeta de producto (Debes crearlo)
import axios from 'axios';
//import { Product } from '../types';

// Definiciones de tipos (ajústalas a la estructura real de tu DTO)
interface ProductListDTO {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl?: string;
  // Añade aquí más campos si ProductListDTO los tiene (ej: categoryId)
}

// Interfaz para la respuesta paginada de Spring
interface PageResponse {
  content: ProductListDTO[];
  totalPages: number;
  number: number; // Número de página actual (zero-indexed)
  size: number;
  totalElements: number;
}

const CatalogPage: FC = () => {
  const [products, setProducts] = useState<ProductListDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [query, setQuery] = useState<string>(''); // Estado para el término de búsqueda

  // Función de búsqueda con debounce (para no saturar el servidor al escribir)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setPage(0); // Resetear a la primera página al buscar
  };
  
  // Función principal para obtener productos, memorizada con useCallback
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Endpoint: GET /products?page={page}&size=6&q={query}
      let url = `/products?page=${page}&size=6`;
      if (query) {
          url += `&q=${encodeURIComponent(query)}`;
      }
      
      const response = await api.get<PageResponse>(url); 
      
      setProducts(response.data.content);
      setTotalPages(response.data.totalPages);
      
    } catch (err) {
      console.error('Error al cargar productos:', err);
      if (axios.isAxiosError(err) && err.response && err.response.status === 404) {
          setError('El catálogo está vacío o no se encontraron resultados.');
      } else {
          setError('No se pudo conectar con el servidor o cargar el catálogo.');
      }
    } finally {
      setLoading(false);
    }
  }, [page, query]); // Depende de la página y el término de búsqueda

  useEffect(() => {
    // Implementación de debounce para el término de búsqueda
    const handler = setTimeout(() => {
        fetchProducts();
    }, 500); // Espera 500ms después de que el usuario deja de escribir

    return () => {
        clearTimeout(handler);
    };
  }, [fetchProducts]); // Se ejecuta al cambiar fetchProducts (es decir, al cambiar page o query)


  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };
  
  // Si loading es true, o hay un error, el return se ejecuta aquí.
  if (loading && products.length === 0) return <div className="text-center mt-20">Cargando productos...</div>;
  if (error) return <div className="text-center mt-20 text-red-600">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Encabezado y búsqueda */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Catálogo de Productos</h1>
          
          {/* Barra de búsqueda */}
          <div className="relative max-w-xl">
            {/* Ícono de Lucide */}
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" /> 
            <input
              type="text"
              placeholder="Buscar productos..."
              // CONEXIÓN DE ESTADO Y DEBOUNCE
              value={query} 
              onChange={handleSearchChange} 
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Grid de productos */}
        {products.length === 0 && !loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontraron productos para "{query}"</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                // Usamos el componente ProductCard para la presentación
                <ProductCard
                  key={product.id}
                  product={product}
                  // Ya no pasamos onAddToCart o onViewDetails; el ProductCard se encargará del Link
                />
              ))}
            </div>
            
            {/* Controles de Paginación */}
            <div className="flex justify-center items-center mt-10 space-x-4">
              <button 
                onClick={() => handlePageChange(page - 1)} 
                disabled={page === 0 || loading}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-orange-500 hover:text-white transition-colors"
              >
                Anterior
              </button>
              <span className="text-gray-700">Página {page + 1} de {totalPages}</span>
              <button 
                onClick={() => handlePageChange(page + 1)} 
                disabled={page === totalPages - 1 || loading}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-orange-500 hover:text-white transition-colors"
              >
                Siguiente
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CatalogPage;