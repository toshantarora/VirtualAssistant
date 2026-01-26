import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ProtectedRoute from '../auth/ProtectedRoute';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';

import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Dashboard from '../pages/dashboard/Dashboard';
import Users from '../pages/dashboard/Users';
import AddUser from '../pages/dashboard/AddUser';
import Locations from '../pages/dashboard/Locations';

/* Masters Pages */
import Country from '../pages/dashboard/masters/Country';
import Province from '../pages/dashboard/masters/Province';
import District from '../pages/dashboard/masters/District';
import Constituency from '../pages/dashboard/masters/Constituency';
import Ward from '../pages/dashboard/masters/Ward';
import Facility from '../pages/dashboard/masters/Facility';
import { LocationProvider } from '../context/LocationContext';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <LocationProvider>
        <Routes>
          {/* ================= Root ================= */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* ================= Auth ================= */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
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
              <Route index element={<Navigate to="country" replace />} />
              <Route path="country" element={<Country />} />
              <Route path="province" element={<Province />} />
              <Route path="district" element={<District />} />
              <Route path="constituency" element={<Constituency />} />
              <Route path="ward" element={<Ward />} />
              <Route path="facility" element={<Facility />} />
            </Route>
          </Route>

          {/* ================= Fallback ================= */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </LocationProvider>
    </BrowserRouter>
  );
}
