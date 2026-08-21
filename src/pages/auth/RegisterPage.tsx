import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useAuth } from "../../features/auth/hooks";
import { registerSchema, type RegisterInput } from "../../features/auth/schemas";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardFooter } from "../../components/ui/Card";
import { ApiError, ValidationError } from "../../lib/api/errors";
import { toast } from "../../components/ui/use-toast";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      userName: "",
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      try {
        await registerUser({
          firstName: values.firstName,
          lastName: values.lastName,
          userName: values.userName,
          email: values.email,
          password: values.password,
          passwordConfirm: values.passwordConfirm,
        });
        navigate("/dashboard", { replace: true });
      } catch (err) {
        if (err instanceof ValidationError) {
          for (const [field, message] of Object.entries(err.fieldErrors) as [keyof RegisterInput, string][]) {
            setError(field, { message });
          }
          return;
        }
        if (err instanceof ApiError) {
          toast(err.message, "error");
          return;
        }
        toast("No se pudo crear la cuenta.", "error");
      }
    });
  });

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[var(--bg)] px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-start gap-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--ink)] font-display text-base font-bold text-[var(--paper)]">
            IN
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Crear cuenta
          </h1>
          <p className="text-sm text-steel">
            Únete y empieza a registrar tu entrenamiento.
          </p>
        </div>

        <Card>
          <form onSubmit={onSubmit} noValidate>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Nombre"
                  required
                  {...register("firstName")}
                  error={errors.firstName?.message}
                />
                <Input
                  label="Apellido"
                  required
                  {...register("lastName")}
                  error={errors.lastName?.message}
                />
              </div>
              <Input
                label="Usuario"
                required
                {...register("userName")}
                error={errors.userName?.message}
                hint="Será tu identificador público."
              />
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                required
                {...register("email")}
                error={errors.email?.message}
              />
              <Input
                label="Contraseña"
                type="password"
                autoComplete="new-password"
                required
                {...register("password")}
                error={errors.password?.message}
                hint="Mínimo 8 caracteres."
              />
              <Input
                label="Confirmar contraseña"
                type="password"
                autoComplete="new-password"
                required
                {...register("passwordConfirm")}
                error={errors.passwordConfirm?.message}
              />
            </CardBody>
            <CardFooter className="flex-col items-stretch gap-3">
              <Button
                type="submit"
                block
                isLoading={isSubmitting || isPending}
                disabled={isSubmitting || isPending}
              >
                Crear cuenta
              </Button>
              <p className="text-center text-xs text-steel">
                ¿Ya tienes cuenta?{" "}
                <Link to="/login" className="font-medium text-[var(--accent)] hover:underline">
                  Iniciar sesión
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
