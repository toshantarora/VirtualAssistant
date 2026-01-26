import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { X } from "lucide-react";
import SidebarNav from "./SidebarNav";

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  return (
    <>
      {/* Mobile Sidebar */}
      <Dialog
        open={mobileOpen}
        onClose={setMobileOpen}
        className="relative z-50 lg:hidden"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/40" />

        <DialogPanel className="fixed inset-y-0 left-0 w-72 bg-white p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Menu</h2>
            <button onClick={() => setMobileOpen(false)}>
              <X size={22} />
            </button>
          </div>

          <SidebarNav onItemClick={() => setMobileOpen(false)} />
        </DialogPanel>
      </Dialog>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:top-16 lg:left-0 lg:z-30 lg:block lg:h-[calc(100vh-64px)] lg:w-72 border-r border-primary-100 bg-white">
        <div className="h-full overflow-y-auto px-6 py-6">
          <SidebarNav />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

