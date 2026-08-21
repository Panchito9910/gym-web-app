import { Suspense } from "react";
import { Link, useParams } from "react-router-dom";
import useSWR, { useSWRConfig } from "swr";
import { ArrowLeft, Heart, Play } from "lucide-react";
import { exercisesApi, myExercisesApi } from "../lib/api/endpoints";
import type { Exercise, ExerciseMuscle, Page } from "../types/api";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { toast } from "../components/ui/use-toast";
import { ApiError } from "../lib/api/errors";

function ExerciseDetailContent() {
  const { id } = useParams();
  const exerciseId = Number(id);
  const { mutate } = useSWRConfig();

  const exercise = useSWR<Exercise>(
    Number.isFinite(exerciseId) ? ["exercise", exerciseId] : null,
    () => exercisesApi.get(exerciseId),
  );
  const muscles = useSWR<ExerciseMuscle[]>(
    Number.isFinite(exerciseId) ? ["exercise-muscles", exerciseId] : null,
    () => exercisesApi.muscles(exerciseId),
  );
  const favorites = useSWR<Page<{ id: number; exerciseId: number; exerciseName: string }>>(
    "my-exercises-list",
    () => myExercisesApi.list(),
  );

  const favoriteEntry = favorites.data?.results.find((f) => f.exerciseId === exerciseId);
  const isFav = Boolean(favoriteEntry);

  const toggleFavorite = async () => {
    if (!exercise.data) return;
    try {
      if (favoriteEntry) {
        await myExercisesApi.remove(favoriteEntry.id);
        toast("Eliminado de favoritos.", "success");
      } else {
        await myExercisesApi.add({ idExercise: exercise.data.id });
        toast("Guardado en favoritos.", "success");
      }
      await mutate("my-exercises-list");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Error.", "error");
    }
  };

  if (exercise.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton height={40} width="40%" />
        <Skeleton height={200} />
      </div>
    );
  }

  if (exercise.error || !exercise.data) {
    return (
      <>
        <PageHeader title="Ejercicio no encontrado" />
        <ErrorState message="No pudimos cargar este ejercicio." />
        <div className="mt-4">
          <Link
            to="/exercises"
            className="inline-flex h-10 items-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--paper-2)] px-4 text-sm font-medium hover:bg-[var(--paper-3)]"
          >
            <ArrowLeft size={14} className="mr-2" />
            Volver al catálogo
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={muscles.data?.length ? `${muscles.data.length} músculos` : undefined}
        title={exercise.data.name}
        description={exercise.data.description || undefined}
        actions={
          <Button
            variant={isFav ? "primary" : "secondary"}
            leftIcon={<Heart size={14} fill={isFav ? "currentColor" : "none"} />}
            onClick={toggleFavorite}
          >
            {isFav ? "En favoritos" : "Guardar"}
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Músculos trabajados</CardTitle>
            <CardDescription>Rol de cada músculo en el ejercicio.</CardDescription>
          </CardHeader>
          <CardBody>
            {muscles.isLoading ? (
              <Skeleton height={60} />
            ) : !muscles.data?.length ? (
              <EmptyState title="Sin músculos asociados" />
            ) : (
              <ul className="space-y-2">
                {muscles.data.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--paper-2)] px-3 py-2 text-sm"
                  >
                    <span>{m.muscleName}</span>
                    <Badge
                      variant={
                        m.role === "primary"
                          ? "accent"
                          : m.role === "secondary"
                            ? "default"
                            : "outline"
                      }
                    >
                      {m.role}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vídeo</CardTitle>
          </CardHeader>
          <CardBody>
            {exercise.data.videoUrl ? (
              <a
                href={exercise.data.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--paper-2)] p-4 text-sm hover:bg-[var(--paper-3)]"
              >
                <Play size={16} className="text-[var(--accent)]" />
                <span className="truncate">{exercise.data.videoUrl}</span>
              </a>
            ) : (
              <p className="text-sm text-steel">Sin vídeo asociado.</p>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}

export default function ExerciseDetailPage() {
  return (
    <Suspense fallback={null}>
      <ExerciseDetailContent />
    </Suspense>
  );
}
