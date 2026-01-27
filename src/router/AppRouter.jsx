import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ProtectedRoute from '../auth/ProtectedRoute';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import { LocationProvider } from '../context/LocationContext';

// Eager load auth pages (needed immediately)
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Lazy load dashboard pages (loaded on demand)
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const Users = lazy(() => import('../pages/dashboard/Users'));
const AddUser = lazy(() => import('../pages/dashboard/AddUser'));
const Locations = lazy(() => import('../pages/dashboard/Locations'));

// Lazy load master pages (loaded on demand)
// const Country = lazy(() => import('../pages/dashboard/masters/Country'));
const Province = lazy(() => import('../pages/dashboard/masters/Province'));
const District = lazy(() => import('../pages/dashboard/masters/District'));
const Constituency = lazy(() => import('../pages/dashboard/masters/Constituency'));
const Ward = lazy(() => import('../pages/dashboard/masters/Ward'));
const Facility = lazy(() => import('../pages/dashboard/masters/Facility'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-3">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm font-semibold text-slate-600">Loading...</p>
    </div>
  </div>
);

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
            <Route 
              path="/dashboard" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <Dashboard />
                </Suspense>
              } 
            />
            <Route 
              path="/dashboard/users" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <Users />
                </Suspense>
              } 
            />
            <Route 
              path="/dashboard/add-user" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <AddUser />
                </Suspense>
              } 
            />
            <Route 
              path="/dashboard/locations" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <Locations />
                </Suspense>
              } 
            />

            {/* ========= Masters ========= */}
            <Route path="/dashboard/masters">
              <Route index element={<Navigate to="country" replace />} />
              {/* <Route 
                path="country" 
                element={
                  <Suspense fallback={<PageLoader />}>
                    <Country />
                  </Suspense>
                } 
              /> */}
              <Route 
                path="province" 
                element={
                  <Suspense fallback={<PageLoader />}>
                    <Province />
                  </Suspense>
                } 
              />
              <Route 
                path="district" 
                element={
                  <Suspense fallback={<PageLoader />}>
                    <District />
                  </Suspense>
                } 
              />
              <Route 
                path="constituency" 
                element={
                  <Suspense fallback={<PageLoader />}>
                    <Constituency />
                  </Suspense>
                } 
              />
              <Route 
                path="ward" 
                element={
                  <Suspense fallback={<PageLoader />}>
                    <Ward />
                  </Suspense>
                } 
              />
              <Route 
                path="facility" 
                element={
                  <Suspense fallback={<PageLoader />}>
                    <Facility />
                  </Suspense>
                } 
              />
            </Route>
          </Route>

          {/* ================= Fallback ================= */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </LocationProvider>
    </BrowserRouter>
  );
}
