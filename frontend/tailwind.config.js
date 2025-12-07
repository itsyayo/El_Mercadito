import tailwindcssAnimate from 'tailwindcss-animate'; // <-- IMPORTACIÓN CORREGIDA

/** @type {import('tailwindcss').Config} */
export default { // Usamos export default
  // CORRECCIÓN: Rutas relativas a la carpeta /frontend/
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,css}", // Escanea archivos DENTRO de src/
  ],
  theme: {
    extend: {
      // Mapeo de variables CSS (sin cambios)
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        muted: 'var(--muted)',
        accent: 'var(--accent)',
        destructive: 'var(--destructive)',
        border: 'var(--border)',
        input: 'var(--input)',
        orange: {
          500: '#f97316',
          600: '#ea580c',
        },
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: `calc(var(--radius) - 4px)`,
      },
    },
  },
  plugins: [
    tailwindcssAnimate, // <-- REFERENCIA A LA VARIABLE IMPORTADA
  ],
}