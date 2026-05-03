import { createBrowserRouter, Navigate } from "react-router-dom";
import { ReactNode, Suspense, lazy } from "react";

import { Login } from "./pages/Login.tsx";
import { ForgotPassword } from "./pages/ForgotPassword.tsx";
import { Register } from "./pages/Register.tsx";
import { NotFound } from "./pages/NotFound.tsx";
import { ErrorBoundary } from "./pages/ErrorBoundary.tsx";
import { Profile } from "./pages/Profile.tsx";
import { Community } from "./pages/Community.tsx";
import { InternalChatPage } from "./pages/shared/InternalChatPage.tsx";

import { OwnerDashboard } from "./pages/owner/OwnerDashboard.tsx";
import { RegisterVehicle } from "./pages/owner/RegisterVehicle.tsx";
import { BrowseParkingLots } from "./pages/owner/BrowseParkingLots.tsx";
import { ParkingLotDetails } from "./pages/owner/ParkingLotDetails.tsx";
import { ParkingZoneSelection } from "./pages/owner/ParkingZoneSelection.tsx";
import { VehicleTypeSelection } from "./pages/owner/VehicleTypeSelection.tsx";
import { SpotSelection } from "./pages/owner/SpotSelection.tsx";
import { VehicleStatus } from "./pages/owner/VehicleStatus.tsx";
import { ParkingRegistration } from "./pages/owner/ParkingRegistration.tsx";
import { TopUpCoins } from "./pages/owner/TopUpCoins.tsx";
import { VehicleEntryExitLog as OwnerVehicleEntryExitLog } from "./pages/owner/VehicleEntryExitLog.tsx";

import { SupervisorDashboard } from "./pages/supervisor/SupervisorDashboard.tsx";
import { GateManagement } from "./pages/supervisor/GateManagement.tsx";
import { DualGateMonitoring } from "./pages/supervisor/DualGateMonitoring.tsx";
import { SuspiciousVehicles } from "./pages/supervisor/SuspiciousVehicles.tsx";
import { SuspiciousHistory } from "./pages/supervisor/SuspiciousHistory.tsx";
import { ShiftManagement } from "./pages/supervisor/ShiftManagement.tsx";
import { VehicleEntryExitLog as SupervisorVehicleEntryExitLog } from "./pages/supervisor/VehicleEntryExitLog.tsx";
import { SupervisorProfile } from "./pages/supervisor/SupervisorProfile.tsx";

import { SupportStaffDashboard } from "./pages/support/SupportStaffDashboard.tsx";
import { SupportProfile } from './pages/support/SupportProfile.tsx';

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.tsx").then(module => ({ default: module.AdminDashboard })));
import { ParkingLotConfig } from "./pages/admin/ParkingLotConfig.tsx";
import { Statistics } from "./pages/admin/Statistics.tsx";
import { ServiceSubscription } from "./pages/admin/ServiceSubscription.tsx";
import { CommunityModeration } from "./pages/admin/CommunityModeration.tsx";
import { ShiftVideoLogs } from "./pages/admin/ShiftVideoLogs.tsx";
import { StaffManagement } from "./pages/admin/StaffManagement.tsx";
import { MyParkingLots } from "./pages/admin/MyParkingLots.tsx";
import { ServiceRegistration } from "./pages/admin/ServiceRegistration.tsx";
import { CameraManagement } from "./pages/admin/CameraManagement.tsx";

import { ProviderDashboard } from "./pages/provider/ProviderDashboard.tsx";
import { VirtualCoinSettings } from "./pages/provider/VirtualCoinSettings.tsx";
import { ServiceManagement } from "./pages/provider/ServiceManagement.tsx";
import { DeviceManagement } from "./pages/provider/DeviceManagement.tsx";
import { AccountManagement } from "./pages/provider/AccountManagement.tsx";
import { ProviderStatistics } from "./pages/provider/ProviderStatistics.tsx";
import { SystemSettings } from "./pages/provider/SystemSettings.tsx";
import { PackageManagement } from "./pages/provider/PackageManagement.tsx";
import { MaintenanceSchedule } from "./pages/provider/MaintenanceSchedule.tsx";

import { CommunityFeed } from "./pages/community/CommunityFeed.tsx";
import { ParkingReviews } from "./pages/community/ParkingReviews.tsx";
import { TheftReportPage } from "./pages/community/TheftReportPage.tsx";
import { SupportPage } from "./pages/community/SupportPage.tsx";
import { CommunityChat } from "./pages/community/CommunityChat.tsx";
import { CoinGames } from "./pages/community/CoinGames.tsx";

