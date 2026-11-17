import type { RouteObject } from "react-router";

import { ROUTES } from "@/shared/config";

export const appRoutes: RouteObject[] = [
  { path: ROUTES.HOME, lazy: () => import("@/pages/landing") },
  { path: ROUTES.DASHBOARD, lazy: () => import("@/pages/dashboard") },
  { path: "*", lazy: () => import("@/pages/not-found") }
];
