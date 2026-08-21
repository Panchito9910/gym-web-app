import { NavLink } from "react-router-dom";
import {
  Activity,
  Dumbbell,
  Home,
  Layers,
  ListChecks,
  LogOut,
  Settings,
  Users,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "../../features/auth/hooks";
import { cn } from "../../lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/splits", label: "Splits", icon: Layers },
  { to: "/my-splits", label: "Mis splits", icon: ListChecks },
  { to: "/routines", label: "Rutinas", icon: Dumbbell },
  { to: "/workouts", label: "Workouts", icon: Activity },
  { to: "/exercises", label: "Ejercicios", icon: Dumbbell },
  { to: "/stats", label: "Estadísticas", icon: BarChart3 },
  { to: "/profile", label: "Perfil", icon: Settings },
  { to: "/admin/users", label: "Usuarios", icon: Users, adminOnly: true },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();
  const isAdmin = user?.role?.name === "admin";

  return (
    <nav className="flex h-full w-full flex-col bg-[var(--bg)]">
      <div className="flex h-14 items-center gap-2 border-b border-[var(--border)] px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--ink)] text-[var(--paper)] font-display text-sm font-bold">
          IN
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-display text-sm font-semibold">Iron Notebook</span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-steel">
            v1.0
          </span>
        </div>
      </div>

      <ul className="flex-1 overflow-y-auto px-2 py-3">
        {NAV_ITEMS.filter((i) => !i.adminOnly || isAdmin).map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-[var(--paper-2)] font-medium text-[var(--accent)]"
                    : "text-[var(--fg)] hover:bg-[var(--paper-2)]",
                )
              }
            >
              <item.icon size={16} aria-hidden />
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="border-t border-[var(--border)] p-3">
        {user ? (
          <div className="mb-2 flex items-center gap-3 rounded-[var(--radius-sm)] px-2 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--paper-3)] font-display text-xs font-semibold">
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-medium">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-xs text-steel">{user.email}</p>
            </div>
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => {
            void logout();
          }}
          className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm text-steel hover:bg-[var(--paper-2)] hover:text-[var(--fg)]"
        >
          <LogOut size={16} aria-hidden />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </nav>
  );
}
