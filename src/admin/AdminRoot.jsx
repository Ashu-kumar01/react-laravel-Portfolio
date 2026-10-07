import { Outlet } from 'react-router'
import { useSeo } from '../hooks/useSeo'

/** Root of the lazily-loaded admin bundle. Admin pages are never indexed. */
export default function AdminRoot() {
  useSeo({ title: 'Admin', noindex: true })
  return <Outlet />
}
