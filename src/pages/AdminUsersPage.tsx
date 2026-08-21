import { Suspense, useState } from "react";
import useSWR from "swr";
import { Users } from "lucide-react";
import { usersApi } from "../lib/api/endpoints";
import type { Page, RoleName, User } from "../types/api";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { Badge } from "../components/ui/Badge";
import { Select } from "../components/ui/Input";
import { formatDate } from "../lib/utils";

function AdminUsersContent() {
  const [role, setRole] = useState<RoleName | "">("");
  const users = useSWR<Page<User>>(
    ["admin-users", role],
    () => usersApi.list(role ? { role } : undefined),
  );

  return (
    <>
      <PageHeader
        eyebrow="ADMIN · USUARIOS"
        title="Usuarios"
        description="Listado completo. Solo visible para administradores."
        actions={
          <div className="w-40">
            <Select
              label="Rol"
              value={role}
              onChange={(e) => setRole(e.target.value as RoleName | "")}
              options={[
                { value: "", label: "Todos" },
                { value: "admin", label: "Admin" },
                { value: "trainer", label: "Trainer" },
                { value: "user", label: "User" },
              ]}
            />
          </div>
        }
      />

      {users.isLoading ? (
        <div className="space-y-2">
          <Skeleton height={48} />
          <Skeleton height={48} />
          <Skeleton height={48} />
        </div>
      ) : users.error ? (
        <ErrorState message="No pudimos cargar los usuarios." />
      ) : !users.data?.results.length ? (
        <EmptyState icon={<Users size={28} />} title="Sin usuarios" />
      ) : (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{users.data.count} usuarios</CardTitle>
              <CardDescription>Total registrados en la plataforma.</CardDescription>
            </div>
          </CardHeader>
          <CardBody className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead className="bg-[var(--paper-2)] text-left font-mono text-[10px] uppercase tracking-wider text-steel">
                <tr>
                  <th className="px-4 py-2">Usuario</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Rol</th>
                  <th className="px-4 py-2">Estado</th>
                  <th className="px-4 py-2">Alta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-soft)]">
                {users.data.results.map((u) => (
                  <tr key={u.id} className="hover:bg-[var(--paper-2)]">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--paper-3)] font-display text-xs font-semibold">
                          {u.firstName[0]}
                          {u.lastName[0]}
                        </div>
                        <div className="leading-tight">
                          <p className="font-medium">{u.fullName ?? `${u.firstName} ${u.lastName}`}</p>
                          <p className="font-mono text-[10px] text-steel">@{u.userName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2">{u.email}</td>
                    <td className="px-4 py-2">
                      <Badge variant={u.role.name === "admin" ? "accent" : "outline"}>
                        {u.role.name}
                      </Badge>
                    </td>
                    <td className="px-4 py-2">
                      {u.status ? (
                        <Badge variant="ok">activo</Badge>
                      ) : (
                        <Badge variant="danger">inactivo</Badge>
                      )}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs text-steel">
                      {formatDate(u.created)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}
    </>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={null}>
      <AdminUsersContent />
    </Suspense>
  );
}
