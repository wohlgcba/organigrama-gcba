import type { AuthorityStatus, OrganizationDataset, OrganizationResponsibility, OrganizationUnit } from '../types/organization.ts'

const asRecord = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Respuesta institucional inválida.')
  return value as Record<string, unknown>
}
const text = (value: unknown) => { if (typeof value !== 'string' || !value.trim()) throw new Error('Falta información de una unidad.'); return value }
const nullableText = (value: unknown) => value == null ? null : text(value)
const optionalText = (value: unknown) => typeof value === 'string' && value.trim() ? value : undefined
const authorityStatus = (value: unknown): AuthorityStatus | undefined => ['automatic','manual','pending','vacant','unidentified','not_applicable'].includes(String(value)) ? value as AuthorityStatus : undefined

// Public allowlist: no contacts, Directory links, membership or review notes.
export function parseOrganizationResponse(value: unknown): OrganizationDataset {
  const data = asRecord(value)
  if (!Array.isArray(data.units) || !Array.isArray(data.responsibilities)) throw new Error('Respuesta institucional incompleta.')
  const units: OrganizationUnit[] = data.units.map(value => {
    const item = asRecord(value)
    return { id: text(item.id), parentId: nullableText(item.parentId), name: text(item.name), type: text(item.type), code: nullableText(item.code), responsibilityPending: item.responsibilityPending === true,
      identificationStatus: authorityStatus(item.identificationStatus), referenceDate: optionalText(item.referenceDate),
      aliases: Array.isArray(item.aliases) ? item.aliases.filter((name): name is string => typeof name === 'string') : [] }
  })
  const responsibilities: OrganizationResponsibility[] = data.responsibilities.map(value => {
    const item = asRecord(value)
    return { id: text(item.id), unitId: text(item.unitId), name: text(item.name), role: text(item.role),
      identificationStatus: authorityStatus(item.identificationStatus), administrativeRole: optionalText(item.administrativeRole),
      source: optionalText(item.source), sourcePeriod: optionalText(item.sourcePeriod), sourceDate: optionalText(item.sourceDate),
      checkedAt: optionalText(item.checkedAt), validFrom: optionalText(item.validFrom), validUntil: optionalText(item.validUntil),
      evidenceCurrent: typeof item.evidenceCurrent === 'boolean' ? item.evidenceCurrent : undefined, evidenceUntil: optionalText(item.evidenceUntil) }
  })
  if (!Number.isInteger(data.responsibleCount) || Number(data.responsibleCount) < 0 || Number(data.responsibleCount) > responsibilities.length) throw new Error('Cantidad de responsables inválida.')
  return { source: 'supabase', units, responsibilities, responsibleCount: Number(data.responsibleCount) }
}

