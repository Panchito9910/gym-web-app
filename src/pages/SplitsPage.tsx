import { Suspense } from "react";
import useSWR from "swr";
import { Layers } from "lucide-react";
import { splitsApi } from "../lib/api/endpoints";
import type { Page, Split } from "../types/api";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { Badge } from "../components/ui/Badge";

function SplitsContent() {
  const { data, error, isLoading } = useSWR<Page<Split>>("splits-list", () => splitsApi.list());

  return (
    <>
      <PageHeader
        eyebrow="02 — SPLITS"
        title="Plantillas de splits"
        description="Splits globales disponibles para adoptar."
      />

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton height={140} />
          <Skeleton height={140} />
          <Skeleton height={140} />
        </div>
      ) : error ? (
        <ErrorState message="No pudimos cargar los splits." />
      ) : !data?.results.length ? (
        <EmptyState icon={<Layers size={28} />} title="No hay splits disponibles" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.results.map((split) => (
            <Card key={split.id}>
              <CardHeader>
                <div>
                  <CardTitle>{split.name}</CardTitle>
                  <CardDescription>
                    {split.description || "Sin descripción."}
                  </CardDescription>
                </div>
                <Badge variant="outline">{split.days.length} días</Badge>
              </CardHeader>
              <CardBody>
                <ul className="flex flex-wrap gap-1.5">
                  {split.days.map((d) => (
                    <li key={d.id}>
                      <Badge variant="default">
                        <span className="mono-num mr-1">{d.dayNumber}</span>
                        {d.name}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

export default function SplitsPage() {
  return (
    <Suspense fallback={null}>
      <SplitsContent />
    </Suspense>
  );
}
