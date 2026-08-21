import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { EmptyState } from "../components/ui/EmptyState";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60dvh] items-center justify-center">
      <EmptyState
        icon={<Compass size={28} />}
        title="404 — No encontrado"
        description="La ruta que buscas no existe o se movió."
        action={
          <Link
            to="/dashboard"
            className="inline-flex h-10 items-center rounded-[var(--radius-sm)] bg-[var(--accent)] px-4 text-sm font-medium text-[var(--paper)] hover:bg-[var(--accent-soft)]"
          >
            Ir al dashboard
          </Link>
        }
      />
    </div>
  );
}
