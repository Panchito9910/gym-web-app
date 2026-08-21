import { Suspense, useMemo, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { Activity, Plus, Trash2 } from "lucide-react";
import {
  intensityApi,
  mySplitsApi,
  routinesApi,
  workoutsApi,
} from "../lib/api/endpoints";
import type {
  IntensityTechnique,
  MySplit,
  Page,
  RoutineEntry,
  Workout,
} from "../types/api";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input, Select, Textarea } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { toast } from "../components/ui/use-toast";
import { ApiError, ValidationError } from "../lib/api/errors";
import { formatDate, formatDateTime, formatNumber } from "../lib/utils";

function WorkoutsContent() {
  const { mutate } = useSWRConfig();
  const active = useSWR<MySplit | null>(
    "my-splits-active",
    async () => {
      try {
        return await mySplitsApi.active();
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },
  );
  const routines = useSWR<Page<RoutineEntry>>(
    active.data ? `routines-${active.data.id}` : null,
    () => routinesApi.list({ ordering: "order" }),
  );
  const techniques = useSWR<Page<IntensityTechnique>>("intensity-techniques", () =>
    intensityApi.list(),
  );
  const history = useSWR<{ results: Workout[]; count: number; next: string | null }>(
    "workouts-list",
    () => workoutsApi.list({ ordering: "-workoutDate" }),
    { keepPreviousData: true },
  );

  const [logging, setLogging] = useState<RoutineEntry | null>(null);
  const [setNumber, setSetNumber] = useState(1);
  const [reps, setReps] = useState<number>(0);
  const [kg, setKg] = useState<string>("0");
  const [rpe, setRpe] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [techniqueId, setTechniqueId] = useState<number | "">("");
  const [submitting, setSubmitting] = useState(false);

  const historyByRoutine = useMemo(() => {
    const map = new Map<number, Workout[]>();
    history.data?.results.forEach((w) => {
      if (!map.has(w.idRoutine)) map.set(w.idRoutine, []);
      map.get(w.idRoutine)!.push(w);
    });
    return map;
  }, [history.data]);

  const openLog = (routine: RoutineEntry) => {
    setLogging(routine);
    const lastForRoutine = historyByRoutine.get(routine.id)?.[0];
    setSetNumber((lastForRoutine?.setNumber ?? 0) + 1);
    setReps(lastForRoutine?.repetitions ?? 0);
    setKg(lastForRoutine?.kg ?? "0");
    setRpe(lastForRoutine?.rpe ?? "");
    setNotes("");
    setTechniqueId(lastForRoutine?.idIntensityTechnique ?? "");
  };

  const submitLog = async () => {
    if (!logging) return;
    setSubmitting(true);
    try {
      await workoutsApi.create({
        idRoutine: logging.id,
        idIntensityTechnique: techniqueId === "" ? null : Number(techniqueId),
        setNumber,
        repetitions: reps,
        kg,
        rpe: rpe === "" ? null : rpe,
        notes,
      });
      toast("Set registrado.", "success");
      setLogging(null);
      await mutate("workouts-list");
      await mutate("workouts-stats");
    } catch (err) {
      if (err instanceof ValidationError) {
        toast(Object.values(err.fieldErrors)[0] ?? "Error de validación.", "error");
      } else {
        toast(err instanceof ApiError ? err.message : "No se pudo registrar.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const removeWorkout = async (id: number) => {
    try {
      await workoutsApi.remove(id);
      toast("Set eliminado.", "success");
      await Promise.all([mutate("workouts-list"), mutate("workouts-stats")]);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Error.", "error");
    }
  };

  if (active.isLoading || routines.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton height={40} width="40%" />
        <Skeleton height={120} />
        <Skeleton height={120} />
      </div>
    );
  }

  if (!active.data) {
    return (
      <>
        <PageHeader eyebrow="05 — WORKOUTS" title="Registrar entrenamiento" />
        <EmptyState
          icon={<Activity size={28} />}
          title="Sin split activo"
          description="Adopta un split para empezar a registrar tus sets."
        />
      </>
    );
  }

  if (!routines.data?.results.length) {
    return (
      <>
        <PageHeader eyebrow="05 — WORKOUTS" title="Registrar entrenamiento" />
        <EmptyState
          title="Sin ejercicios en la rutina"
          description="Añade ejercicios en la página de rutinas para empezar."
          action={
            <a
              href="/routines"
              className="inline-flex h-10 items-center rounded-[var(--radius-sm)] bg-[var(--accent)] px-4 text-sm font-medium text-[var(--paper)]"
            >
              Ir a rutinas
            </a>
          }
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="05 — WORKOUTS"
        title="Registrar entrenamiento"
        description={`Split activo: ${active.data.splitName}`}
      />

      <section className="mb-8">
        <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-steel">
          Mi rutina
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {routines.data.results.map((r) => (
            <Card key={r.id}>
              <CardBody className="space-y-3">
                <div>
                  <p className="font-display text-base font-semibold">{r.exerciseName}</p>
                  <p className="font-mono text-[11px] text-steel">
                    Día {r.dayNumber} · {r.dayName}
                  </p>
                  <p className="mt-1 text-xs text-steel">
                    {r.targetSets} × {r.targetReps} reps
                  </p>
                </div>
                <Button
                  block
                  size="sm"
                  leftIcon={<Plus size={14} />}
                  onClick={() => openLog(r)}
                >
                  Registrar set
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Historial</CardTitle>
              <CardDescription>Últimos sets registrados.</CardDescription>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {history.isLoading ? (
              <div className="space-y-2 p-5">
                <Skeleton height={40} />
                <Skeleton height={40} />
                <Skeleton height={40} />
              </div>
            ) : !history.data?.results.length ? (
              <div className="p-5">
                <EmptyState title="Sin workouts registrados" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--paper-2)] text-left font-mono text-[10px] uppercase tracking-wider text-steel">
                    <tr>
                      <th className="px-4 py-2">Fecha</th>
                      <th className="px-4 py-2">Ejercicio</th>
                      <th className="px-4 py-2 text-right">Set</th>
                      <th className="px-4 py-2 text-right">Reps</th>
                      <th className="px-4 py-2 text-right">Kg</th>
                      <th className="px-4 py-2 text-right">RPE</th>
                      <th className="px-4 py-2">Técnica</th>
                      <th className="px-4 py-2 text-right">—</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-soft)]">
                    {history.data.results.slice(0, 30).map((w) => (
                      <tr key={w.id} className="hover:bg-[var(--paper-2)]">
                        <td className="px-4 py-2 font-mono text-xs text-steel">
                          {formatDate(w.workoutDate)}
                        </td>
                        <td className="px-4 py-2">{w.exerciseName}</td>
                        <td className="px-4 py-2 text-right mono-num">{w.setNumber}</td>
                        <td className="px-4 py-2 text-right mono-num">{w.repetitions}</td>
                        <td className="px-4 py-2 text-right mono-num">{formatNumber(w.kg, 2)}</td>
                        <td className="px-4 py-2 text-right mono-num">{w.rpe ?? "—"}</td>
                        <td className="px-4 py-2">
                          {w.intensityTechnique ? (
                            <Badge variant="accent">{w.intensityTechnique.name}</Badge>
                          ) : (
                            <span className="text-steel">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <button
                            type="button"
                            aria-label="Eliminar"
                            onClick={() => removeWorkout(w.id)}
                            className="rounded-[var(--radius-sm)] p-1.5 text-steel hover:bg-[var(--paper-3)] hover:text-[var(--danger)]"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      </section>

      <Modal
        open={logging !== null}
        onClose={() => setLogging(null)}
        title={logging ? `Registrar set — ${logging.exerciseName}` : ""}
        description={
          logging
            ? `Día ${logging.dayNumber} · ${logging.dayName} · ${logging.targetSets} × ${logging.targetReps}`
            : undefined
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setLogging(null)} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={submitLog} isLoading={submitting} disabled={submitting}>
              Registrar
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Set #"
            type="number"
            min={1}
            value={setNumber}
            onChange={(e) => setSetNumber(Math.max(1, Number(e.target.value) || 1))}
          />
          <Input
            label="Repeticiones"
            type="number"
            min={0}
            value={reps}
            onChange={(e) => setReps(Math.max(0, Number(e.target.value) || 0))}
          />
          <Input
            label="Peso (kg)"
            type="number"
            step="0.5"
            min={0}
            value={kg}
            onChange={(e) => setKg(e.target.value)}
          />
          <Input
            label="RPE (1-10)"
            type="number"
            step="0.5"
            min={1}
            max={10}
            value={rpe}
            onChange={(e) => setRpe(e.target.value)}
            placeholder="opcional"
          />
        </div>
        <div className="mt-3">
          <Select
            label="Técnica de intensidad"
            value={String(techniqueId)}
            onChange={(e) =>
              setTechniqueId(e.target.value === "" ? "" : Number(e.target.value))
            }
            options={[
              { value: "", label: "Ninguna" },
              ...(techniques.data?.results.map((t) => ({
                value: t.id,
                label: t.name,
              })) ?? []),
            ]}
          />
        </div>
        <div className="mt-3">
          <Textarea
            label="Notas"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Buen set, técnica limpia…"
          />
        </div>
        {logging ? (
          <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-steel">
            {formatDateTime(new Date().toISOString())}
          </p>
        ) : null}
      </Modal>
    </>
  );
}

export default function WorkoutsPage() {
  return (
    <Suspense fallback={null}>
      <WorkoutsContent />
    </Suspense>
  );
}
