import { apiRequest } from "./client";
import type {
  AuthResponse,
  Exercise,
  ExerciseMuscle,
  IntensityTechnique,
  Muscle,
  MyExercise,
  MySplit,
  Page,
  RefreshResponse,
  Role,
  RoutineEntry,
  Split,
  SplitDay,
  User,
  Workout,
  WorkoutStatsResponse,
} from "../../types/api";

export const authApi = {
  register: (body: {
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    password: string;
    passwordConfirm: string;
  }) => apiRequest<User>("/api/auth/register", { method: "POST", body, auth: false }),

  login: (body: { email: string; password: string }) =>
    apiRequest<AuthResponse>("/api/auth/login", { method: "POST", body, auth: false }),

  refresh: (refresh: string) =>
    apiRequest<RefreshResponse>("/api/auth/refresh", {
      method: "POST",
      body: { refresh },
      auth: false,
      retryOn401: false,
    }),

  logout: (refresh: string) =>
    apiRequest<{ detail: string }>("/api/auth/logout", {
      method: "POST",
      body: { refresh },
    }),
};

export const usersApi = {
  list: (query?: { role?: string }) =>
    apiRequest<Page<User>>("/api/users/", { query }),
  me: () => apiRequest<User>("/api/users/me/"),
  updateMe: (body: Partial<Pick<User, "firstName" | "lastName" | "userName" | "email">>) =>
    apiRequest<User>("/api/users/me/", { method: "PATCH", body }),
  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    apiRequest<{ detail: string }>("/api/users/me/change-password/", {
      method: "POST",
      body,
    }),
};

export const rolesApi = {
  list: () => apiRequest<Page<Role>>("/api/roles/"),
};

export const musclesApi = {
  list: (query?: { search?: string; ordering?: string }) =>
    apiRequest<Page<Muscle>>("/api/muscles/", { query }),
  create: (body: { name: string; imgUrl?: string; description?: string }) =>
    apiRequest<Muscle>("/api/muscles/", { method: "POST", body }),
};

export const exercisesApi = {
  list: (query?: { search?: string; ordering?: string }) =>
    apiRequest<Page<Exercise>>("/api/exercises/", { query }),
  get: (id: number) => apiRequest<Exercise>(`/api/exercises/${id}/`),
  create: (body: {
    name: string;
    description?: string;
    videoUrl?: string;
    muscleIds: number[];
  }) => apiRequest<Exercise>("/api/exercises/", { method: "POST", body }),
  update: (
    id: number,
    body: Partial<{ name: string; description: string; videoUrl: string; muscleIds: number[] }>,
  ) => apiRequest<Exercise>(`/api/exercises/${id}/`, { method: "PATCH", body }),
  remove: (id: number) => apiRequest<void>(`/api/exercises/${id}/`, { method: "DELETE" }),
  muscles: (id: number) => apiRequest<ExerciseMuscle[]>(`/api/exercises/${id}/muscles/`),
};

export const intensityApi = {
  list: () => apiRequest<Page<IntensityTechnique>>("/api/intensity-techniques/"),
};

export const splitsApi = {
  list: () => apiRequest<Page<Split>>("/api/splits/"),
  get: (id: number) => apiRequest<Split>(`/api/splits/${id}/`),
  days: (id: number) => apiRequest<SplitDay[]>(`/api/splits/${id}/days/`),
  addDay: (id: number, body: { dayNumber: number; name: string }) =>
    apiRequest<SplitDay>(`/api/splits/${id}/days/`, { method: "POST", body }),
  updateDay: (id: number, dayId: number, body: Partial<{ dayNumber: number; name: string }>) =>
    apiRequest<SplitDay>(`/api/splits/${id}/days/${dayId}/`, { method: "PATCH", body }),
  removeDay: (id: number, dayId: number) =>
    apiRequest<void>(`/api/splits/${id}/days/${dayId}/`, { method: "DELETE" }),
};

export const mySplitsApi = {
  list: () => apiRequest<Page<MySplit>>("/api/my-splits/"),
  active: () => apiRequest<MySplit>("/api/my-splits/active/"),
  adopt: (body: { idSplit: number; startDate: string; endDate?: string; isActive: boolean }) =>
    apiRequest<MySplit>("/api/my-splits/", { method: "POST", body }),
  update: (
    id: number,
    body: Partial<{ endDate: string | null; isActive: boolean }>,
  ) => apiRequest<MySplit>(`/api/my-splits/${id}/`, { method: "PATCH", body }),
  remove: (id: number) => apiRequest<void>(`/api/my-splits/${id}/`, { method: "DELETE" }),
};

export const routinesApi = {
  list: (query?: { ordering?: string }) =>
    apiRequest<Page<RoutineEntry>>("/api/my-routines/", { query }),
  byDay: (dayId: number) =>
    apiRequest<RoutineEntry[]>(`/api/my-routines/by-day/`, { query: { dayId } }),
  create: (body: {
    idUserSplit: number;
    idSplitDay: number;
    idExercise: number;
    order: number;
    targetSets: number;
    targetReps: string;
  }) => apiRequest<RoutineEntry>("/api/my-routines/", { method: "POST", body }),
  update: (
    id: number,
    body: Partial<{ order: number; targetSets: number; targetReps: string }>,
  ) => apiRequest<RoutineEntry>(`/api/my-routines/${id}/`, { method: "PATCH", body }),
  remove: (id: number) => apiRequest<void>(`/api/my-routines/${id}/`, { method: "DELETE" }),
};

export const workoutsApi = {
  list: (query?: { routineId?: number; ordering?: string }) =>
    apiRequest<Page<Workout>>("/api/workouts/", { query }),
  create: (body: {
    idRoutine: number;
    idIntensityTechnique?: number | null;
    setNumber: number;
    repetitions: number;
    kg: string;
    rpe?: string | null;
    notes?: string;
  }) => apiRequest<Workout>("/api/workouts/", { method: "POST", body }),
  update: (
    id: number,
    body: Partial<{
      setNumber: number;
      repetitions: number;
      kg: string;
      rpe: string | null;
      notes: string;
    }>,
  ) => apiRequest<Workout>(`/api/workouts/${id}/`, { method: "PATCH", body }),
  remove: (id: number) => apiRequest<void>(`/api/workouts/${id}/`, { method: "DELETE" }),
  stats: (query?: { routineId?: number }) =>
    apiRequest<WorkoutStatsResponse>("/api/workouts/stats/", { query }),
};

export const myExercisesApi = {
  list: () => apiRequest<Page<MyExercise>>("/api/my-exercises/"),
  add: (body: { idExercise: number }) =>
    apiRequest<MyExercise>("/api/my-exercises/", { method: "POST", body }),
  remove: (id: number) => apiRequest<void>(`/api/my-exercises/${id}/`, { method: "DELETE" }),
};
