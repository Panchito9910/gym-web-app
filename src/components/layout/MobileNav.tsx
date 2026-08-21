import { NavLink } from "react-router-dom";
import {
  Activity,
  Dumbbell,
  Home,
  Layers,
  ListChecks,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Inicio", icon: Home },
  { to: "/routines", label: "Rutinas", icon: ListChecks },
  { to: "/workouts", label: "Entrenar", icon: Activity },
  { to: "/exercises", label: "Ejercicios", icon: Dumbbell },
  { to: "/my-splits", label: "Splits", icon: Layers },
];

export function MobileNav() {
  return (
    <nav
      aria-label="Navegación inferior"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5">
        {ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium uppercase tracking-wider transition-colors",
                  isActive
                    ? "text-[var(--accent)]"
                    : "text-steel hover:text-[var(--fg)]",
                )
              }
            >
              <item.icon size={20} aria-hidden />
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
