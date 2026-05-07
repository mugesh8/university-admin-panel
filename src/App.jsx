import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell.jsx'
import { AuthProvider } from './features/auth/AuthContext.jsx'
import { SettingsStoreProvider } from './hooks/useSettingsStore.js'
import { useAuth } from './features/auth/useAuth.js'
import { LoginPage } from './features/auth/LoginPage.jsx'
import { SuperAdminSignupPage } from './features/auth/SuperAdminSignupPage.jsx'
import { ProtectedRoute } from './features/auth/ProtectedRoute.jsx'
import { PermissionRoute } from './features/auth/PermissionRoute.jsx'
import { ApplicationDetailPage } from './features/applications/ApplicationDetailPage.jsx'
import { ApplicationsLayout } from './features/applications/ApplicationsLayout.jsx'
import { AdminCreateApplicationPage } from './features/applications/AdminCreateApplicationPage.jsx'
import { ApplicationsListPage } from './features/applications/ApplicationsListPage.jsx'
import { DraftApplicationsPage } from './features/applications/DraftApplicationsPage.jsx'
import { DraftDetailPage } from './features/applications/DraftDetailPage.jsx'
import { DocumentsPage } from './features/applications/DocumentsPage.jsx'
import { EnrolledStudentsPage } from './features/applications/EnrolledStudentsPage.jsx'
import { InterviewsPage } from './features/applications/InterviewsPage.jsx'
import { PaymentsPage } from './features/applications/PaymentsPage.jsx'
import { AnnouncementsPage } from './features/announcements/AnnouncementsPage.jsx'
import { BulkMessagesPage } from './features/communications/BulkMessagesPage.jsx'
import { CommunicationsLayout } from './features/communications/CommunicationsLayout.jsx'
import { ComposeEmailPage } from './features/communications/ComposeEmailPage.jsx'
import { EmailTemplatesPage } from './features/communications/EmailTemplatesPage.jsx'
import { DashboardPage } from './features/dashboard/DashboardPage.jsx'
import { FaqCategoriesPage } from './features/faq/FaqCategoriesPage.jsx'
import { FaqPage } from './features/faq/FaqPage.jsx'
import { ReportsPage } from './features/reporting/ReportsPage.jsx'
import { SupportTicketCategoriesPage } from './features/support/SupportTicketCategoriesPage.jsx'
import { SupportTicketsPage } from './features/support/SupportTicketsPage.jsx'
import { AccountPage } from './features/settings/AccountPage.jsx'
import { DocRequirementsPage } from './features/settings/DocRequirementsPage.jsx'
import { DropdownOptionsPage } from './features/settings/DropdownOptionsPage.jsx'
import { FeeStructurePage } from './features/settings/FeeStructurePage.jsx'
import { IntakesPage } from './features/settings/IntakesPage.jsx'
import { PipelineStagesPage } from './features/settings/PipelineStagesPage.jsx'
import { ProgramsPage } from './features/settings/ProgramsPage.jsx'
import { SettingsLayout } from './features/settings/SettingsLayout.jsx'
import { RolesPermissionsPage } from './features/roles-permission/RolesPermissionsPage.jsx'
function LoginGate() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <LoginPage />
}

function SuperAdminSignupGate() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <SuperAdminSignupPage />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginGate />} />
      <Route path="/superadmin/signup" element={<SuperAdminSignupGate />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route
          path="settings"
          element={
            <PermissionRoute moduleId="settings" action="read">
              <SettingsLayout />
            </PermissionRoute>
          }
        >
          <Route index element={<ProgramsPage />} />
          <Route path="intakes" element={<IntakesPage />} />
          <Route path="fee-structure" element={<FeeStructurePage />} />
          <Route path="doc-requirements" element={<DocRequirementsPage />} />
          <Route path="pipeline-stages" element={<PipelineStagesPage />} />
          <Route path="dropdown-options" element={<DropdownOptionsPage />} />
        </Route>
        <Route
          path="applications"
          element={
            <PermissionRoute moduleId="applications" action="read">
              <ApplicationsLayout />
            </PermissionRoute>
          }
        >
          <Route index element={<ApplicationsListPage />} />
          <Route path="new" element={<AdminCreateApplicationPage />} />
          <Route path="drafts" element={<DraftApplicationsPage />} />
          <Route path="drafts/:draftId" element={<DraftDetailPage />} />
          <Route path="interviews" element={<InterviewsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="enrolled-students" element={<EnrolledStudentsPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path=":id" element={<ApplicationDetailPage />} />
        </Route>
        <Route
          path="communications"
          element={
            <PermissionRoute moduleId="communications" action="read">
              <CommunicationsLayout />
            </PermissionRoute>
          }
        >
          <Route index element={<ComposeEmailPage />} />
          <Route path="templates" element={<EmailTemplatesPage />} />
          <Route path="bulk-messages" element={<BulkMessagesPage />} />
        </Route>
        <Route path="reports" element={<ReportsPage />} />
        <Route
          path="announcements"
          element={
            <PermissionRoute moduleId="announcements" action="read">
              <AnnouncementsPage />
            </PermissionRoute>
          }
        />
        <Route
          path="faq"
          element={
            <PermissionRoute moduleId="faq" action="read">
              <FaqPage />
            </PermissionRoute>
          }
        />
        <Route
          path="faq/categories"
          element={
            <PermissionRoute moduleId="faq" action="read">
              <FaqCategoriesPage />
            </PermissionRoute>
          }
        />
        <Route
          path="support-tickets"
          element={
            <PermissionRoute moduleId="support_tickets" action="read">
              <SupportTicketsPage />
            </PermissionRoute>
          }
        />
        <Route
          path="support-tickets/categories"
          element={
            <PermissionRoute moduleId="support_tickets" action="read">
              <SupportTicketCategoriesPage />
            </PermissionRoute>
          }
        />
        <Route
          path="roles-permissions"
          element={
            <PermissionRoute moduleId="roles_permissions" action="read">
              <RolesPermissionsPage />
            </PermissionRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsStoreProvider>
        <AppRoutes />
      </SettingsStoreProvider>
    </AuthProvider>
  )
}
