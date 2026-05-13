import { Navigate, Route, Routes } from "react-router-dom";
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
      <Route element={<StudentHomePage />} path="/student" />
      <Route element={<StudentProfilePage />} path="/student/profile" />
      <Route element={<StudentFacilityCatalogPage />} path="/student/facilities" />
      <Route element={<StudentReservationListPage />} path="/student/reservations" />
      <Route element={<StaffHomePage />} path="/staff" />
      <Route element={<StaffReservationListPage />} path="/staff/reservations" />
      <Route
        element={<StaffReviewDecisionPage />}
        path="/staff/reservations/:reservationId/review-decision"
      />
      <Route element={<StaffReservationDetailPage />} path="/staff/reservations/:reservationId" />
      <Route element={<StaffFacilityListPage />} path="/staff/facilities" />
      <Route element={<StaffFacilityEditPage />} path="/staff/facilities/:facilityId/edit" />
      <Route
        element={<StaffFacilitySchedulePage />}
        path="/staff/facilities/:facilityId/schedule"
      />
      <Route element={<SuperAdminDashboardPage />} path="/super-admin" />
      <Route element={<SuperAdminUsersPage />} path="/super-admin/users" />
      <Route element={<SuperAdminFacilitiesPage />} path="/super-admin/facilities" />
      <Route element={<SuperAdminReportsPage />} path="/super-admin/reports" />
      <Route element={<SuperAdminSystemPage />} path="/super-admin/system" />
      <Route element={<StudentApprovalLetterPage />} path="/student/reservations/:reservationId/letter" />
      <Route element={<StudentPaymentPage />} path="/student/reservations/:reservationId/payment" />
      <Route
        element={<StudentPaymentWaitingPage />}
        path="/student/reservations/:reservationId/payment/waiting"
      />
      <Route
        element={<StudentPaymentDeclinedPage />}
        path="/student/reservations/:reservationId/payment/declined"
      />
      <Route
        element={<StudentReservationAcceptedPage />}
        path="/student/reservations/:reservationId/accepted"
      />
      <Route
        element={<StudentVerificationWaitingPage />}
        path="/student/reservations/:reservationId/verification/waiting"
      />
      <Route
        element={<StudentVerificationDeclinedPage />}
        path="/student/reservations/:reservationId/verification/declined"
      />
      <Route
        element={<StudentReviewPage />}
        path="/student/reservations/:reservationId/review"
      />
      <Route
        element={<StudentCancellationRequestPage />}
        path="/student/reservations/:reservationId/cancellation"
      />
      <Route
        element={<StudentCancellationRequestPage />}
        path="/student/reservations/:reservationId/cancellation-request"
      />
      <Route
        element={<StudentReservationDetailReadOnlyPage />}
        path="/student/reservations/:reservationId"
      />
      <Route
        element={<StudentReservationDetailPage />}
        path="/student/facilities/:facilityId/reserve/details"
      />
      <Route
        element={<StudentReservationTimePage />}
        path="/student/facilities/:facilityId/reserve/time"
      />
      <Route element={<StudentFacilityDetailPage />} path="/student/facilities/:facilityId" />
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
