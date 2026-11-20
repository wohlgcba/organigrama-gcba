import { Avatar } from '../common/Avatar'
import type { AuthorityStatus, OrganizationResponsibility } from '../../types/organization'
import { assignmentLabel, authorityPlaceholder } from '../../utils/organizationAuthority'

export function OrganizationResponsibleCard({ assignment, pending = false, identificationStatus, unitName, direct }: {
  assignment?: OrganizationResponsibility; pending?: boolean; identificationStatus?: AuthorityStatus; reason?: string; unitName: string; direct: boolean
}) {
  return <article className="organization-responsible-card">
    <Avatar name={assignment?.name} size={44} />
    <div className="organization-responsible-info"><strong>{assignment?.name ?? authorityPlaceholder({ identificationStatus, responsibilityPending: pending })}</strong>
      {assignment && <p>{assignment.role}</p>}
      {assignment?.identificationStatus && <small>{assignmentLabel(assignment)}</small>}
      {assignment?.source && <small>Fuente: {assignment.source}{assignment.sourcePeriod ? ` · ${assignment.sourcePeriod}` : ''}{assignment.sourceDate ? ` · ${assignment.sourceDate}` : ''}</small>}
      {assignment?.checkedAt && <small>Última conciliación: {assignment.checkedAt}</small>}
      {assignment?.administrativeRole && assignment.administrativeRole !== assignment.role && <small>Clasificación administrativa: {assignment.administrativeRole}</small>}
      <small className="organization-responsible-origin">{direct ? 'Responsable directo' : 'Unidad dependiente'} · {unitName}</small>
    </div>
  </article>
}
