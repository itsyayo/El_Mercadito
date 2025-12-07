import React, { useState, useEffect, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    Home, Users, Package, FileText, AlertTriangle, 
    ArrowUp, ArrowDown, CheckCircle, Clock, XCircle, MapPin
} from 'lucide-react';
import api from '../../services/api';
import axios from 'axios';

// --- Tipos de Datos ---
type PanelSection = 'dashboard' | 'products' | 'users' | 'approvals' | 'reports';

type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED'; // Nuevo tipo para el badge

interface VendorRequestDTO {
    id: number;
    userName: string;
    email: string; // Añadimos email y fecha de solicitud para la interfaz detallada
    requestDate: string;
    status: ApprovalStatus;
    documentsAttached: boolean;
    reason?: string; // Motivo de rechazo/aprobación
}

// --- MOCK DE DATOS DEL DASHBOARD ---
const mockStats = {
    productsActive: 45,
    salesTotal: 125000.50,
    newUsersToday: 12,
    salesChartData: [5, 10, 8, 15, 20, 12, 25], // Ventas por día
    usersChartData: [20, 22, 18, 25, 30, 28, 35], // Usuarios activos por día
};

const mockApprovalRequests: VendorRequestDTO[] = [
    { id: 1, userName: "Moises Morales", email: "moises@uam.mx", requestDate: new Date(Date.now() - 86400000 * 3).toISOString(), status: 'PENDING', documentsAttached: true },
    { id: 2, userName: "Axel Juarez", email: "axel@uam.mx", requestDate: new Date(Date.now() - 86400000 * 2).toISOString(), status: 'PENDING', documentsAttached: true },
    { id: 3, userName: "Emilio Vazquez", email: "emilio@uam.mx", requestDate: new Date(Date.now() - 86400000 * 10).toISOString(), status: 'APPROVED', documentsAttached: true },
    { id: 4, userName: "Eduardo Martinez", email: "eduardo@uam.mx", requestDate: new Date(Date.now() - 86400000 * 1).toISOString(), status: 'REJECTED', documentsAttached: true, reason: 'Falla de credibilidad en documentos.' },
];
// --- FIN MOCK DE DATOS ---


// --- Componente de Tarjeta de Estadísticas ---
interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    trend?: 'up' | 'down' | 'none';
}