import { ParkingLotEditPage, ParkingLotDetailsPage } from "./pages/admin/MyParkingLots.tsx";

import { ProtectedRoute } from "./components/ProtectedRoute.tsx";
import { AuthCallback } from "./pages/AuthCallback.tsx";
import { ResetUserPin } from "./pages/owner/ResetUserPin.tsx";
import { AdminPinSecurity } from "./pages/admin/AdminPinSecurity.tsx";
import { VehicleVerify } from "./pages/provider/VehicleVerify.tsx";


const ALL_ROLES = ["owner", "supervisor", "admin", "provider", "support"];
const OWNER_ROLES = ["owner","supervisor","support"];
const SUPERVISOR_ROLES = ["supervisor"];
const SUPPORT_ROLES = ["support"];
const ADMIN_ROLES = ["admin"];
const PROVIDER_ROLES = ["provider"];

function Guard({
  allowedRoles,
  children,
}: {
  allowedRoles: string[];
  children: ReactNode;
}) {
  return <ProtectedRoute allowedRoles={allowedRoles}>{children}</ProtectedRoute>;
}

export const router = createBrowserRouter([
  // Public
  {
    path: "/",
    element: <Register />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/register",
    element: <Register />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/login",
    element: <Login />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
    errorElement: <ErrorBoundary />,
  },
  {
  path: "/auth/callback",
  element: <AuthCallback />,
  errorElement: <ErrorBoundary />,
},

  // Shared pages: ai đăng nhập cũng vào được
  {
    path: "/profile",
    element: (
      <Guard allowedRoles={ALL_ROLES}>
        <Profile />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/community",
    element: (
      <Guard allowedRoles={ALL_ROLES}>
        <Community />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/community/feed",
    element: (
      <Guard allowedRoles={ALL_ROLES}>
        <CommunityFeed />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/community/reviews",
    element: (
      <Guard allowedRoles={ALL_ROLES}>
        <ParkingReviews />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/community/theft",
    element: (
      <Guard allowedRoles={ALL_ROLES}>
        <TheftReportPage />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/community/chat",
    element: (
      <Guard allowedRoles={ALL_ROLES}>
        <CommunityChat />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/community/coin-games",
    element: (
      <Guard allowedRoles={ALL_ROLES}>
        <CoinGames />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/community/support",
    element: (
      <Guard allowedRoles={ALL_ROLES}>
        <SupportPage />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/internal-chat",
    element: (
      <Guard allowedRoles={ALL_ROLES}>
        <InternalChatPage />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
{
  path: "/reset-user-pin",
  element: (
  <Guard allowedRoles={ALL_ROLES}>
  <ResetUserPin />
  </Guard>
  ),errorElement: <ErrorBoundary />,
},

  // Owner
  {
    path: "/owner",
    element: (
      <Guard allowedRoles={OWNER_ROLES}>
        <OwnerDashboard />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/owner/register-vehicle",
    element: (
      <Guard allowedRoles={OWNER_ROLES}>
        <RegisterVehicle />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/owner/parking-lots",
    element: (
      <Guard allowedRoles={ALL_ROLES}>
        <BrowseParkingLots />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/owner/parking-lot/:id",
    element: (
      <Guard allowedRoles={ALL_ROLES}>
        <ParkingLotDetails />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/owner/parking/:lotId/zones",
    element: (
      <Guard allowedRoles={OWNER_ROLES}>
        <ParkingZoneSelection />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/owner/parking/:lotId/zone/:zoneId/select-vehicle",
    element: (
      <Guard allowedRoles={OWNER_ROLES}>
        <VehicleTypeSelection />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/owner/parking/:lotId/zone/:zoneId/vehicle/:vehicleId/select-spot",
    element: (
      <Guard allowedRoles={OWNER_ROLES}>
        <SpotSelection />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/owner/vehicle-status",
    element: (
      <Guard allowedRoles={OWNER_ROLES}>
        <VehicleStatus />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/owner/parking-registration",
    element: (
      <Guard allowedRoles={OWNER_ROLES}>
        <ParkingRegistration />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/owner/topup",
    element: (
      <Guard allowedRoles={OWNER_ROLES}>
        <TopUpCoins />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/owner/vehicle-logs",
    element: (
      <Guard allowedRoles={OWNER_ROLES}>
        <OwnerVehicleEntryExitLog />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },

  // Supervisor
  {
    path: "/supervisor",
    element: (
      <Guard allowedRoles={SUPERVISOR_ROLES}>
        <SupervisorDashboard />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/supervisor/gate",
    element: (
      <Guard allowedRoles={SUPERVISOR_ROLES}>
        <GateManagement />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/supervisor/dual-gate",
    element: (
      <Guard allowedRoles={SUPERVISOR_ROLES}>
        <DualGateMonitoring />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/supervisor/suspicious-vehicles",
    element: (
      <Guard allowedRoles={SUPERVISOR_ROLES}>
        <SuspiciousVehicles />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/supervisor/suspicious-history",
    element: (
      <Guard allowedRoles={SUPERVISOR_ROLES}>
        <SuspiciousHistory />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/supervisor/shift",
    element: (
      <Guard allowedRoles={SUPERVISOR_ROLES}>
        <ShiftManagement />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/supervisor/vehicle-logs",
    element: (
      <Guard allowedRoles={SUPERVISOR_ROLES}>
        <SupervisorVehicleEntryExitLog />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/supervisor/profile",
    element: (
      <Guard allowedRoles={SUPERVISOR_ROLES}>
        <SupervisorProfile />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },

  // Support
  {
    path: "/support",
    element: (
      <Guard allowedRoles={SUPPORT_ROLES}>
        <SupportStaffDashboard />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/support/profile",
    element: (
      <Guard allowedRoles={SUPPORT_ROLES}>
        <SupportProfile />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },

  // Admin
  {
  path: "/admin/pin-security",
  element: (
    <Guard allowedRoles={ADMIN_ROLES}>
      <AdminPinSecurity />
    </Guard>
  ),
  errorElement: <ErrorBoundary />,
},
  {
    path: "/admin",
    element: (
      <Guard allowedRoles={ADMIN_ROLES}>
        <AdminDashboard />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/admin/parking-config",
    element: (
      <Guard allowedRoles={ADMIN_ROLES}>
        <ParkingLotConfig />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/admin/statistics",
    element: (
      <Guard allowedRoles={ADMIN_ROLES}>
        <Statistics />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/admin/service-subscription",
    element: (
      <Guard allowedRoles={ADMIN_ROLES}>
        <ServiceSubscription />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/admin/community-moderation",
    element: (
      <Guard allowedRoles={ADMIN_ROLES}>
        <CommunityModeration />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/admin/video-logs",
    element: (
      <Guard allowedRoles={ADMIN_ROLES}>
        <ShiftVideoLogs />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/admin/staff-management",
    element: (
      <Guard allowedRoles={ADMIN_ROLES}>
        <StaffManagement />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/admin/my-parking-lots",
    element: (
      <Guard allowedRoles={ADMIN_ROLES}>
        <MyParkingLots />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/admin/service-registration",
    element: (
      <Guard allowedRoles={ADMIN_ROLES}>
        <ServiceRegistration />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/admin/camera-management",
    element: (
      <Guard allowedRoles={ADMIN_ROLES}>
        <CameraManagement />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/admin/parking-lot/:id/edit",
    element: (
      <Guard allowedRoles={ADMIN_ROLES}>
        <ParkingLotEditPage />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/admin/parking-lot/:id/details",
    element: (
      <Guard allowedRoles={ADMIN_ROLES}>
        <ParkingLotDetailsPage />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },

  // Provider
  {
    path: "/provider",
    element: (
      <Guard allowedRoles={PROVIDER_ROLES}>
        <ProviderDashboard />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/provider/coin-settings",
    element: (
      <Guard allowedRoles={PROVIDER_ROLES}>
        <VirtualCoinSettings />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/provider/services",
    element: (
      <Guard allowedRoles={PROVIDER_ROLES}>
        <ServiceManagement />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/provider/devices",
    element: (
      <Guard allowedRoles={PROVIDER_ROLES}>
        <DeviceManagement />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/provider/accounts",
    element: (
      <Guard allowedRoles={PROVIDER_ROLES}>
        <AccountManagement />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/provider/statistics",
    element: (
      <Guard allowedRoles={PROVIDER_ROLES}>
        <ProviderStatistics />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/provider/system-settings",
    element: (
      <Guard allowedRoles={PROVIDER_ROLES}>
        <SystemSettings />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/provider/package-management",
    element: (
      <Guard allowedRoles={PROVIDER_ROLES}>
        <PackageManagement />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/provider/maintenance-schedule",
    element: (
      <Guard allowedRoles={PROVIDER_ROLES}>
        <MaintenanceSchedule />
      </Guard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
  path: "/provider/vehicle-verify",
  element: (
    <Guard allowedRoles={PROVIDER_ROLES}>
      <VehicleVerify />
    </Guard>
  ),
  errorElement: <ErrorBoundary />,
},

  // Not found / unauthorized
  {
    path: "/not-found",
    element: <NotFound />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "*",
    element: <Navigate to="/not-found" replace />,
  },
]);