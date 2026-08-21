import { Menu, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { getUiPrefs, setUiPrefs } from "../../lib/auth/storage";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const [theme, setTheme] = useState<"paper" | "ink">(
    () => getUiPrefs().theme ?? "paper",
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    setUiPrefs({ theme });
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === "paper" ? "ink" : "paper"));
  };

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--bg)]/85 px-4 backdrop-blur-md lg:px-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Abrir menú"
        >
          <Menu size={18} />
        </Button>
        <span className="font-display text-base font-semibold lg:hidden">
          Iron Notebook
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          aria-label="Cambiar tema"
        >
          {theme === "paper" ? <Moon size={16} /> : <Sun size={16} />}
        </Button>
      </div>
    </header>
  );
}
