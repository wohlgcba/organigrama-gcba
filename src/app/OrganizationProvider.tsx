import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { CatalogContext } from './useCatalog'
import type { Store } from './useCatalog'
import { requireSupabase, supabase } from '../lib/supabase'
import { getAccess, getPeople, mustChangeInitialPassword } from '../services/catalog'
import { getMyDirectoryGate } from '../services/administration'
import { LoginPage } from '../pages/LoginPage'
import { PasswordChangeForm } from '../components/common/PasswordChangeForm'

const source = import.meta.env.VITE_ORGANIZATION_SOURCE ?? 'local'
const local = source === 'local' || source === 'mock'
export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(!local)
  const [data, setData] = useState<Store | null>(null)
  const [error, setError] = useState('')
  const [denied, setDenied] = useState(false)
  const [changePassword, setChangePassword] = useState(false)
  const [recovery, setRecovery] = useState(false)
  const [revision, setRevision] = useState(0)
  const signOut = async () => { const { error } = await requireSupabase().auth.signOut(); if (error) throw error }
  useEffect(() => {
    if (local || !supabase) return
    let alive = true, received = false
    const accept = (next: User | null) => { if (alive) { setUser(next); setChecking(false) } }
    void supabase.auth.getUser().then(({ data }) => { if (!received) accept(data.user) }).catch(() => { if (!received) accept(null) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      received = true
      accept(session?.user ?? null)
      if (!session?.user && alive) { setRecovery(false); setChangePassword(false); setData(null) }
      if (event === 'PASSWORD_RECOVERY' && alive) setRecovery(true)
    })
    return () => { alive = false; subscription.unsubscribe() }
  }, [])
  useEffect(() => {
    if (!user || local) return
    let alive = true
    setChecking(true); setData(null); setDenied(false); setError(''); setChangePassword(false)
    void (async () => {
      try {
        const gate = await getMyDirectoryGate()
        if (!alive) return
        if (gate && gate !== 'approved') { setDenied(true); return }
        if (await mustChangeInitialPassword()) { if (alive) setChangePassword(true); return }
        const access = await getAccess()
        if (!alive) return
        if (!access.personId && !access.isAdmin) { setDenied(true); return }
        const people = await getPeople()
        if (alive) setData({ user, people, isAdmin: access.isAdmin, signOut })
      } catch { if (alive) setError('No pudimos verificar el acceso al Organigrama.') }
      finally { if (alive) setChecking(false) }
    })()
    return () => { alive = false }
  }, [user, revision])
  if (local) return <CatalogContext.Provider value={{ user: null, people: [], isAdmin: false, signOut: async () => {} }}>{children}</CatalogContext.Provider>
  if (!supabase) return <div className="auth-screen"><div className="auth-card"><h1>Organigrama GCBA</h1><p>Configurá la URL y la clave publicable de Supabase, o usá VITE_ORGANIZATION_SOURCE=local.</p></div></div>
  if (recovery || changePassword) return <div className="auth-screen"><div className="auth-card"><h1>Actualizá tu contraseña</h1><PasswordChangeForm recovery={recovery} firstAccess={!recovery} onComplete={() => { setRecovery(false); setChangePassword(false); setRevision(v => v + 1) }} /><button className="btn btn-outline" onClick={() => void signOut()}>Cerrar sesión</button></div></div>
  if (checking) return <div className="auth-screen" role="status">Verificando acceso…</div>
  if (!user) return <LoginPage />
  if (denied || error) return <div className="auth-screen"><div className="auth-card"><h1>{denied ? 'Acceso no habilitado' : 'No se pudo conectar'}</h1><p>{error || 'Tu cuenta no tiene un perfil o rol habilitado para esta consulta.'}</p><div className="auth-actions"><button className="btn btn-outline" onClick={() => setRevision(v => v + 1)}>Reintentar</button><button className="btn btn-outline" onClick={() => void signOut()}>Cerrar sesión</button></div></div></div>
  if (!data || data.user?.id !== user.id) return <div className="auth-screen" role="status">Cargando Organigrama…</div>
  return <CatalogContext.Provider value={data}>{children}</CatalogContext.Provider>
}
