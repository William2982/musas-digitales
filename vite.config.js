import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  console.log('Proxy config loaded, key exists:', !!env.VITE_OPENROUTER_API_KEY)

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/openrouter': {
          target: 'https://openrouter.ai',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/openrouter/, '/api'),
          headers: {
            'Authorization': `Bearer ${env.VITE_OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'http://localhost:5173',
            'X-Title': 'Musas Digitales',
          },
        },
      },
    },
  }
})