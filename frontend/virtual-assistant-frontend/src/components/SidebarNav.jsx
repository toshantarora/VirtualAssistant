import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  UsersRound,
  UserRoundPlus,
  Wrench,
  MapPin,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/dashboard/users", icon: UsersRound },
  { name: "Add User", href: "/dashboard/add-user", icon: UserRoundPlus },
//   { name: "Masters", href: "/dashboard/masters", icon: Wrench },
  { name: "Locations", href: "/dashboard/locations", icon: MapPin },
];

const SidebarNav = ({ onItemClick }) => {
  return (
    <nav>
      <ul className="space-y-2">
        {navigation.map((item) => (
          <li key={item.name}>
            <NavLink
              to={item.href}
              end
              onClick={onItemClick}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-full px-6 py-3 text-base
                ${
                  isActive
                    ? "bg-light-grey text-black"
                    : "text-primary hover:bg-light-grey hover:text-black"
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SidebarNav;

