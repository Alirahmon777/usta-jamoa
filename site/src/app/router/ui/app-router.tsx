import { createBrowserRouter, RouterProvider } from "react-router";

import { appRoutes } from "../model/routes";

const router = createBrowserRouter([{ children: appRoutes, HydrateFallback: () => null }]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
