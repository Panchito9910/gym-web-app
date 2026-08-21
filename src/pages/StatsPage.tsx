import { Suspense, useMemo } from "react";
import useSWR from "swr";
import { BarChart3 } from "lucide-react";
import { workoutsApi } from "../lib/api/endpoints";
import type { WorkoutStatsResponse } from "../types/api";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { formatNumber } from "../lib/utils";

function StatsContent() {
  const stats = useSWR<WorkoutStatsResponse>("workouts-stats", () => workoutsApi.stats());

  const maxVolume = useMemo(() => {
    if (!stats.data?.byExercise.length) return 0;
    return Math.max(
      ...stats.data.byExercise.map((s) => Number(s.totalVolume || 0)),
    );
  }, [stats.data]);

  const totalSets = useMemo(
    () => stats.data?.byExercise.reduce((acc, s) => acc + s.totalSets, 0) ?? 0,
    [stats.data],
  );
  const totalReps = useMemo(
    () => stats.data?.byExercise.reduce((acc, s) => acc + s.totalReps, 0) ?? 0,
    [stats.data],
  );
  const totalVolume = useMemo(
    () => stats.data?.byExercise.reduce((acc, s) => acc + Number(s.totalVolume || 0), 0) ?? 0,
    [stats.data],
  );

  return (
    <>
      <PageHeader
        eyebrow="07 — ESTADÍSTICAS"
        title="Tu progreso"
        description="Volumen, series y reps por ejercicio."
      />

      {stats.isLoading ? (
        <div className="space-y-3">
          <Skeleton height={80} />
          <Skeleton height={240} />
        </div>
      ) : stats.error ? (
        <ErrorState message="No pudimos cargar las estadísticas." />
      ) : !stats.data?.byExercise.length ? (
        <EmptyState
          icon={<BarChart3 size={28} />}
          title="Sin datos aún"
          description="Registra workouts para empezar a ver tu progreso."
        />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-3 gap-3">
            <Card>
              <CardBody>
                <p className="font-mono text-[10px] uppercase tracking-wider text-steel">
                  Series
                </p>
                <p className="font-display text-2xl font-semibold leading-none">
                  {totalSets}
                </p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="font-mono text-[10px] uppercase tracking-wider text-steel">
                  Repeticiones
                </p>
                <p className="font-display text-2xl font-semibold leading-none">
                  {totalReps}
                </p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="font-mono text-[10px] uppercase tracking-wider text-steel">
                  Volumen (kg)
                </p>
                <p className="font-display text-2xl font-semibold leading-none">
                  {formatNumber(totalVolume, 0)}
                </p>
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Volumen por ejercicio</CardTitle>
                <CardDescription>Σ kg × reps por ejercicio.</CardDescription>
              </div>
            </CardHeader>
            <CardBody>
              <ul className="space-y-2">
                {stats.data.byExercise.map((s) => {
                  const pct = maxVolume
                    ? Math.round((Number(s.totalVolume || 0) / maxVolume) * 100)
                    : 0;
                  return (
                    <li key={s.idRoutine__idExercise__id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">
                          {s.idRoutine__idExercise__name}
                        </span>
                        <span className="mono-num text-xs text-steel">
                          {formatNumber(s.totalVolume, 0)} kg · {s.totalSets} sets · {s.totalReps} reps
                        </span>
                      </div>
                      <div
                        className="h-2 overflow-hidden rounded-[var(--radius-xs)] bg-[var(--paper-3)]"
                        role="progressbar"
                        aria-valuenow={pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={s.idRoutine__idExercise__name}
                      >
                        <div
                          className="h-full bg-[var(--accent)]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardBody>
          </Card>
        </>
      )}
    </>
  );
}

export default function StatsPage() {
  return (
    <Suspense fallback={null}>
      <StatsContent />
    </Suspense>
  );
}
