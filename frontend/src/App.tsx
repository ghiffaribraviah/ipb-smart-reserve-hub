import { Navigate, Route, Routes } from "react-router-dom";
import { RequireRole } from "./auth/session";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { StudentFacilityCatalogPage } from "./pages/student/StudentFacilityCatalogPage";
import { StudentFacilityDetailPage } from "./pages/student/StudentFacilityDetailPage";
import { StudentHomePage } from "./pages/student/StudentHomePage";
import {
  StudentApprovalLetterPage,
  StudentPaymentDeclinedPage,
  StudentPaymentPage,
  StudentPaymentWaitingPage,
  StudentReservationAcceptedPage,
  StudentVerificationDeclinedPage,
  StudentVerificationWaitingPage,
} from "./pages/student/StudentDocumentWorkflowPages";
import {
  StudentReservationDetailPage,
  StudentReservationTimePage,
} from "./pages/student/StudentReservationCreatePages";
import { StudentReservationListPage } from "./pages/student/StudentReservationListPage";
import { StudentReservationDetailReadOnlyPage } from "./pages/student/StudentReservationDetailReadOnlyPage";
import {
  StudentCancellationRequestPage,
  StudentProfilePage,
  StudentReviewPage,
} from "./pages/student/StudentReviewCancellationProfilePages";
import {
  StaffHomePage,
  StaffReservationListPage,
} from "./pages/staff/StaffReservationOperationsPages";
import {
  StaffReservationDetailPage,
  StaffReviewDecisionPage,
} from "./pages/staff/StaffReservationDetailDecisionPages";
import {
  StaffFacilityEditPage,
  StaffFacilityListPage,
  StaffFacilitySchedulePage,
} from "./pages/staff/StaffFacilityPages";
import {
  SuperAdminDashboardPage,
  SuperAdminFacilitiesPage,
  SuperAdminReportsPage,
  SuperAdminSystemPage,
  SuperAdminUsersPage,
} from "./pages/super-admin/SuperAdminDashboardUsersPages";
import { SmokePage } from "./pages/__harness__/SmokePage";
import { LayoutShellsPage } from "./pages/__reference__/LayoutShellsPage";
import { MobileDrawerPage } from "./pages/__reference__/MobileDrawerPage";
import { DataAuthStatesPage } from "./pages/__reference__/DataAuthStatesPage";
import { DataDisplayComponentsPage } from "./pages/__reference__/DataDisplayComponentsPage";
import { UploadCalendarStatesPage } from "./pages/__reference__/UploadCalendarStatesPage";
import { UiPrimitivesPage } from "./pages/__reference__/UiPrimitivesPage";
import { ReservationWorkflowComponentsPage } from "./pages/__reference__/ReservationWorkflowComponentsPage";

