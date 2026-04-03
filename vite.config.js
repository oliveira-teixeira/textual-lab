import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// Plugin to inject dev entry point when running in dev mode
const devEntryPlugin = () => ({
  name: 'dev-entry',
  transformIndexHtml: {
    order: 'pre',
    handler(html, { server }) {
      if (server) {
        // Remove production script/link tags and inject dev entry
        return html
          .replace(/<script[^>]*crossorigin[^>]*><\/script>/g, '')
          .replace(/<link[^>]*crossorigin[^>]*>/g, '')
          .replace('</head>', '  <script type="module" src="/src/main.jsx"></script>\n  </head>');
      }
      return html;
    }
  }
});

export default defineConfig({
  plugins: [devEntryPlugin(), react(), tailwindcss()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
