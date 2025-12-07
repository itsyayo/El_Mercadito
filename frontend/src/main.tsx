import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';         // 1. Directivas @tailwind y estilos base
import './global.css';       // 2. Variables de color (Figma/Shadcn)
import { AuthProvider } from './context/AuthContext.tsx';

// Usamos BrowserRouter aquí si no está envuelto en App.tsx (tal como lo configuramos)
//import { BrowserRouter } from 'react-router-dom'; 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* La aplicación ya está envuelta en BrowserRouter en App.tsx, por lo que no lo incluiremos aquí */}
    <AuthProvider> 
      <App />
    </AuthProvider>
  </React.StrictMode>,
);