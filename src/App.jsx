import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useGarageAuthStore } from './store/garageAuthStore';
import Sidebar from './components/Sidebar';
import GarageSidebar from './components/GarageSidebar';
import LoginPage from './pages/superadmin/LoginPage';
import DashboardPage from './pages/superadmin/DashboardPage';
import GaragesPage from './pages/superadmin/GaragesPage';
import GarageDetailPage from './pages/superadmin/GarageDetailPage';
import UsersPage from './pages/superadmin/UsersPage';
import AnalyticsPage from './pages/superadmin/AnalyticsPage';
import InventoryPage from './pages/superadmin/InventoryPage';
import PlansPage from './pages/superadmin/PlansPage';
import LogsPage from './pages/superadmin/LogsPage';
import ConfigPage from './pages/superadmin/ConfigPage';

// Garage owner pages
import GarageLoginPage from './pages/garage/LoginPage';
import GarageDashboardPage from './pages/garage/DashboardPage';
import GarageJobsPage from './pages/garage/JobsPage';
import GarageRevenuePage from './pages/garage/RevenuePage';
import GaragePaymentsPage from './pages/garage/PaymentsPage';
import GarageEmployeesPage from './pages/garage/EmployeesPage';
import GaragePerformancePage from './pages/garage/PerformancePage';
import GarageInventoryPage from './pages/garage/InventoryPage';
import GarageServicesPage from './pages/garage/ServicesPage';
import SetPasswordPage from './pages/garage/SetPasswordPage';

function ProtectedLayout() {
  const { token, user } = useAuthStore();
  if (!token || user?.role !== 'super_admin') {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

const GARAGE_ROLES = ['garage_owner', 'employee'];

function GarageOwnerLayout() {
  const { token, user } = useGarageAuthStore();
  if (!token || !GARAGE_ROLES.includes(user?.role)) {
    return <Navigate to="/garage/login" replace />;
  }
  return (
    <div className="flex min-h-screen">
      <GarageSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navbar */}
        <header className="h-14 flex items-center justify-end px-6 border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ background: '#E85D04' }}
            >
              {user?.name?.[0]?.toUpperCase() ?? 'G'}
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900 leading-tight">{user?.name ?? 'Garage Owner'}</div>
              <div className="text-xs text-gray-400">Garage Owner</div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Super admin routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/garages" element={<GaragesPage />} />
          <Route path="/garages/:id" element={<GarageDetailPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/config" element={<ConfigPage />} />
        </Route>

        {/* Garage owner routes */}
        <Route path="/garage/login" element={<GarageLoginPage />} />
        <Route path="/garage" element={<GarageOwnerLayout />}>
          <Route index element={<Navigate to="/garage/dashboard" replace />} />
          <Route path="dashboard" element={<GarageDashboardPage />} />
          <Route path="jobs" element={<GarageJobsPage />} />
          <Route path="revenue" element={<GarageRevenuePage />} />
          <Route path="payments" element={<GaragePaymentsPage />} />
          <Route path="employees" element={<GarageEmployeesPage />} />
          <Route path="performance" element={<GaragePerformancePage />} />
          <Route path="inventory" element={<GarageInventoryPage />} />
          <Route path="services" element={<GarageServicesPage />} />
        </Route>

        {/* Public employee onboarding */}
        <Route path="/set-password" element={<SetPasswordPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
