import { requireSupabase, SCHEMA } from '../lib/supabase'
import type { Person } from '../types'

type PersonRow = { id: string; given_name: string; family_name: string; position_title: string; ministry: string; secretariat: string | null; directorate: string | null; directorate_id: string | null; phone: string; email: string; advisory_topics: string | null; bio: string; version: number }

const db = () => requireSupabase().schema(SCHEMA)
const check = (error: { message: string } | null) => { if (error) throw new Error(error.message) }
const parseTopics = (value: string | null) => (value ?? '').split(/[;\n,]+/).map(item => item.trim()).filter(Boolean).slice(0, 8)

export async function getPeople(): Promise<Person[]> {
  const { data, error } = await db().from('people').select('id,given_name,family_name,position_title,ministry,secretariat,directorate,directorate_id,phone,email,advisory_topics,bio,version').eq('is_active', true).order('family_name')
  check(error)
  return ((data ?? []) as PersonRow[]).map(row => ({ id: row.id, name: `${row.given_name} ${row.family_name}`.trim(), givenName: row.given_name, familyName: row.family_name, role: row.position_title, directorate: row.directorate ?? '', directorateId: row.directorate_id, ministry: row.ministry, secretariat: row.secretariat ?? '', email: row.email, phone: row.phone, topics: parseTopics(row.advisory_topics), advisoryTopicsRaw: row.advisory_topics ?? '', bio: row.bio, avatar: 0, newsletterIds: [], version: row.version }))
}

export async function getAccess(): Promise<{ personId: string | null; isAdmin: boolean }> {
  const client = requireSupabase()
  const [person, admin] = await Promise.all([client.schema(SCHEMA).rpc('current_person_id'), client.schema(SCHEMA).rpc('is_admin')])
  check(person.error); check(admin.error)
  return { personId: typeof person.data === 'string' ? person.data : null, isAdmin: admin.data === true }
}

export async function mustChangeInitialPassword(): Promise<boolean> {
  const { data, error } = await db().rpc('get_my_account_status')
  check(error)
  return Array.isArray(data) && data.some(row => row.must_change_password === true)
}

