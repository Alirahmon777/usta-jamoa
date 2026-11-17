import { isRouteErrorResponse, Link, useRouteError } from "react-router";

import { ROUTES } from "@/shared/config";

function getErrorMessage(error: unknown) {
  if (isRouteErrorResponse(error)) return `${error.status} ${error.statusText}`;
  if (error instanceof Error) return error.message;
  return String(error);
}

export function RouteError() {
  const error = useRouteError();

  return (
    <main className="container" style={{ minHeight: "100svh", display: "grid", placeContent: "center", gap: 16 }}>
      <p className="display" style={{ fontSize: "clamp(40px, 8vw, 96px)" }}>
        Nimadir buzildi
      </p>
      <p style={{ color: "var(--critical)", fontFamily: "var(--mono)" }}>{getErrorMessage(error)}</p>
      <p style={{ display: "flex", gap: 24 }}>
        <button
          type="button"
          style={{ background: "none", border: 0, padding: 0, cursor: "pointer" }}
          onClick={() => window.location.reload()}
        >
          Qayta yuklash
        </button>
        <Link to={ROUTES.HOME}>← Bosh sahifa</Link>
      </p>
    </main>
  );
}
