export type AuthorityStatus = 'automatic' | 'manual' | 'pending' | 'vacant' | 'unidentified' | 'not_applicable'
export interface OrganizationUnit {
  id: string
  parentId: string | null
  name: string
  type: string
  code: string | null
  responsibilityPending?: boolean
  identificationStatus?: AuthorityStatus
  identificationReason?: string
  referenceDate?: string
  aliases?: string[]
  proposedName?: string
  nameEvidence?: string
}

export interface OrganizationResponsibility {
  id: string
  unitId: string
  name: string
  role: string
  identificationStatus?: AuthorityStatus
  administrativeRole?: string
  confidence?: 'high' | 'medium' | 'low'
  method?: string
  source?: string
  sourcePeriod?: string
  sourceDate?: string
  checkedAt?: string
  validFrom?: string
  validUntil?: string
  evidenceCurrent?: boolean
  evidenceUntil?: string
  validityBasis?: string
}

export interface OrganizationDataset {
  source: 'local' | 'mock' | 'supabase'
  units: OrganizationUnit[]
  responsibilities: OrganizationResponsibility[]
  responsibleCount: number
}
