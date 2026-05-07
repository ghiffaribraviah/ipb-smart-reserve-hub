import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./lib/auth-context";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { StudentShell } from "./pages/StudentShell";
import { FacilitiesPage } from "./pages/FacilitiesPage";
import { FacilityDetailPage } from "./pages/FacilityDetailPage";
import { ReservationTimeSelectionPage } from "./pages/ReservationTimeSelectionPage";
import { ReservationDetailsPage } from "./pages/ReservationDetailsPage";

function Placeholder({ label }: { label: string }) {
  return <p>{label}</p>;
}

export function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/student"
            element={
              <ProtectedRoute>
                <StudentShell />
              </ProtectedRoute>
            }
          >
            <Route path="facilities" element={<FacilitiesPage />} />
            <Route path="facilities/:facilityId" element={<FacilityDetailPage />} />
            <Route path="facilities/:facilityId/reserve/time" element={<ReservationTimeSelectionPage />} />
            <Route path="facilities/:facilityId/reserve/details" element={<ReservationDetailsPage />} />
            <Route path="facilities/:facilityId/reserve/confirm" element={<Placeholder label="Konfirmasi" />} />
            <Route path="reservations/:reservationId" element={<Placeholder label="Detail Reservasi" />} />
          </Route>

          <Route
            path="/staff/*"
            element={
              <ProtectedRoute>
                <Placeholder label="Staff Shell" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <Placeholder label="Admin Shell" />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </QueryClientProvider>
  );
}
