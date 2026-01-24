import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import Users from "../pages/dashboard/Users";
import AddUser from "../pages/dashboard/AddUser";
import Locations from "../pages/dashboard/Locations";

/* Masters Pages */
import Province from "../pages/dashboard/masters/Province";
import Constituency from "../pages/dashboard/masters/Constituency";
import Facility from "../pages/dashboard/masters/Facility";
import Ward from "../pages/dashboard/masters/Ward";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= Root ================= */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ================= Auth ================= */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* ================= Protected ================= */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/users" element={<Users />} />
          <Route path="/dashboard/add-user" element={<AddUser />} />
          <Route path="/dashboard/locations" element={<Locations />} />

          {/* ========= Masters ========= */}
          <Route path="/dashboard/masters">
            <Route index element={<Navigate to="province" replace />} />
            <Route path="province" element={<Province />} />
            <Route path="constituency" element={<Constituency />} />
            <Route path="facility" element={<Facility />} />
            <Route path="ward" element={<Ward />} />
          </Route>
        </Route>

        {/* ================= Fallback ================= */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
