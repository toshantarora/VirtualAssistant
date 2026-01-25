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
      <main className="lg:ml-72 pt-24 px-4 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
