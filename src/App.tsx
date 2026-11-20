import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import './components/directory/directory.css'

const Chart = lazy(() => import('./pages/OrganizationChartPage').then(m => ({ default: m.OrganizationChartPage })))
function Shell() {
  return <div className="app-shell"><main><Outlet /></main></div>
}
export default function App() {
  return <BrowserRouter><Suspense fallback={<p role="status">Cargando Organigrama…</p>}><Routes><Route element={<Shell />}><Route path="organigrama" element={<Chart />} /><Route path="*" element={<Navigate to="/organigrama" replace />} /></Route></Routes></Suspense></BrowserRouter>
}
