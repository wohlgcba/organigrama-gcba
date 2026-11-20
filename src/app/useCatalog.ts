import { createContext, useContext } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Person } from '../types'

export interface Store { user: User | null; people: Person[]; isAdmin: boolean; signOut: () => Promise<void> }
export const CatalogContext = createContext<Store | null>(null)
export function useCatalog() {
  const context = useContext(CatalogContext)
  if (!context) throw new Error('CatalogProvider ausente')
  return context
}
