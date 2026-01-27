import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, UsersRound, UserRoundPlus, Wrench, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/dashboard/users', icon: UsersRound },
  { name: 'Add User', href: '/dashboard/add-user', icon: UserRoundPlus },
];

const mastersMenu = [
//   { name: 'Country', href: '/dashboard/masters/country' },
  { name: 'Province', href: '/dashboard/masters/province' },
  { name: 'District', href: '/dashboard/masters/district' },
  { name: 'Constituency', href: '/dashboard/masters/constituency' },
  { name: 'Ward', href: '/dashboard/masters/ward' },
  { name: 'Facility', href: '/dashboard/masters/facility' },
];

const SidebarNav = ({ onItemClick }) => {
  const location = useLocation();

  // user-controlled toggle
  const [mastersManuallyOpen, setMastersManuallyOpen] = useState(false);

  // derived state from route (NO setState)
  const isMastersRoute = location.pathname.startsWith('/dashboard/masters');

  // final open state
  const mastersOpen = isMastersRoute || mastersManuallyOpen;

  return (
    <nav>
      <ul className="space-y-2">
        {/* Main links */}
        {navigation.map((item) => (
          <li key={item.name}>
            <NavLink
              to={item.href}
              end
              onClick={onItemClick}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-full px-6 py-3 text-base transition
                ${
                  isActive
                    ? 'bg-light-grey text-black'
                    : 'text-primary hover:bg-light-grey hover:text-black'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          </li>
        ))}

        {/* Masters */}
        <li>
          <button
            type="button"
            onClick={() => setMastersManuallyOpen((v) => !v)}
            className={`flex w-full items-center justify-between gap-3 rounded-full px-6 py-3 text-base transition
              ${
                isMastersRoute
                  ? 'bg-light-grey text-black'
                  : 'text-primary hover:bg-light-grey hover:text-black'
              }`}
          >
            <span className="flex items-center gap-3">
              <Wrench className="h-5 w-5" />
              Masters
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${mastersOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {mastersOpen && (
            <ul className="mt-2 space-y-1 pl-8">
              {mastersMenu.map((sub) => (
                <li key={sub.name}>
                  <NavLink
                    to={sub.href}
                    onClick={onItemClick}
                    className={({ isActive }) =>
                      `block rounded-full px-4 py-2 text-sm transition
                      ${
                        isActive
                          ? 'bg-light-grey text-black'
                          : 'text-primary hover:bg-light-grey hover:text-black'
                      }`
                    }
                  >
                    {sub.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default SidebarNav;
