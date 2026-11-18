import { createBrowserRouter, RouterProvider } from "react-router";

import { appRoutes } from "../model/routes";
import { RouteError } from "./route-error";

const router = createBrowserRouter([{ children: appRoutes, HydrateFallback: () => null, ErrorBoundary: RouteError }]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
