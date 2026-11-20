import { Landmark, Network, UsersRound } from 'lucide-react'

export function OrganizationHeader({ statistics }: { statistics?: { roots: number; units: number; responsible: number } }) {
  return <header className="organization-header">
    <div className="organization-header-copy"><h1>ORGANIGRAMA GCBA</h1><p>Explorá la estructura institucional y navegá desde organismos y áreas rectoras hasta sus direcciones, gerencias y subgerencias.</p></div>
    <dl className="organization-header-statistics" aria-label="Resumen del Organigrama">{[
      { label: 'Organismos', description: 'Organismos / Áreas rectoras', value: statistics?.roots, Icon: Landmark },
      { label: 'Dependencias', description: 'Dependencias relevadas', value: statistics?.units, Icon: Network },
      { label: 'Responsables', description: 'Responsables identificados', value: statistics?.responsible, Icon: UsersRound },
    ].map(({ label, description, value, Icon }) => <div className="organization-header-stat" key={label} title={description}><Icon size={25} aria-hidden="true" /><div><dt>{label}</dt><dd>{value == null ? '—' : value.toLocaleString('es-AR')}</dd></div></div>)}</dl>
  </header>
}
