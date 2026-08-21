import { Suspense, useState } from "react";
import useSWR from "swr";
import { Link } from "react-router-dom";
import { Calendar, CheckCircle2, Layers, Plus } from "lucide-react";
import { useSWRConfig } from "swr";
import { mySplitsApi, splitsApi } from "../lib/api/endpoints";
import type { MySplit, Page, Split } from "../types/api";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Select } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { toast } from "../components/ui/use-toast";
import { ApiError } from "../lib/api/errors";
import { formatDate } from "../lib/utils";

function MySplitsContent() {
  const { mutate } = useSWRConfig();
  const mine = useSWR<Page<MySplit>>("my-splits-list", () => mySplitsApi.list());
  const catalog = useSWR<Page<Split>>("splits-list", () => splitsApi.list());
  const [adopting, setAdopting] = useState<Split | null>(null);
  const [selectedId, setSelectedId] = useState<number | "">("");
  const [startDate, setStartDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const openAdopt = (split: Split) => {
    setAdopting(split);
    setSelectedId(split.id);
    setStartDate(new Date().toISOString().slice(0, 10));
    setIsActive(true);
  };

  const submitAdopt = async () => {
    if (!selectedId) return;
    setSubmitting(true);
    try {
      await mySplitsApi.adopt({
        idSplit: Number(selectedId),
        startDate,
        isActive,
      });
      toast("Split adoptado.", "success");
      setAdopting(null);
      await Promise.all([mutate("my-splits-list"), mutate("my-splits-active")]);
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "No se pudo adoptar el split.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const endSplit = async (id: number) => {
    try {
      await mySplitsApi.update(id, {
        endDate: new Date().toISOString().slice(0, 10),
        isActive: false,
      });
      toast("Split finalizado.", "success");
      await Promise.all([mutate("my-splits-list"), mutate("my-splits-active")]);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Error al finalizar.", "error");
    }
  };

  const activateSplit = async (id: number) => {
    try {
      await mySplitsApi.update(id, { isActive: true });
      toast("Split activado.", "success");
      await Promise.all([mutate("my-splits-list"), mutate("my-splits-active")]);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Error al activar.", "error");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="03 — MIS SPLITS"
        title="Mis splits adoptados"
        description="Solo un split puede estar activo a la vez."
      />

      {mine.isLoading ? (
        <div className="space-y-3">
          <Skeleton height={100} />
          <Skeleton height={100} />
        </div>
      ) : mine.error ? (
        <ErrorState message="No pudimos cargar tus splits." />
      ) : !mine.data?.results.length ? (
        <EmptyState
          icon={<Layers size={28} />}
          title="Aún no has adoptado un split"
          description="Empieza adoptando una plantilla del catálogo."
          action={
            catalog.data?.results.length ? (
              <Button
                leftIcon={<Plus size={14} />}
                onClick={() => catalog.data && openAdopt(catalog.data.results[0])}
              >
                Adoptar un split
              </Button>
            ) : null
          }
        />
      ) : (
        <ul className="space-y-3">
          {mine.data.results.map((s) => (
            <li key={s.id}>
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>{s.splitName}</CardTitle>
                    <CardDescription>
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(s.startDate)} → {s.endDate ? formatDate(s.endDate) : "activo"}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.isActive ? <Badge variant="ok">Activo</Badge> : <Badge variant="outline">Inactivo</Badge>}
                  </div>
                </CardHeader>
                <CardBody className="flex flex-wrap items-center gap-2">
                  <Link
                    to="/routines"
                    className="inline-flex h-9 items-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--paper-2)] px-3 text-xs font-medium hover:bg-[var(--paper-3)]"
                  >
                    Ver rutinas
                  </Link>
                  {!s.isActive ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      leftIcon={<CheckCircle2 size={14} />}
                      onClick={() => activateSplit(s.id)}
                    >
                      Activar
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => endSplit(s.id)}>
                      Finalizar
                    </Button>
                  )}
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-10">
        <PageHeader
          eyebrow="CATÁLOGO"
          title="Adopta un split"
          description="Plantillas globales listas para empezar."
        />
        {catalog.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton height={120} />
            <Skeleton height={120} />
          </div>
        ) : catalog.error ? (
          <ErrorState message="No se pudo cargar el catálogo." />
        ) : !catalog.data?.results.length ? (
          <EmptyState title="Sin splits en el catálogo" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.data.results.map((split) => (
              <Card key={split.id}>
                <CardHeader>
                  <div>
                    <CardTitle>{split.name}</CardTitle>
                    <CardDescription>{split.description || "Sin descripción."}</CardDescription>
                  </div>
                  <Badge variant="outline">{split.days.length} días</Badge>
                </CardHeader>
                <CardBody>
                  <Button
                    block
                    leftIcon={<Plus size={14} />}
                    onClick={() => openAdopt(split)}
                  >
                    Adoptar
                  </Button>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={adopting !== null}
        onClose={() => setAdopting(null)}
        title={`Adoptar ${adopting?.name ?? ""}`}
        description="Define la fecha de inicio y si será tu split activo."
        footer={
          <>
            <Button variant="ghost" onClick={() => setAdopting(null)} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={submitAdopt} isLoading={submitting} disabled={submitting}>
              Adoptar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Split"
            value={String(selectedId)}
            onChange={(e) => setSelectedId(Number(e.target.value))}
            options={
              catalog.data?.results.map((s) => ({ value: s.id, label: s.name })) ?? []
            }
          />
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="start-date"
              className="text-xs font-medium uppercase tracking-wider text-steel"
            >
              Fecha de inicio
            </label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-10 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--paper-2)] px-3 text-sm focus-visible:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 accent-[var(--accent)]"
            />
            Marcar como activo
          </label>
        </div>
      </Modal>
    </>
  );
}

export default function MySplitsPage() {
  return (
    <Suspense fallback={null}>
      <MySplitsContent />
    </Suspense>
  );
}
