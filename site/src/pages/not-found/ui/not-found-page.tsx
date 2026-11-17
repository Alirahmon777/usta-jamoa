import { Link } from "react-router";

import { ROUTES } from "@/shared/config";

export function NotFoundPage() {
  return (
    <main className="container" style={{ minHeight: "100svh", display: "grid", placeContent: "center", gap: 16 }}>
      <p className="display" style={{ fontSize: "clamp(80px, 18vw, 240px)" }}>
        404
      </p>
      <Link to={ROUTES.HOME}>← Bosh sahifa</Link>
    </main>
  );
}
