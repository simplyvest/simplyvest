import {
  LuLayoutDashboard,
  LuCirclePlus,
  LuBuilding2,
  LuClock,
  LuChartBar,
  LuWrench,
} from "react-icons/lu";

export interface SidebarLink {
  to: string;
  label: string;
  icon: typeof LuLayoutDashboard;
}

export const sidebarLinks: SidebarLink[] = [
  { to: "/app/dashboard", label: "Dashboard", icon: LuLayoutDashboard },
  { to: "/app/create", label: "Create Stream", icon: LuCirclePlus },
  { to: "/app/organizations", label: "Organizations", icon: LuBuilding2 },
  { to: "/app/activity", label: "Activity", icon: LuClock },
  { to: "/app/analytics", label: "Analytics", icon: LuChartBar },
  { to: "/app/tools/tokens", label: "Tools", icon: LuWrench },
];
