// Import Dependencies
import { isRouteErrorResponse, useRouteError } from "react-router";
import { lazy } from "react";

// Local Imports
import { Loadable } from "components/shared/Loadable";

// ----------------------------------------------------------------------

const app = {
  401: lazy(() => import("./401")),
  404: lazy(() => import("./404")),
  429: lazy(() => import("./429")),
  500: lazy(() => import("./500")),
};

const isDev = import.meta.env.DEV;

function RootErrorBoundary() {
  const error = useRouteError();

  // Always log error to console for debugging
  console.error("[RootErrorBoundary] Caught error:", error);

  if (isRouteErrorResponse(error)) {
    // Safely handle - only render if we have a page for this status
    const ErrorPage = app[error.status];
    if (!ErrorPage) {
      return (
        <div style={{ padding: "2rem", fontFamily: "monospace" }}>
          <h2>HTTP Error {error.status}</h2>
          <p>{error.statusText}</p>
        </div>
      );
    }
    const Component = Loadable(ErrorPage);
    return <Component />;
  }

  // In development: show actual error details to help debug
  if (isDev) {
    return (
      <div
        style={{
          padding: "2rem",
          fontFamily: "monospace",
          background: "#1a1a1a",
          color: "#ff6b6b",
          minHeight: "100vh",
        }}
      >
        <h2 style={{ color: "#ff4444", borderBottom: "1px solid #ff4444", paddingBottom: "0.5rem" }}>
          ⛔ Something went wrong
        </h2>
        <p style={{ color: "#fff", marginTop: "1rem" }}>
          <strong>Error:</strong> {error?.message || String(error)}
        </p>
        {error?.stack && (
          <pre
            style={{
              marginTop: "1rem",
              padding: "1rem",
              background: "#2a2a2a",
              color: "#ffa500",
              borderRadius: "4px",
              overflowX: "auto",
              fontSize: "0.8rem",
              whiteSpace: "pre-wrap",
            }}
          >
            {error.stack}
          </pre>
        )}
      </div>
    );
  }

  // In production: show clean generic message
  return <div>Something went wrong</div>;
}

export default RootErrorBoundary;
