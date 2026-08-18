import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PublicLayout } from '@/layouts/public-layout'
import { AppLayout } from '@/layouts/app-layout'
import { AdminLayout } from '@/layouts/admin-layout'
import { AdminRoute } from '@/components/auth/admin-route'
import { OAuthCallbackPage } from '@/pages/Auth/oauth-callback-page'
import { DashboardPage } from '@/pages/Dashboard/dashboard-page'
import { SubjectsPage } from '@/pages/Subjects/subjects-page'
import { SchedulePage } from '@/pages/Schedule/schedule-page'
import { StatisticsPage } from '@/pages/Statistics/statistics-page'
import { ReviewsPage } from '@/pages/Reviews/reviews-page'
import { SecondBrainPage } from '@/pages/SecondBrain/second-brain-page'
import { GamificationPage } from '@/pages/Gamification/gamification-page'
import { SettingsPage } from '@/pages/Settings/settings-page'
import { GroupsPage } from '@/pages/Groups/groups-page'
import { GroupDetailPage } from '@/pages/Groups/group-detail-page'
import { GroupInvitePage } from '@/pages/Groups/group-invite-page'
import { AdminDashboardPage } from '@/pages/Admin/admin-dashboard-page'
import { AdminUsersPage } from '@/pages/Admin/admin-users-page'
import { AdminOnlineUsersPage } from '@/pages/Admin/admin-online-users-page'
import { AdminUserDetailPage } from '@/pages/Admin/admin-user-detail-page'
import { AdminGroupsPage } from '@/pages/Admin/admin-groups-page'
import { AdminLogsPage } from '@/pages/Admin/admin-logs-page'
import { AdminErrorsPage } from '@/pages/Admin/admin-errors-page'
import { AdminMonitoringPage } from '@/pages/Admin/admin-monitoring-page'
import { AdminAlertsPage } from '@/pages/Admin/admin-alerts-page'
import { NotFoundPage } from '@/pages/NotFound/not-found-page'

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [{ path: '/oauth-callback', element: <OAuthCallbackPage /> }],
  },
  {
    path: '/',
    element: <Navigate to="/app" replace />,
  },
  {
    path: '/app',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'subjects', element: <SubjectsPage /> },
      { path: 'schedule', element: <SchedulePage /> },
      { path: 'statistics', element: <StatisticsPage /> },
      { path: 'reviews', element: <ReviewsPage /> },
      { path: 'brain', element: <SecondBrainPage /> },
      { path: 'brain/:noteId', element: <SecondBrainPage /> },
      { path: 'gamification', element: <GamificationPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'grupos', element: <GroupsPage /> },
      { path: 'grupos/:id', element: <GroupDetailPage /> },
      { path: 'convite/:code', element: <GroupInvitePage /> },
    ],
  },
  {
    element: <AdminRoute />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: 'users', element: <AdminUsersPage /> },
          { path: 'online', element: <AdminOnlineUsersPage /> },
          { path: 'users/:id', element: <AdminUserDetailPage /> },
          { path: 'groups', element: <AdminGroupsPage /> },
          { path: 'monitoring', element: <AdminMonitoringPage /> },
          { path: 'alerts', element: <AdminAlertsPage /> },
          { path: 'logs', element: <AdminLogsPage /> },
          { path: 'errors', element: <AdminErrorsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
