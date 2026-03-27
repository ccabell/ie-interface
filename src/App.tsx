/**
 * A360 Web Testing Platform — Module-driven app shell.
 *
 * Each test module registers its routes, nav items, and metadata.
 * Adding a new module = create folder in modules/ + register here.
 */
import { createBrowserRouter, RouterProvider, useRouteError } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ToastContainer } from 'react-toastify';
import { theme } from '@/shared/styles/theme';
import { Layout } from '@/shell/Layout';
import { HomePage } from '@/shell/HomePage';
import { moduleToRoutes } from '@/shell/ModuleRegistry';
import 'react-toastify/dist/ReactToastify.css';

// ─── Module Registration ───
// Import and register test modules here. Each module is self-contained.
import { extractionModule } from '@/modules/extraction';
import { runsModule } from '@/modules/runs';
import { opportunitiesModule } from '@/modules/opportunities';
import { dashboardModule } from '@/modules/dashboard';

const modules = [extractionModule, runsModule, opportunitiesModule, dashboardModule];

// ─── Router ───

function RouteErrorFallback() {
  const error = useRouteError() as Error | null;
  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h5" color="error.main" gutterBottom>
        Page error
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {error?.message ?? 'An unexpected error occurred.'}
      </Typography>
    </Box>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout modules={modules} />,
    errorElement: <RouteErrorFallback />,
    children: [
      { index: true, element: <HomePage modules={modules} /> },
      // Auto-generate routes from all registered modules
      ...modules.flatMap(moduleToRoutes),
    ],
  },
]);

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
      <ToastContainer position="bottom-right" theme="light" />
    </ThemeProvider>
  );
}
