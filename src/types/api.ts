export type ISODate = string;
export type ISODateTime = string;

export type RoleName = "admin" | "trainer" | "user";

export interface Role {
  id: number;
  name: RoleName | string;
  description: string;
  status: boolean;
  created: ISODateTime;
  updated: ISODateTime;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  fullName?: string;
  userName: string;
  email: string;
  status: boolean;
  lastLogin: ISODateTime | null;
  role: Role;
  roleId: number | null;
  created: ISODateTime;
  updated: ISODateTime;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RefreshResponse {
  access: string;
  refresh?: string;
}

export interface Page<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Muscle {
  id: number;
  name: string;
  imgUrl: string;
  description: string;
  status: boolean;
  created: ISODateTime;
  updated: ISODateTime;
}

export type MuscleRole = "primary" | "secondary" | "stabilizer";

export interface ExerciseMuscle {
  id: number;
  idMuscle: number;
  muscleName: string;
  role: MuscleRole;
}

export interface Exercise {
  id: number;
  name: string;
  description: string;
  videoUrl: string;
  status: boolean;
  created: ISODateTime;
  updated: ISODateTime;
  muscles?: ExerciseMuscle[];
  muscleIds?: number[];
}

export interface IntensityTechnique {
  id: number;
  name: string;
  description: string;
  status: boolean;
  created: ISODateTime;
  updated: ISODateTime;
}

export interface SplitDay {
  id: number;
  idSplit: number;
  dayNumber: number;
  name: string;
  status: boolean;
  created: ISODateTime;
  updated: ISODateTime;
}

export interface Split {
  id: number;
  name: string;
  description: string;
  status: boolean;
  created: ISODateTime;
  updated: ISODateTime;
  days: SplitDay[];
}

export interface MySplit {
  id: number;
  idUser: number;
  idSplit: number;
  splitName: string;
  startDate: ISODate;
  endDate: ISODate | null;
  isActive: boolean;
  status: boolean;
  created: ISODateTime;
  updated: ISODateTime;
}

export interface RoutineEntry {
  id: number;
  idUserSplit: number;
  idSplitDay: number;
  dayNumber: number;
  dayName: string;
  idExercise: number;
  exerciseName: string;
  exercise?: Exercise;
  order: number;
  targetSets: number;
  targetReps: string;
  status: boolean;
  created: ISODateTime;
  updated: ISODateTime;
}

export interface Workout {
  id: number;
  idRoutine: number;
  idIntensityTechnique: number | null;
  intensityTechnique?: IntensityTechnique | null;
  exerciseName: string;
  dayNumber: number;
  workoutDate: ISODateTime;
  setNumber: number;
  repetitions: number;
  kg: string;
  rpe: string | null;
  notes: string;
  status: boolean;
  created: ISODateTime;
  updated: ISODateTime;
}

export interface WorkoutStat {
  idRoutine__idExercise__id: number;
  idRoutine__idExercise__name: string;
  totalSets: number;
  totalReps: number;
  totalVolume: string;
}

export interface WorkoutStatsResponse {
  byExercise: WorkoutStat[];
}

export interface MyExercise {
  id: number;
  idUser: number;
  exerciseId: number;
  exerciseName: string;
  exercise?: Exercise;
  created: ISODateTime;
}

export interface ApiErrorBody {
  detail?: string;
  [field: string]: string[] | string | undefined;
}
