import type { OrganizationDataset } from '../types/organization'
import { parseOrganizationResponse } from './organizationPublicDto'
export { parseOrganizationResponse } from './organizationPublicDto'

export async function getOrganizationDataset(signal?: AbortSignal): Promise<OrganizationDataset> {
  const timeout = AbortSignal.timeout(15000)
  const requestSignal = signal ? AbortSignal.any([signal, timeout]) : timeout
  const source = import.meta.env.VITE_ORGANIZATION_SOURCE ?? 'local'
  if (source === 'local' || source === 'mock') {
    const { default: url } = await import('../mocks/organizationStructure.json?url')
    const response = await fetch(url, { signal: requestSignal })
    if (!response.ok) throw new Error('No pudimos cargar la estructura local del Organigrama.')
    const structure: unknown = await response.json()
    if (!structure || typeof structure !== 'object' || Array.isArray(structure)) throw new Error('La estructura local no es válida.')
    const data = parseOrganizationResponse({ ...structure, responsibilities: [], responsibleCount: 0 })
    if (source === 'local') return { ...data, source: 'local' }
    const { getMockOrganization } = await import('../mocks/organization')
    return getMockOrganization(data.units)
  }
  if (source !== 'supabase') throw new Error('La fuente del Organigrama no está configurada correctamente.')
  const response = await fetch('/api/organization', { headers: { Accept: 'application/json' }, signal: requestSignal })
  if (!response.ok) throw new Error('No pudimos cargar el Organigrama institucional. Reintentá en unos momentos.')
  return parseOrganizationResponse(await response.json())
}