export function App() {
  return (
    <Routes>
      <Route element={<LoginPage />} path="/login" />
      <Route element={<RegisterPage />} path="/register" />
      <Route element={<RequireRole allow={["student"]}><StudentHomePage /></RequireRole>} path="/student" />
      <Route element={<RequireRole allow={["student"]}><StudentProfilePage /></RequireRole>} path="/student/profile" />
      <Route element={<RequireRole allow={["student"]}><StudentFacilityCatalogPage /></RequireRole>} path="/student/facilities" />
      <Route element={<RequireRole allow={["student"]}><StudentReservationListPage /></RequireRole>} path="/student/reservations" />
      <Route element={<RequireRole allow={["staff"]}><StaffHomePage /></RequireRole>} path="/staff" />
      <Route element={<RequireRole allow={["staff"]}><StaffReservationListPage /></RequireRole>} path="/staff/reservations" />
      <Route
        element={<RequireRole allow={["staff"]}><StaffReviewDecisionPage /></RequireRole>}
        path="/staff/reservations/:reservationId/review-decision"
      />
      <Route element={<RequireRole allow={["staff"]}><StaffReservationDetailPage /></RequireRole>} path="/staff/reservations/:reservationId" />
      <Route element={<RequireRole allow={["staff"]}><StaffFacilityListPage /></RequireRole>} path="/staff/facilities" />
      <Route element={<RequireRole allow={["staff"]}><StaffFacilityEditPage /></RequireRole>} path="/staff/facilities/:facilityId/edit" />
      <Route
        element={<RequireRole allow={["staff"]}><StaffFacilitySchedulePage /></RequireRole>}
        path="/staff/facilities/:facilityId/schedule"
      />
      <Route element={<RequireRole allow={["super_admin"]}><SuperAdminDashboardPage /></RequireRole>} path="/super-admin" />
      <Route element={<RequireRole allow={["super_admin"]}><SuperAdminUsersPage /></RequireRole>} path="/super-admin/users" />
      <Route element={<RequireRole allow={["super_admin"]}><SuperAdminFacilitiesPage /></RequireRole>} path="/super-admin/facilities" />
      <Route element={<RequireRole allow={["super_admin"]}><SuperAdminReportsPage /></RequireRole>} path="/super-admin/reports" />
      <Route element={<RequireRole allow={["super_admin"]}><SuperAdminSystemPage /></RequireRole>} path="/super-admin/system" />
      <Route element={<RequireRole allow={["student"]}><StudentApprovalLetterPage /></RequireRole>} path="/student/reservations/:reservationId/letter" />
      <Route element={<RequireRole allow={["student"]}><StudentPaymentPage /></RequireRole>} path="/student/reservations/:reservationId/payment" />
      <Route
        element={<RequireRole allow={["student"]}><StudentPaymentWaitingPage /></RequireRole>}
        path="/student/reservations/:reservationId/payment/waiting"
      />
      <Route
        element={<RequireRole allow={["student"]}><StudentPaymentDeclinedPage /></RequireRole>}
        path="/student/reservations/:reservationId/payment/declined"
      />
      <Route
        element={<RequireRole allow={["student"]}><StudentReservationAcceptedPage /></RequireRole>}
        path="/student/reservations/:reservationId/accepted"
      />
      <Route
        element={<RequireRole allow={["student"]}><StudentVerificationWaitingPage /></RequireRole>}
        path="/student/reservations/:reservationId/verification/waiting"
      />
      <Route
        element={<RequireRole allow={["student"]}><StudentVerificationDeclinedPage /></RequireRole>}
        path="/student/reservations/:reservationId/verification/declined"
      />
      <Route
        element={<RequireRole allow={["student"]}><StudentReviewPage /></RequireRole>}
        path="/student/reservations/:reservationId/review"
      />
      <Route
        element={<RequireRole allow={["student"]}><StudentCancellationRequestPage /></RequireRole>}
        path="/student/reservations/:reservationId/cancellation"
      />
      <Route
        element={<RequireRole allow={["student"]}><StudentCancellationRequestPage /></RequireRole>}
        path="/student/reservations/:reservationId/cancellation-request"
      />
      <Route
        element={<RequireRole allow={["student"]}><StudentReservationDetailReadOnlyPage /></RequireRole>}
        path="/student/reservations/:reservationId"
      />
      <Route
        element={<RequireRole allow={["student"]}><StudentReservationDetailPage /></RequireRole>}
        path="/student/facilities/:facilityId/reserve/details"
      />
      <Route
        element={<RequireRole allow={["student"]}><StudentReservationTimePage /></RequireRole>}
        path="/student/facilities/:facilityId/reserve/time"
      />
      <Route element={<RequireRole allow={["student"]}><StudentFacilityDetailPage /></RequireRole>} path="/student/facilities/:facilityId" />
      <Route element={<SmokePage />} path="/__harness__/smoke" />
      <Route element={<DataAuthStatesPage />} path="/__reference__/data-auth-states" />
      <Route element={<DataDisplayComponentsPage />} path="/__reference__/data-display-components" />
      <Route element={<LayoutShellsPage />} path="/__reference__/layout-shells" />
      <Route element={<MobileDrawerPage />} path="/__reference__/mobile-drawer" />
      <Route
        element={<ReservationWorkflowComponentsPage />}
        path="/__reference__/reservation-workflow-components"
      />
      <Route
        element={<UploadCalendarStatesPage />}
        path="/__reference__/upload-calendar-states"
      />
      <Route element={<UiPrimitivesPage />} path="/__reference__/ui-primitives" />
      <Route element={<Navigate replace to="/__harness__/smoke" />} path="*" />
    </Routes>
  );
}
