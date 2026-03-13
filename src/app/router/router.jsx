// Import Dependencies
import { createBrowserRouter } from "react-router";

// Local Imports
import Root from "app/layouts/Root";
// import RootErrorBoundary from "app/pages/errors/RootErrorBoundary";
import { SplashScreen } from "components/template/SplashScreen";
import { protectedRoutes } from "./protected";
import { ghostRoutes } from "./ghost";
import { publicRoutes } from "./public";

// ----------------------------------------------------------------------

// In development: No ErrorBoundary → Vite's HMR overlay shows automatically ✅
// In production:  ErrorBoundary active → clean custom error pages ✅
// const isDev = import.meta.env.DEV;

const router = createBrowserRouter([
  {
    id: "root",
    Component: Root,
    hydrateFallbackElement: <SplashScreen />,
    // ...(!isDev && { ErrorBoundary: RootErrorBoundary }),
    children: [protectedRoutes, ghostRoutes, publicRoutes],
  },
]);

export default router;
