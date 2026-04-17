import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell.jsx'
import { AuthProvider } from './features/auth/AuthContext.jsx'
import { useAuth } from './features/auth/useAuth.js'
import { LoginPage } from './features/auth/LoginPage.jsx'
import { ProtectedRoute } from './features/auth/ProtectedRoute.jsx'
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
import { FaqPage } from './features/faq/FaqPage.jsx'
import { ReportsPage } from './features/reporting/ReportsPage.jsx'
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

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginGate />} />
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
        <Route path="settings" element={<SettingsLayout />}>
          <Route index element={<ProgramsPage />} />
          <Route path="intakes" element={<IntakesPage />} />
          <Route path="fee-structure" element={<FeeStructurePage />} />
          <Route path="doc-requirements" element={<DocRequirementsPage />} />
          <Route path="pipeline-stages" element={<PipelineStagesPage />} />
          <Route path="dropdown-options" element={<DropdownOptionsPage />} />
        </Route>
        <Route path="applications" element={<ApplicationsLayout />}>
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
        <Route path="communications" element={<CommunicationsLayout />}>
          <Route index element={<ComposeEmailPage />} />
          <Route path="templates" element={<EmailTemplatesPage />} />
          <Route path="bulk-messages" element={<BulkMessagesPage />} />
        </Route>
        <Route path="reports" element={<ReportsPage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="faq" element={<FaqPage />} />
        <Route path="support-tickets" element={<SupportTicketsPage />} />
        <Route path="roles-permissions" element={<RolesPermissionsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
