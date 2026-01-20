import { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-primary-200">
      <Header onMenuClick={() => setMobileOpen(true)} />
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Content */}
      <main className="pt-16 px-4 lg:mt-6 lg:ml-72 lg:px-6">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
