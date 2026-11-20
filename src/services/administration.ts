import { requireSupabase, SCHEMA } from '../lib/supabase'

export class AdministrationUnavailable extends Error {}
async function rpc<T>(name: string, args: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await requireSupabase().schema(SCHEMA).rpc(name, args)
  if (error) {
    if (/JWT issued at future/i.test(error.message)) throw new Error('JWT issued at future')
    if (['PGRST202', '42883'].includes(error.code)) throw new AdministrationUnavailable('La Administración del Directorio requiere activar la migración local de Supabase. No se realizaron cambios remotos.')
    if (error.code === '40001') throw new Error('Otro administrador modificó este registro. Actualizá la revisión antes de decidir.')
    if (error.code === '42501') throw new Error('Tu cuenta no tiene permisos para realizar esta operación.')
    if (['22023', '23505', '23503', 'P0001'].includes(error.code)) throw new Error(error.message.replace(/[0-9]{11}/g, '[identificador protegido]'))
    throw new Error('No pudimos completar la operación. Reintentá en unos momentos.')
  }
  return data as T
}
export async function getMyDirectoryGate(): Promise<string | null> {
  try { return await rpc<string | null>('get_my_directory_gate') } catch (error) { if (error instanceof AdministrationUnavailable) return null; throw error }
}