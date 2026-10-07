import { createBrowserRouter, Navigate } from 'react-router'
import PublicLayout from '../layouts/PublicLayout'
import ErrorPage from '../pages/ErrorPage'
import HomePage from '../pages/HomePage'
import NotFoundPage from '../pages/NotFoundPage'
import { RouteFallback } from '../components/layout/RouteFallback'

/**
 * Route table. The home page ships in the main bundle for a fast first paint;
 * every other page — and the entire admin panel — is code-split.
 */
const lazyPage = (loader, exportName = 'default') => async () => {
  const mod = await loader()
  return { Component: mod[exportName] }
}

const sectionPages = () => import('../pages/SectionPages')

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    errorElement: <ErrorPage />,
    hydrateFallbackElement: <RouteFallback />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', lazy: lazyPage(sectionPages, 'AboutPage') },
      { path: 'skills', lazy: lazyPage(sectionPages, 'SkillsPage') },
      { path: 'experience', lazy: lazyPage(sectionPages, 'ExperiencePage') },
      { path: 'services', lazy: lazyPage(sectionPages, 'ServicesPage') },
      { path: 'resume', lazy: lazyPage(sectionPages, 'ResumePage') },
      { path: 'contact', lazy: lazyPage(sectionPages, 'ContactPage') },
      { path: 'projects', lazy: lazyPage(() => import('../pages/ProjectsPage')) },
      { path: 'projects/:slug', lazy: lazyPage(() => import('../pages/ProjectDetailPage')) },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/admin',
    errorElement: <ErrorPage />,
    hydrateFallbackElement: <RouteFallback />,
    lazy: lazyPage(() => import('../admin/AdminRoot')),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'login', lazy: lazyPage(() => import('../admin/pages/LoginPage')) },
      {
        lazy: lazyPage(() => import('../admin/layout/AdminLayout')),
        children: [
          { path: 'dashboard', lazy: lazyPage(() => import('../admin/pages/DashboardPage')) },
          { path: 'projects', lazy: lazyPage(() => import('../admin/pages/ProjectsListPage')) },
          { path: 'projects/create', lazy: lazyPage(() => import('../admin/pages/ProjectFormPage')) },
          { path: 'projects/:id/edit', lazy: lazyPage(() => import('../admin/pages/ProjectFormPage')) },
          { path: 'technologies', lazy: lazyPage(() => import('../admin/pages/TechnologiesPage')) },
          { path: 'experience', lazy: lazyPage(() => import('../admin/pages/ExperiencePage')) },
          { path: 'services', lazy: lazyPage(() => import('../admin/pages/ServicesPage')) },
          { path: 'messages', lazy: lazyPage(() => import('../admin/pages/MessagesPage')) },
          { path: 'resume', lazy: lazyPage(() => import('../admin/pages/ResumePage')) },
          { path: 'profile', lazy: lazyPage(() => import('../admin/pages/ProfilePage')) },
          { path: 'settings', lazy: lazyPage(() => import('../admin/pages/SettingsPage')) },
          { path: 'landing', lazy: lazyPage(() => import('../admin/pages/LandingPage')) },
          { path: 'seo', lazy: lazyPage(() => import('../admin/pages/SeoPage')) },
          { path: '*', lazy: lazyPage(() => import('../admin/pages/AdminNotFound')) },
        ],
      },
    ],
  },
])
