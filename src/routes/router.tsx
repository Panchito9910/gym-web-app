import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, Route, RouterProvider, createRoutesFromElements } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { RequireAuth, RedirectIfAuth, RequireRole } from "./guards";

const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const SplitsPage = lazy(() => import("../pages/SplitsPage"));
const MySplitsPage = lazy(() => import("../pages/MySplitsPage"));
const RoutinesPage = lazy(() => import("../pages/RoutinesPage"));
const WorkoutsPage = lazy(() => import("../pages/WorkoutsPage"));
const ExercisesPage = lazy(() => import("../pages/ExercisesPage"));
const ExerciseDetailPage = lazy(() => import("../pages/ExerciseDetailPage"));
const StatsPage = lazy(() => import("../pages/StatsPage"));
const ProfilePage = lazy(() => import("../pages/ProfilePage"));
const AdminUsersPage = lazy(() => import("../pages/AdminUsersPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route
        path="/login"
        element={
          <RedirectIfAuth>
            <Suspense fallback={null}>
              <LoginPage />
            </Suspense>
          </RedirectIfAuth>
        }
      />
      <Route
        path="/register"
        element={
          <RedirectIfAuth>
            <Suspense fallback={null}>
              <RegisterPage />
            </Suspense>
          </RedirectIfAuth>
        }
      />

      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={null}>
              <DashboardPage />
            </Suspense>
          }
        />
        <Route
          path="/splits"
          element={
            <Suspense fallback={null}>
              <SplitsPage />
            </Suspense>
          }
        />
        <Route
          path="/my-splits"
          element={
            <Suspense fallback={null}>
              <MySplitsPage />
            </Suspense>
          }
        />
        <Route
          path="/routines"
          element={
            <Suspense fallback={null}>
              <RoutinesPage />
            </Suspense>
          }
        />
        <Route
          path="/workouts"
          element={
            <Suspense fallback={null}>
              <WorkoutsPage />
            </Suspense>
          }
        />
        <Route
          path="/exercises"
          element={
            <Suspense fallback={null}>
              <ExercisesPage />
            </Suspense>
          }
        />
        <Route
          path="/exercises/:id"
          element={
            <Suspense fallback={null}>
              <ExerciseDetailPage />
            </Suspense>
          }
        />
        <Route
          path="/stats"
          element={
            <Suspense fallback={null}>
              <StatsPage />
            </Suspense>
          }
        />
        <Route
          path="/profile"
          element={
            <Suspense fallback={null}>
              <ProfilePage />
            </Suspense>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RequireRole role="admin">
              <Suspense fallback={null}>
                <AdminUsersPage />
              </Suspense>
            </RequireRole>
          }
        />
      </Route>

      <Route
        path="*"
        element={
          <Suspense fallback={null}>
            <NotFoundPage />
          </Suspense>
        }
      />
    </Route>,
  ),
);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
