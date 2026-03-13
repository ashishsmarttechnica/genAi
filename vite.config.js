import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import jsconfigPaths from 'vite-jsconfig-paths'
import eslint from 'vite-plugin-eslint';
import svgr from 'vite-plugin-svgr'
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react(), jsconfigPaths(), svgr(),
//   eslint(), tailwindcss(),
//   ],
// })
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), jsconfigPaths(), svgr(), eslint(), tailwindcss()],
    server: {
      proxy: {
        // Browser /api/... pe request karega → Vite backend pe forward karega
        // Server-to-server request hai, CORS apply nahi hoti!
        '/api': {
          target: env.VITE_API_URL,   // .env se backend URL
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''), // /api strip karo
          secure: false,
          cookieDomainRewrite: 'localhost', // Cookie domain fix for dev
        },
      },
    },
  };
});

