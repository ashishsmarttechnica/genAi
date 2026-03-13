// Import Dependencies
import { RouterProvider } from "react-router";

// Local Imports
import { BreakpointProvider } from "app/contexts/breakpoint/Provider";
import { LocaleProvider } from "app/contexts/locale/Provider";
import { SidebarProvider } from "app/contexts/sidebar/Provider";
import { ThemeProvider } from "app/contexts/theme/Provider";
import router from "app/router/router";

// ----------------------------------------------------------------------

function App() {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <BreakpointProvider>
          <SidebarProvider>
            <RouterProvider router={router} />
          </SidebarProvider>
        </BreakpointProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}

export default App;