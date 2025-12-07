import React, { useState, useEffect, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Edit, Trash2, Plus, AlertTriangle } from 'lucide-react';
import api from '../../services/api'; // Cliente Axios
import axios from 'axios';

// --- Tipos de Datos (Basados en el Address de Figma y adaptado a Spring DTOs) ---
interface LocationDTO {
  id: number;
  name: string; // Nombre de la ubicación (ej: "Salón 528")
  description: string; // Detalle (ej: "Salón en el 5 piso, lado poniente")
  isDefault?: boolean;
}

const mockLocations: LocationDTO[] = [
    { id: 1, name: "Salón 528", description: "Salón en el 5 piso, lado poniente", isDefault: true },
    { id: 2, name: "Cafetería Central", description: "Mesa junto a la ventana", isDefault: false },
    { id: 3, name: "Entrada Principal", description: "Frente a seguridad", isDefault: false },
];

// Asumimos que esta página será hija de la ruta /checkout
interface RecoleccionSelectionPageProps {
  onContinue: (locationId: number) => void; // Función para pasar al siguiente paso
}


const RecoleccionSelectionPage: FC<RecoleccionSelectionPageProps> = ({ onContinue }) => {
  const [locations, setLocations] = useState<LocationDTO[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<number | undefined>(mockLocations[0]?.id);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  // --- LÓGICA DE CARGA DE DATOS (MOCK/API) ---
  useEffect(() => {
    // Aquí iría la llamada real a Spring: GET /users/me/locations
    const fetchLocations = async () => {
        try {
            // Reemplazar este mock con la llamada a la API real cuando esté lista:
            // const response = await api.get<LocationDTO[]>('/users/me/locations');
            // setLocations(response.data);
            
            // Usamos mock data por ahora
            setTimeout(() => {
                setLocations(mockLocations);
                setLoading(false);
            }, 500);
            
        } catch (err) {
            setError("No se pudieron cargar los lugares de recolección guardados.");
            setLoading(false);
        }
    };
    fetchLocations();
  }, []);
  
  // --- HANDLERS DE INTERACCIÓN ---

  const handleSelectLocation = (id: number) => {
    setSelectedLocationId(id);
  };
  
  // Handlers simulados
  const handleEditLocation = (id: number) => console.log(`[SIMULACIÓN] Editando ubicación ID: ${id}`);
  const handleDeleteLocation = (id: number) => {
      // Simulación de eliminación del estado
      setLocations(locations.filter(loc => loc.id !== id));
      if (selectedLocationId === id) {
          setSelectedLocationId(undefined); // Deseleccionar si se elimina la actual
      }
      console.log(`[SIMULACIÓN] Eliminando ubicación ID: ${id}`);
  };
  
  const handleAddNewLocation = () => {
      // Aquí iría la navegación a un formulario para añadir un nuevo "Salón de Entrega"
      console.log("[SIMULACIÓN] Navegando a formulario para añadir Salón de Entrega.");
      // navigate('/account/locations/new'); 
  };
  
  const handleContinue = () => {
      if (selectedLocationId !== undefined) {
          onContinue(selectedLocationId);
      } else {
          setError("Debes seleccionar un lugar de recolección para continuar.");
      }
  };


  // --- RENDERIZADO ---
  
  if (loading) return <div className="text-center py-12">Cargando lugares de recolección...</div>;
  if (error) return <div className="p-4 text-red-600 bg-red-100 rounded-lg flex items-center gap-2"><AlertTriangle className="size-5" />{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6 border-b pb-4">
        <MapPin className="size-6 text-orange-500" />
        <h2 className="text-xl font-bold text-gray-900">Elegir Lugar de Recolección / Entrega</h2>
      </div>

      {/* Lista de ubicaciones */}
      <div className="space-y-4 mb-6">
        {locations.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No tienes lugares de recolección guardados
          </p>
        ) : (
          locations.map((location) => (
            <div
              key={location.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedLocationId === location.id
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-300 hover:border-orange-400'
              }`}
              onClick={() => handleSelectLocation(location.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="radio"
                      checked={selectedLocationId === location.id}
                      onChange={() => handleSelectLocation(location.id)}
                      className="text-orange-500 focus:ring-orange-500"
                    />
                    {location.isDefault && (
                      <span className="px-2 py-1 bg-orange-500 text-white rounded text-xs font-semibold">
                        Principal
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-900 font-semibold mb-1">{location.name}</p>
                  <p className="text-gray-600 text-sm">
                    {location.description}
                  </p>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2 self-start">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditLocation(location.id);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Edit className="size-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteLocation(location.id);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="size-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Botón nuevo lugar de entrega */}
      <button
        onClick={handleAddNewLocation}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-orange-500 hover:text-orange-500 transition-colors mb-6 font-semibold"
      >
        <Plus className="size-5" />
        NUEVO SALÓN DE ENTREGA
      </button>

      {/* Botón continuar */}
      <button
        onClick={handleContinue}
        disabled={selectedLocationId === undefined}
        className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-bold"
      >
        CONTINUAR CON PAGO
      </button>
    </div>
  );
};

export default RecoleccionSelectionPage;