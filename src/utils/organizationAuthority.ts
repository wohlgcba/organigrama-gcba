import type { AuthorityStatus, OrganizationResponsibility, OrganizationUnit } from '../types/organization'

export const AUTHORITY_LABELS: Record<AuthorityStatus, string> = {
  automatic: 'Identificado automáticamente', manual: 'Confirmado manualmente',
  pending: 'Pendiente de conciliación', vacant: 'Vacante',
  unidentified: 'Responsable no identificado', not_applicable: 'Sin titular propio / No corresponde',
}
export const authorityPlaceholder = (unit: Pick<OrganizationUnit, 'identificationStatus' | 'responsibilityPending'>) => {
  const status = unit.identificationStatus ?? (unit.responsibilityPending ? 'pending' : 'unidentified')
  return AUTHORITY_LABELS[status]
}

export function assignmentLabel(assignment: OrganizationResponsibility) {
  if (assignment.evidenceCurrent === false) return `Último registro${assignment.sourcePeriod ? ` · ${assignment.sourcePeriod}` : ''} · Actualización pendiente`
  return assignment.identificationStatus ? AUTHORITY_LABELS[assignment.identificationStatus] : ''
}
