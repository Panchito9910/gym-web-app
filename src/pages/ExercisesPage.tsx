import { Suspense, useState } from "react";
import { Link } from "react-router-dom";
import useSWR, { useSWRConfig } from "swr";
import { Dumbbell, Heart, Search } from "lucide-react";
import { exercisesApi, myExercisesApi } from "../lib/api/endpoints";
import type { Exercise, Page } from "../types/api";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { Badge } from "../components/ui/Badge";
import { toast } from "../components/ui/use-toast";
import { ApiError } from "../lib/api/errors";

function ExercisesContent() {
  const { mutate } = useSWRConfig();
  const [search, setSearch] = useState("");
  const exercises = useSWR<Page<Exercise>>(
    ["exercises-list", search],
    () => exercisesApi.list({ search: search || undefined, ordering: "name" }),
    { keepPreviousData: true },
  );
  const favorites = useSWR<Page<{ id: number; exerciseId: number; exerciseName: string }>>(
    "my-exercises-list",
    () => myExercisesApi.list(),
  );

  const favIds = new Set(favorites.data?.results.map((f) => f.exerciseId) ?? []);

  const toggleFavorite = async (exercise: Exercise) => {
    const existing = favorites.data?.results.find((f) => f.exerciseId === exercise.id);
    try {
      if (existing) {
        await myExercisesApi.remove(existing.id);
        toast("Eliminado de favoritos.", "success");
      } else {
        await myExercisesApi.add({ idExercise: exercise.id });
        toast("Guardado en favoritos.", "success");
      }
      await mutate("my-exercises-list");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Error.", "error");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="06 — EJERCICIOS"
        title="Catálogo de ejercicios"
        description="Busca y guarda tus ejercicios favoritos."
        actions={
          <div className="relative">
            <Search
              size={14}
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-steel"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar…"
              className="h-10 w-56 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--paper-2)] pl-8 pr-3 text-sm focus-visible:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
            />
          </div>
        }
      />

      {exercises.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton height={120} />
          <Skeleton height={120} />
          <Skeleton height={120} />
        </div>
      ) : exercises.error ? (
        <ErrorState message="No pudimos cargar los ejercicios." />
      ) : !exercises.data?.results.length ? (
        <EmptyState
          icon={<Dumbbell size={28} />}
          title="Sin ejercicios"
          description="No hay ejercicios para mostrar."
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {exercises.data.results.map((ex) => {
            const isFav = favIds.has(ex.id);
            return (
              <li key={ex.id}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="min-w-0">
                      <CardTitle>
                        <Link
                          to={`/exercises/${ex.id}`}
                          className="hover:text-[var(--accent)]"
                        >
                          {ex.name}
                        </Link>
                      </CardTitle>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {(ex.muscles ?? []).slice(0, 3).map((m) => (
                          <Badge key={m.id} variant="outline">
                            {m.muscleName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
                      onClick={() => toggleFavorite(ex)}
                      className="rounded-[var(--radius-sm)] p-2 text-steel hover:bg-[var(--paper-3)] hover:text-[var(--accent)]"
                    >
                      <Heart
                        size={16}
                        fill={isFav ? "currentColor" : "none"}
                        className={isFav ? "text-[var(--accent)]" : ""}
                      />
                    </button>
                  </CardHeader>
                  <CardBody>
                    <p className="line-clamp-2 text-xs text-steel">
                      {ex.description || "Sin descripción."}
                    </p>
                    <div className="mt-3">
                      <Link
                        to={`/exercises/${ex.id}`}
                        className="inline-flex h-8 items-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--paper-2)] px-3 text-xs font-medium hover:bg-[var(--paper-3)]"
                      >
                        Ver detalle
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

export default function ExercisesPage() {
  return (
    <Suspense fallback={null}>
      <ExercisesContent />
    </Suspense>
  );
}
