import { Suspense, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import useSWR from "swr";
import { useSWRConfig } from "swr";
import { KeyRound, Save } from "lucide-react";
import { usersApi } from "../lib/api/endpoints";
import type { User } from "../types/api";
import {
  changePasswordSchema,
  profileSchema,
  type ChangePasswordInput,
  type ProfileInput,
} from "../features/auth/schemas";
import { useAuth } from "../features/auth/hooks";
import { ApiError, ValidationError } from "../lib/api/errors";
import { toast } from "../components/ui/use-toast";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { ErrorState } from "../components/ui/ErrorState";
import { formatDate } from "../lib/utils";

function ProfileContent() {
  const { user, logout } = useAuth();
  const { mutate } = useSWRConfig();
  const profile = useSWR<User>("users-me", () => usersApi.me());
  const [isProfilePending, startProfileTransition] = useTransition();
  const [isPasswordPending, startPasswordTransition] = useTransition();

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    setError: setProfileError,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      userName: user?.userName ?? "",
      email: user?.email ?? "",
    },
  });

  useEffect(() => {
    if (profile.data) {
      resetProfile({
        firstName: profile.data.firstName,
        lastName: profile.data.lastName,
        userName: profile.data.userName,
        email: profile.data.email,
      });
    }
  }, [profile.data, resetProfile]);

  const onProfileSubmit = handleProfileSubmit((values) => {
    startProfileTransition(async () => {
      try {
        await usersApi.updateMe(values);
        toast("Perfil actualizado.", "success");
        await mutate("users-me");
      } catch (err) {
        if (err instanceof ValidationError) {
          for (const [field, message] of Object.entries(err.fieldErrors)) {
            setProfileError(field as keyof ProfileInput, { message });
          }
          return;
        }
        toast(err instanceof ApiError ? err.message : "No se pudo actualizar.", "error");
      }
    });
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    setError: setPasswordError,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onPasswordSubmit = handlePasswordSubmit((values) => {
    startPasswordTransition(async () => {
      try {
        await usersApi.changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });
        toast("Contraseña actualizada.", "success");
        resetPassword();
      } catch (err) {
        if (err instanceof ValidationError) {
          for (const [field, message] of Object.entries(err.fieldErrors)) {
            setPasswordError(field as keyof ChangePasswordInput, { message });
          }
          return;
        }
        toast(err instanceof ApiError ? err.message : "No se pudo cambiar.", "error");
      }
    });
  });

  if (profile.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton height={40} width="40%" />
        <Skeleton height={200} />
      </div>
    );
  }

  if (profile.error) {
    return <ErrorState message="No pudimos cargar tu perfil." />;
  }

  return (
    <>
      <PageHeader
        eyebrow="08 — PERFIL"
        title={profile.data ? `${profile.data.firstName} ${profile.data.lastName}` : "Perfil"}
        description="Datos de tu cuenta y seguridad."
        actions={
          <Badge variant="outline">{profile.data?.role.name}</Badge>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Datos personales</CardTitle>
              <CardDescription>
                Miembro desde {formatDate(profile.data?.created)}.
              </CardDescription>
            </div>
          </CardHeader>
          <form onSubmit={onProfileSubmit} noValidate>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  label="Nombre"
                  required
                  {...registerProfile("firstName")}
                  error={profileErrors.firstName?.message}
                />
                <Input
                  label="Apellido"
                  required
                  {...registerProfile("lastName")}
                  error={profileErrors.lastName?.message}
                />
              </div>
              <Input
                label="Usuario"
                required
                {...registerProfile("userName")}
                error={profileErrors.userName?.message}
              />
              <Input
                label="Email"
                type="email"
                required
                {...registerProfile("email")}
                error={profileErrors.email?.message}
              />
            </CardBody>
            <div className="flex items-center justify-end gap-2 px-5 py-4 hairline-t">
              <Button
                leftIcon={<Save size={14} />}
                isLoading={isProfileSubmitting || isProfilePending}
                disabled={isProfileSubmitting || isProfilePending}
              >
                Guardar
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Cambiar contraseña</CardTitle>
              <CardDescription>
                Usa al menos 8 caracteres y combina letras, números y símbolos.
              </CardDescription>
            </div>
          </CardHeader>
          <form onSubmit={onPasswordSubmit} noValidate>
            <CardBody className="space-y-4">
              <Input
                label="Contraseña actual"
                type="password"
                autoComplete="current-password"
                required
                {...registerPassword("currentPassword")}
                error={passwordErrors.currentPassword?.message}
              />
              <Input
                label="Nueva contraseña"
                type="password"
                autoComplete="new-password"
                required
                {...registerPassword("newPassword")}
                error={passwordErrors.newPassword?.message}
              />
              <Input
                label="Confirmar nueva contraseña"
                type="password"
                autoComplete="new-password"
                required
                {...registerPassword("confirmPassword")}
                error={passwordErrors.confirmPassword?.message}
              />
            </CardBody>
            <div className="flex items-center justify-end gap-2 px-5 py-4 hairline-t">
              <Button
                variant="secondary"
                leftIcon={<KeyRound size={14} />}
                isLoading={isPasswordSubmitting || isPasswordPending}
                disabled={isPasswordSubmitting || isPasswordPending}
              >
                Cambiar
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          variant="danger"
          size="sm"
          onClick={() => {
            void logout();
          }}
        >
          Cerrar sesión
        </Button>
      </div>
    </>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileContent />
    </Suspense>
  );
}
