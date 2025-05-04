
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  FileText,
  Check,
  Settings,
  Users,
  FileUp,
  BarChart,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  end?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, collapsed, end = false }) => {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex items-center py-2 px-3 mb-1 rounded-md transition-colors",
          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            : "text-sidebar-foreground",
          collapsed && "justify-center"
        )
      }
    >
      <span className="mr-3">{icon}</span>
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const { user, hasPermission } = useAuth();

  if (!user) return null;

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 bottom-0 z-20 bg-sidebar",
        "border-r border-sidebar-border transition-all duration-300 ease-in-out",
        "flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="py-6 px-4 flex-1 overflow-y-auto">
        <nav className="space-y-6">
          {/* Dashboard section */}
          <div>
            <h3 
              className={cn(
                "text-xs uppercase font-semibold text-muted-foreground mb-3",
                collapsed && "text-center"
              )}
            >
              {collapsed ? "Main" : "Dashboard"}
            </h3>
            <div className="space-y-1">
              <NavItem to="/" icon={<Home className="h-5 w-5" />} label="Home" collapsed={collapsed} end />
              <NavItem to="/requests" icon={<FileText className="h-5 w-5" />} label="My Requests" collapsed={collapsed} />
              <NavItem to="/new-request" icon={<FileUp className="h-5 w-5" />} label="New Request" collapsed={collapsed} />
            </div>
          </div>

          {/* Manager section */}
          {hasPermission("manager") && (
            <div>
              <h3 
                className={cn(
                  "text-xs uppercase font-semibold text-muted-foreground mb-3",
                  collapsed && "text-center"
                )}
              >
                {collapsed ? "Mgmt" : "Management"}
              </h3>
              <div className="space-y-1">
                <NavItem to="/approvals" icon={<Check className="h-5 w-5" />} label="Approvals" collapsed={collapsed} />
                <NavItem to="/reports" icon={<BarChart className="h-5 w-5" />} label="Reports" collapsed={collapsed} />
              </div>
            </div>
          )}

          {/* Admin section */}
          {hasPermission("admin") && (
            <div>
              <h3 
                className={cn(
                  "text-xs uppercase font-semibold text-muted-foreground mb-3",
                  collapsed && "text-center"
                )}
              >
                {collapsed ? "Admin" : "Administration"}
              </h3>
              <div className="space-y-1">
                <NavItem to="/users" icon={<Users className="h-5 w-5" />} label="Users" collapsed={collapsed} />
                <NavItem to="/settings" icon={<Settings className="h-5 w-5" />} label="Settings" collapsed={collapsed} />
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Footer */}
      <div className={cn("p-4 border-t border-sidebar-border", collapsed && "text-center")}>
        <div className={cn("text-xs text-muted-foreground", collapsed && "text-center")}>
          {collapsed ? (
            <span>v1.0</span>
          ) : (
            <span>ReimbursoIT v1.0</span>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
