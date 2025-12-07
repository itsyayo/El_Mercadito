import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';
import postcssNested from 'postcss-nested';

export default {
  plugins: [
    // Usamos un array y pasamos las variables importadas
    tailwindcss,
    autoprefixer,
    postcssNested,
  ],
}