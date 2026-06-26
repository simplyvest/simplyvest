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
  { to: "/", label: "Dashboard", icon: LuLayoutDashboard },
  { to: "/create", label: "Create Stream", icon: LuCirclePlus },
  { to: "/organizations", label: "Organizations", icon: LuBuilding2 },
  { to: "/activity", label: "Activity", icon: LuClock },
  { to: "/analytics", label: "Analytics", icon: LuChartBar },
  { to: "/tools/tokens", label: "Tools", icon: LuWrench },
];
