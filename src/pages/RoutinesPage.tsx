import { Suspense, useMemo, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { ListChecks, Plus, Trash2 } from "lucide-react";
import { exercisesApi, mySplitsApi, routinesApi, splitsApi } from "../lib/api/endpoints";
import type {
  Exercise,
  MySplit,
  Page,
  RoutineEntry,
  Split,
  SplitDay,
} from "../types/api";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input, Select } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { toast } from "../components/ui/use-toast";
import { ApiError, ValidationError } from "../lib/api/errors";

function RoutinesContent() {
  const { mutate } = useSWRConfig();
  const activeSplit = useSWR<MySplit | null>(
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
  const splitFull = useSWR<Split | null>(
    activeSplit.data ? `split-detail-${activeSplit.data.idSplit}` : null,
    () =>
      activeSplit.data ? splitsApi.get(activeSplit.data.idSplit) : Promise.resolve(null),
    {
      revalidateOnFocus: false,
    },
  );

  const routines = useSWR<Page<RoutineEntry>>(
    activeSplit.data ? `routines-${activeSplit.data.id}` : null,
    () => routinesApi.list({ ordering: "order" }),
    { revalidateOnFocus: true },
  );

  const [selectedDayId, setSelectedDayId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [exerciseId, setExerciseId] = useState<number | "">("");
  const [order, setOrder] = useState(1);
  const [targetSets, setTargetSets] = useState(3);
  const [targetReps, setTargetReps] = useState("8-12");
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const exercises = useSWR<Page<Exercise>>(
    adding ? ["exercises-search", search] : null,
    () => exercisesApi.list({ search: search || undefined }),
  );

  const days: SplitDay[] = useMemo(() => {
    const d = (splitFull.data?.days ?? []).slice().sort((a, b) => a.dayNumber - b.dayNumber);
    if (!d.length && routines.data?.results.length) {
      const seen = new Map<number, SplitDay>();
      for (const r of routines.data.results) {
        if (!seen.has(r.idSplitDay)) {
          seen.set(r.idSplitDay, {
            id: r.idSplitDay,
            idSplit: 0,
            dayNumber: r.dayNumber,
            name: r.dayName,
            status: true,
            created: "",
            updated: "",
          });
        }
      }
      return Array.from(seen.values()).sort((a, b) => a.dayNumber - b.dayNumber);
    }
    return d;
  }, [splitFull.data, routines.data]);

  const activeDay = selectedDayId ?? days[0]?.id ?? null;
  const routinesForDay = routines.data?.results.filter((r) => r.idSplitDay === activeDay) ?? [];

  const openAdd = () => {
    if (!activeDay) return;
    setAdding(true);
    setSearch("");
    setExerciseId("");
    setOrder(routinesForDay.length + 1);
    setTargetSets(3);
    setTargetReps("8-12");
  };

  const submitAdd = async () => {
    if (!activeSplit.data || !activeDay || !exerciseId) return;
    setSubmitting(true);
    try {
      await routinesApi.create({
        idUserSplit: activeSplit.data.id,
        idSplitDay: activeDay,
        idExercise: Number(exerciseId),
        order,
        targetSets,
        targetReps,
      });
      toast("Ejercicio añadido a la rutina.", "success");
      setAdding(false);
      await mutate(`routines-${activeSplit.data.id}`);
    } catch (err) {
      if (err instanceof ValidationError) {
        toast(Object.values(err.fieldErrors)[0] ?? "Error de validación.", "error");
      } else {
        toast(err instanceof ApiError ? err.message : "No se pudo añadir.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const removeRoutine = async (id: number) => {
    try {
      await routinesApi.remove(id);
      toast("Eliminado.", "success");
      if (activeSplit.data) await mutate(`routines-${activeSplit.data.id}`);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Error al eliminar.", "error");
    }
  };

  if (activeSplit.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton height={40} width="40%" />
        <Skeleton height={120} />
      </div>
    );
  }

  if (activeSplit.error) {
    return <ErrorState message="No pudimos cargar tu split activo." />;
  }

  if (!activeSplit.data) {
    return (
      <>
        <PageHeader
          eyebrow="04 — RUTINAS"
          title="Tu rutina"
          description="Adopta un split para empezar a poblar tu rutina."
        />
        <EmptyState
          icon={<ListChecks size={28} />}
          title="No tienes un split activo"
          description="Adopta uno en Mis splits para empezar."
          action={
            <a
              href="/my-splits"
              className="inline-flex h-10 items-center rounded-[var(--radius-sm)] bg-[var(--accent)] px-4 text-sm font-medium text-[var(--paper)]"
            >
              Ir a Mis splits
            </a>
          }
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="04 — RUTINAS"
        title={activeSplit.data.splitName}
        description={`Poblando el split activo desde ${activeSplit.data.startDate}.`}
        actions={
          <Button leftIcon={<Plus size={14} />} onClick={openAdd} disabled={!activeDay}>
            Añadir ejercicio
          </Button>
        }
      />

      {!days.length ? (
        <EmptyState
          title="Este split aún no tiene días definidos"
          description="Pide al administrador que añada días al split."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[200px_1fr]">
          <nav aria-label="Días del split">
            <ul className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
              {days.map((d) => (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedDayId(d.id)}
                    className={`flex w-full items-center gap-3 rounded-[var(--radius-sm)] border px-3 py-2 text-left text-sm transition-colors ${
                      activeDay === d.id
                        ? "border-[var(--accent)] bg-[var(--paper-2)] text-[var(--accent)]"
                        : "border-[var(--border)] bg-[var(--paper-2)] text-[var(--fg)] hover:bg-[var(--paper-3)]"
                    }`}
                  >
                    <span className="mono-num text-xs font-semibold">
                      {String(d.dayNumber).padStart(2, "0")}
                    </span>
                    <span className="font-medium">{d.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>
                    Día {days.find((d) => d.id === activeDay)?.dayNumber} —{" "}
                    {days.find((d) => d.id === activeDay)?.name}
                  </CardTitle>
                  <CardDescription>
                    {routinesForDay.length} ejercicio
                    {routinesForDay.length === 1 ? "" : "s"}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardBody className="p-0">
                {routines.isLoading ? (
                  <div className="space-y-2 p-5">
                    <Skeleton height={48} />
                    <Skeleton height={48} />
                  </div>
                ) : !routinesForDay.length ? (
                  <div className="p-5">
                    <EmptyState
                      title="Día vacío"
                      description="Añade ejercicios para este día."
                      action={
                        <Button size="sm" leftIcon={<Plus size={14} />} onClick={openAdd}>
                          Añadir
                        </Button>
                      }
                    />
                  </div>
                ) : (
                  <ul className="divide-y divide-[var(--border-soft)]">
                    {routinesForDay.map((r) => (
                      <li
                        key={r.id}
                        className="flex items-center justify-between gap-3 px-5 py-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="mono-num text-xs text-steel">
                            {String(r.order).padStart(2, "0")}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium">{r.exerciseName}</p>
                            <p className="font-mono text-[11px] text-steel">
                              {r.targetSets} × {r.targetReps} reps
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeRoutine(r.id)}
                          aria-label="Eliminar"
                          className="rounded-[var(--radius-sm)] p-2 text-steel hover:bg-[var(--paper-3)] hover:text-[var(--danger)]"
                        >
                          <Trash2 size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      <Modal
        open={adding}
        onClose={() => setAdding(false)}
        title="Añadir ejercicio"
        description={`Día ${days.find((d) => d.id === activeDay)?.name ?? ""}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setAdding(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={submitAdd} isLoading={submitting} disabled={submitting || !exerciseId}>
              Añadir
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-steel">
              Buscar ejercicio
            </label>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre…"
              className="h-10 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--paper-2)] px-3 text-sm focus-visible:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
            />
          </div>
          <Select
            label="Ejercicio"
            value={String(exerciseId)}
            onChange={(e) => setExerciseId(Number(e.target.value))}
            options={[
              { value: "", label: "Selecciona…" },
              ...(exercises.data?.results.map((ex) => ({
                value: ex.id,
                label: ex.name,
              })) ?? []),
            ]}
          />
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Orden"
              type="number"
              min={1}
              value={order}
              onChange={(e) => setOrder(Math.max(1, Number(e.target.value) || 1))}
            />
            <Input
              label="Sets"
              type="number"
              min={1}
              value={targetSets}
              onChange={(e) => setTargetSets(Math.max(1, Number(e.target.value) || 1))}
            />
            <Input
              label="Reps"
              value={targetReps}
              onChange={(e) => setTargetReps(e.target.value)}
              placeholder="8-12"
            />
          </div>
          <Badge variant="outline">
            Día {days.find((d) => d.id === activeDay)?.dayNumber}
          </Badge>
        </div>
      </Modal>
    </>
  );
}

export default function RoutinesPage() {
  return (
    <Suspense fallback={null}>
      <RoutinesContent />
    </Suspense>
  );
}
