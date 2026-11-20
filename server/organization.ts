import type { IncomingMessage, ServerResponse } from 'node:http'
import { parseOrganizationResponse } from '../src/services/organizationPublicDto.ts'

type Dependencies = { fetch: typeof fetch; timeoutMs: number }
const defaults: Dependencies = { fetch: globalThis.fetch, timeoutMs: 8000 }

export function createOrganizationHandler(deps: Dependencies = defaults, env = process.env) {
  return async (req: IncomingMessage, res: ServerResponse) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Cache-Control', 'no-store')
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.statusCode = 405
      res.setHeader('Allow', 'GET, HEAD')
      res.end(JSON.stringify({ error: 'Método no permitido.' }))
      return
    }
    try {
      const url = new URL(env.SUPABASE_URL || env.VITE_SUPABASE_URL || '')
      const key = (env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim()
      if (url.origin !== 'https://pnhskmlejdaklwkvasxp.supabase.co' || url.username || url.password || !key || key.startsWith('sb_secret_')) throw new Error('Invalid public configuration')
      if (key.split('.').length === 3 && JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()).role !== 'anon') throw new Error('Only a public key is allowed')
      // Fixed read-only public RPC. Never forward visitor credentials or connect to PHP/MySQL.
      const response = await deps.fetch(new URL('/rest/v1/rpc/get_gcba_organization_chart', url.origin), {
        method: 'POST', redirect: 'error', signal: AbortSignal.timeout(deps.timeoutMs),
        headers: { apikey: key, 'Content-Type': 'application/json', 'Accept-Profile': 'public', 'Content-Profile': 'public' }, body: '{}',
      })
      if (!response.ok) throw new Error('Institutional source unavailable')
      const { units, responsibilities, responsibleCount } = parseOrganizationResponse(await response.json())
      const body = JSON.stringify({ units, responsibilities, responsibleCount })
      res.statusCode = 200
      res.setHeader('Cache-Control', 'public, max-age=60')
      res.setHeader('Vercel-CDN-Cache-Control', 'public, s-maxage=300, stale-while-revalidate=300')
      res.end(req.method === 'HEAD' ? undefined : body)
    } catch {
      res.statusCode = 503
      res.end(JSON.stringify({ error: 'No pudimos cargar el Organigrama institucional. Reintentá en unos momentos.' }))
    }
  }
}
