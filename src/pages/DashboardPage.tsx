import { Suspense } from "react";
import useSWR from "swr";
import { Link } from "react-router-dom";
import { Activity, Flame, Layers, Trophy } from "lucide-react";
import { mySplitsApi, workoutsApi } from "../lib/api/endpoints";
import { useAuth } from "../features/auth/hooks";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { formatDate, formatNumber } from "../lib/utils";
import { ApiError } from "../lib/api/errors";
import { Badge } from "../components/ui/Badge";
import type { MySplit, Workout, WorkoutStatsResponse } from "../types/api";

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: typeof Activity;
}) {
  return (
    <Card>
      <CardBody className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--paper-3)] text-[var(--accent)]">
          <Icon size={18} aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-wider text-steel">
            {label}
          </p>
          <p className="font-display text-2xl font-semibold leading-none">
            {value}
          </p>
          {sub ? <p className="mt-1 text-xs text-steel">{sub}</p> : null}
        </div>
      </CardBody>
    </Card>
  );
}

function DashboardFallback() {
  return (
    <div className="space-y-6">
      <Skeleton height={48} width="60%" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Skeleton height={80} />
        <Skeleton height={80} />
        <Skeleton height={80} />
        <Skeleton height={80} />
      </div>
      <Skeleton height={220} />
    </div>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const splits = useSWR<MySplit | null>(
    "my-splits-active",
    async () => {
      try {
        return await mySplitsApi.active();
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },
    { revalidateOnFocus: true },
  );
  const stats = useSWR<WorkoutStatsResponse>("workouts-stats", () => workoutsApi.stats());
  const recent = useSWR<{ results: Workout[]; count: number }>(
    "workouts-recent",
    () => workoutsApi.list({ ordering: "-workoutDate" }),
  );

  const totalVolume = stats.data?.byExercise.reduce(
    (acc, s) => acc + Number(s.totalVolume || 0),
    0,
  );
  const totalSets = stats.data?.byExercise.reduce((acc, s) => acc + s.totalSets, 0);
  const topExercise = stats.data?.byExercise[0];

  return (
    <>
      <PageHeader
        eyebrow="01 — DASHBOARD"
        title={`Hola, ${user?.firstName ?? "atleta"}.`}
        description="Resumen de tu entrenamiento."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={Layers}
          label="Split activo"
          value={splits.data?.splitName ?? "—"}
          sub={splits.data ? `Desde ${formatDate(splits.data.startDate)}` : "Sin split activo"}
        />
        <StatCard
          icon={Activity}
          label="Series totales"
          value={totalSets ?? 0}
        />
        <StatCard
          icon={Flame}
          label="Volumen total"
          value={`${formatNumber(totalVolume ?? 0, 0)} kg`}
        />
        <StatCard
          icon={Trophy}
          label="Top ejercicio"
          value={topExercise?.idRoutine__idExercise__name ?? "—"}
          sub={topExercise ? `${formatNumber(topExercise.totalVolume, 0)} kg` : ""}
        />
      </div>

      {splits.error ? (
        <div className="mb-6">
          <ErrorState
            message="No pudimos cargar tu split activo."
            action={
              <button
                className="text-xs font-medium text-[var(--accent)] hover:underline"
                onClick={() => splits.mutate()}
              >
                Reintentar
              </button>
            }
          />
        </div>
      ) : !splits.data ? (
        <Card className="mb-6">
          <CardBody>
            <EmptyState
              icon={<Layers size={28} />}
              title="Aún no has adoptado un split"
              description="Adopta un split para empezar a poblar tu rutina y registrar sets."
              action={
                <Link
                  to="/my-splits"
                  className="inline-flex h-10 items-center rounded-[var(--radius-sm)] bg-[var(--accent)] px-4 text-sm font-medium text-[var(--paper)] hover:bg-[var(--accent-soft)]"
                >
                  Adoptar un split
                </Link>
              }
            />
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Workouts recientes</CardTitle>
            <CardDescription>Tus últimos sets registrados.</CardDescription>
          </div>
          <Link
            to="/workouts"
            className="text-xs font-medium text-[var(--accent)] hover:underline"
          >
            Ver todos
          </Link>
        </CardHeader>
        <CardBody className="p-0">
          {recent.isLoading ? (
            <div className="space-y-2 p-5">
              <Skeleton height={40} />
              <Skeleton height={40} />
              <Skeleton height={40} />
            </div>
          ) : recent.error ? (
            <div className="p-5">
              <ErrorState message="No pudimos cargar los workouts recientes." />
            </div>
          ) : !recent.data?.results.length ? (
            <div className="p-5">
              <EmptyState
                title="Sin workouts aún"
                description="Registra tu primer set desde la página de workouts."
              />
            </div>
          ) : (
            <ul className="divide-y divide-[var(--border-soft)]">
              {recent.data.results.slice(0, 6).map((w) => (
                <li
                  key={w.id}
                  className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{w.exerciseName}</p>
                    <p className="font-mono text-[11px] text-steel">
                      {formatDate(w.workoutDate)} · día {w.dayNumber}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="mono-num text-sm font-medium">
                        {w.repetitions} × {w.kg} kg
                      </p>
                      {w.rpe ? (
                        <p className="mono-num text-[10px] uppercase tracking-wider text-steel">
                          RPE {w.rpe}
                        </p>
                      ) : null}
                    </div>
                    {w.intensityTechnique ? (
                      <Badge variant="accent">{w.intensityTechnique.name}</Badge>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardContent />
    </Suspense>
  );
}
