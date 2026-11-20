import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import { createOrganizationHandler } from './server/organization.ts'

export default defineConfig({
  plugins: [react(), tailwindcss(), {
    name: 'local-public-organization-api',
    configureServer(server) {
      const env = { ...loadEnv(server.config.mode, process.cwd(), ''), ...process.env }
      const handler = createOrganizationHandler(undefined, env)
      server.middlewares.use('/api/organization', (req, res) => { void handler(req, res) })
    },
  }],
  server: { port: 5174, fs: { deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/.local/**', '**/supabase/**', '**/scripts/**', '**/server/**', '**/api/**', '**/*.xlsx', '**/*.sqlite', '**/*.local'] } },
})
