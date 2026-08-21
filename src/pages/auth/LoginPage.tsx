import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useAuth } from "../../features/auth/hooks";
import { loginSchema, type LoginInput } from "../../features/auth/schemas";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardFooter } from "../../components/ui/Card";
import { ApiError, ValidationError } from "../../lib/api/errors";
import { toast } from "../../components/ui/use-toast";

interface LocationState {
  from?: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      try {
        await login(values.email, values.password);
        const dest = (location.state as LocationState | null)?.from ?? "/dashboard";
        navigate(dest, { replace: true });
      } catch (err) {
        if (err instanceof ValidationError) {
          for (const [field, message] of Object.entries(err.fieldErrors) as [keyof LoginInput, string][]) {
            setError(field, { message });
          }
          return;
        }
        if (err instanceof ApiError) {
          toast(err.message, "error");
          return;
        }
        toast("No se pudo iniciar sesión. Inténtalo de nuevo.", "error");
      }
    });
  });

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-start gap-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--ink)] font-display text-base font-bold text-[var(--paper)]">
            IN
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Iron Notebook
          </h1>
          <p className="text-sm text-steel">Inicia sesión para continuar.</p>
        </div>

        <Card>
          <form onSubmit={onSubmit} noValidate>
            <CardBody className="space-y-4">
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
                autoComplete="current-password"
                required
                {...register("password")}
                error={errors.password?.message}
              />
            </CardBody>
            <CardFooter className="flex-col items-stretch gap-3">
              <Button
                type="submit"
                block
                isLoading={isSubmitting || isPending}
                disabled={isSubmitting || isPending}
              >
                Entrar
              </Button>
              <p className="text-center text-xs text-steel">
                ¿Sin cuenta?{" "}
                <Link to="/register" className="font-medium text-[var(--accent)] hover:underline">
                  Crear cuenta
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