const StatCard: FC<StatCardProps> = ({ title, value, icon: Icon, color, trend = 'none' }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4" style={{ borderColor: color }}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
            </div>
            <Icon className="size-8 opacity-40" style={{ color: color }} />
        </div>
        {trend !== 'none' && (
            <div className={`flex items-center mt-3 text-sm font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trend === 'up' ? <ArrowUp className="size-4 mr-1" /> : <ArrowDown className="size-4 mr-1" />}
                {trend === 'up' ? '+5.2%' : '-1.5%'} vs. Semana Anterior
            </div>
        )}
    </div>
);

// --- Componente dedicado para la Aprobación de Vendedores (Integración de VendorApprovalPage) ---
interface VendorApprovalProps {
    requests: VendorRequestDTO[];
    onApprove: (id: number) => void;
    onReject: (id: number) => void;
    loadingData: boolean;
}

const VendorApprovalPage: FC<VendorApprovalProps> = ({ requests, onApprove, onReject, loadingData }) => {
    
    // Reutilizamos el getStatusBadge del Dashboard para consistencia
    const getStatusBadge = (status: ApprovalStatus) => {
        switch (status) {
            case 'PENDING':
                return <span className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full font-medium flex items-center gap-1"><Clock className="size-3" /> Pendiente</span>;
            case 'APPROVED':
                return <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium flex items-center gap-1"><CheckCircle className="size-3" /> Aprobado</span>;
            case 'REJECTED':
                return <span className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full font-medium flex items-center gap-1"><XCircle className="size-3" /> Rechazado</span>;
            default:
                return null;
        }
    };
    
    // Placeholder para ver documentos
    const onViewDocuments = (id: number) => {
        console.log(`[SIMULACIÓN] Viendo documentos para solicitud ID: ${id}`);
        // IMPORANTE: Reemplazar alert()
        console.log(`Simulación: Mostrar documentos para ${id}`);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Aprobación de Vendedores</h2>
            <div className="space-y-6">
                {requests.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                        <p className="text-gray-500">No hay solicitudes pendientes de vendedores.</p>
                    </div>
                ) : (
                    requests.map(request => (
                        <div key={request.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">{request.userName}</h3>
                                    <p className="text-sm text-gray-600">{request.email}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-sm text-gray-600">Estado:</span>
                                        {getStatusBadge(request.status)}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Solicitado: {new Date(request.requestDate).toLocaleDateString('es-MX')}</p>
                                    {request.status === 'REJECTED' && (
                                        <p className="text-sm text-red-500 mt-1">Motivo: {request.reason}</p>
                                    )}
                                </div>
                            </div>

                            <div className="border-t pt-4 flex gap-4">
                                
                                {request.documentsAttached && (
                                    <button 
                                        onClick={() => onViewDocuments(request.id)}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                                        disabled={loadingData}
                                    >
                                        <FileText className="size-5 inline mr-2" /> Ver Documentos
                                    </button>
                                )}
                                
                                {request.status === 'PENDING' ? (
                                    <>
                                        <button 
                                            onClick={() => onApprove(request.id)}
                                            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                                            disabled={loadingData}
                                        >
                                            <CheckCircle className="size-5 inline mr-2" /> Aprobar
                                        </button>
                                        <button 
                                            onClick={() => onReject(request.id)}
                                            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                                            disabled={loadingData}
                                        >
                                            <XCircle className="size-5 inline mr-2" /> Rechazar
                                        </button>
                                    </>
                                ) : (
                                    <p className="text-gray-500 italic p-2 w-full text-center">Solicitud ya procesada.</p>
                                )}
                            </div>
                        </div>
                    )))}
            </div>
        </div>
    );
};


// --- Componente principal del Dashboard ---
const VendorAdminDashboard: FC = () => {
    const navigate = useNavigate();
    const { hasRole, loading: authLoading } = useAuth();
    
    // El dashboard usará un sidebar, por eso el estado de la sección activa
    const [activeSection, setActiveSection] = useState<PanelSection>('dashboard');
    
    // Mock de datos cargados
    const [stats, setStats] = useState(mockStats);
    const [requests, setRequests] = useState(mockApprovalRequests);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Seguridad de Roles
    const isAuthorized = hasRole('ADMIN') || hasRole('SELLER');
    
    // Si el rol no está autorizado, redirigir
    useEffect(() => {
        if (!authLoading && !isAuthorized) {
            navigate('/');
        }
    }, [authLoading, isAuthorized, navigate]);
    
    // --- FUNCIÓN DE UTILIDAD: Badge de Estado (Mantenida aquí para componentes que no son de aprobación) ---
    const getStatusBadge = (status: ApprovalStatus) => {
        switch (status) {
            case 'PENDING':
                return <span className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full font-medium flex items-center gap-1"><Clock className="size-3" /> Pendiente</span>;
            case 'APPROVED':
                return <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium flex items-center gap-1"><CheckCircle className="size-3" /> Aprobado</span>;
            case 'REJECTED':
                return <span className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full font-medium flex items-center gap-1"><XCircle className="size-3" /> Rechazado</span>;
            default:
                return null;
        }
    };


    // --- Handlers de Aprobación ---
    const handleApprove = (id: number) => {
        // Lógica de la API: POST /admin/approve-seller/{id}
        console.log(`[SIMULACIÓN] Aprobando vendedor ID: ${id}`);
        setRequests(requests.map(req => req.id === id ? { ...req, status: 'APPROVED' } : req));
    };

    const handleReject = (id: number) => {
        // Lógica de la API: POST /admin/reject-seller/{id}
        console.log(`[SIMULACIÓN] Rechazando vendedor ID: ${id}`);
        setRequests(requests.map(req => req.id === id ? { ...req, status: 'REJECTED', reason: 'Rechazado por el Administrador.' } : req));
    };
    
    // --- Renderizado de Paneles ---

    const renderMainContent = () => {
        if (!isAuthorized) {
            return <div className="text-center mt-20 text-xl text-red-600">Acceso denegado.</div>;
        }

        switch (activeSection) {
            case 'dashboard':
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard General</h2>
                        
                        {/* Tarjetas de Estadísticas */}
                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            <StatCard 
                                title="Productos Activos" 
                                value={stats.productsActive} 
                                icon={Package} 
                                color="#F59E0B" // Orange-500
                                trend="up"
                            />
                            <StatCard 
                                title="Ventas Totales (MXN)" 
                                value={`$${stats.salesTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
                                icon={FileText} 
                                color="#10B981" // Green-500
                                trend="up"
                            />
                            <StatCard 
                                title="Nuevos Usuarios (Hoy)" 
                                value={stats.newUsersToday} 
                                icon={Users} 
                                color="#3B82F6" // Blue-500
                                trend="down"
                            />
                        </div>

                        {/* Aquí irían los gráficos (mockeados por ahora) */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold mb-4">Métricas de Ventas y Usuarios</h3>
                            {/* PLACEHOLDER DE GRÁFICOS */}
                            <div className="h-64 bg-gray-100 flex items-center justify-center rounded-lg text-gray-500">
                                [PLACEHOLDER] Gráficos de Ventas y Usuarios (Lógica de renderizado omitida)
                            </div>
                        </div>
                    </div>
                );

            case 'approvals':
                return (
                    // Renderiza el componente de aprobación, pasando el estado y handlers
                    <VendorApprovalPage
                        requests={requests}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        loadingData={loadingData}
                    />
                );
            case 'products':
                return <h2 className="text-2xl font-bold text-gray-900">Gestión de Productos (Vendedor/Admin)</h2>;
            case 'users':
                return <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios (Solo Admin)</h2>;
            case 'reports':
                return <h2 className="text-2xl font-bold text-gray-900">Reportes y Estadísticas</h2>;
            default:
                return null;
        }
    };
    
    // --- Renderizado del Sidebar y Layout ---
    const sidebarItems = [
        { id: 'dashboard', name: 'Dashboard', icon: Home, roles: ['ADMIN', 'SELLER'] as const },
        { id: 'products', name: 'Productos', icon: Package, roles: ['ADMIN', 'SELLER'] as const },
        { id: 'approvals', name: 'Aprobación de Vendedores', icon: CheckCircle, roles: ['ADMIN'] as const },
        { id: 'users', name: 'Gestión de Usuarios', icon: Users, roles: ['ADMIN'] as const },
        { id: 'reports', name: 'Reportes', icon: FileText, roles: ['ADMIN', 'SELLER'] as const },
    ];
    
    // Filtrar items del sidebar según el rol del usuario autenticado
    const filteredSidebarItems = sidebarItems.filter(item => 
        item.roles.some(role => hasRole(role))
    );

    if (authLoading) return <div className="text-center mt-20">Verificando permisos...</div>;

    // Layout principal
    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Columna Izquierda: Sidebar de Navegación */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-lg p-6 sticky top-20">
                        <h3 className="text-xl font-bold text-orange-500 mb-6">Panel</h3>
                        <nav className="space-y-2">
                            {filteredSidebarItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveSection(item.id as PanelSection)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors font-medium ${
                                        activeSection === item.id 
                                            ? 'bg-orange-500 text-white shadow-md' 
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <item.icon className="size-5" />
                                    <span>{item.name}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Contenido Principal */}
                <div className="lg:col-span-3">
                    {loadingData ? (
                        <div className="text-center mt-20">Cargando datos del panel...</div>
                    ) : (
                        renderMainContent()
                    )}
                </div>
            </div>
        </div>
    );
};

export default VendorAdminDashboard;