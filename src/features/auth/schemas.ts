import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Introduce tu email.").email("Email no válido."),
  password: z.string().min(1, "Introduce tu contraseña."),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z.string().min(1, "Introduce tu nombre.").max(100),
    lastName: z.string().min(1, "Introduce tu apellido.").max(100),
    userName: z
      .string()
      .min(3, "Mínimo 3 caracteres.")
      .max(60, "Máximo 60 caracteres.")
      .regex(/^[a-zA-Z0-9_.-]+$/, "Solo letras, números y _.-"),
    email: z.string().email("Email no válido."),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres.")
      .max(128, "Máximo 128 caracteres."),
    passwordConfirm: z.string().min(1, "Confirma tu contraseña."),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Las contraseñas no coinciden.",
    path: ["passwordConfirm"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Introduce tu contraseña actual."),
    newPassword: z
      .string()
      .min(8, "Mínimo 8 caracteres.")
      .max(128, "Máximo 128 caracteres."),
    confirmPassword: z.string().min(1, "Confirma la nueva contraseña."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const profileSchema = z.object({
  firstName: z.string().min(1, "Introduce tu nombre.").max(100),
  lastName: z.string().min(1, "Introduce tu apellido.").max(100),
  userName: z
    .string()
    .min(3, "Mínimo 3 caracteres.")
    .max(60, "Máximo 60 caracteres.")
    .regex(/^[a-zA-Z0-9_.-]+$/, "Solo letras, números y _.-"),
  email: z.string().email("Email no válido."),
});

export type ProfileInput = z.infer<typeof profileSchema>;
