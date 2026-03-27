/**
 * Module Registry — defines the contract for test modules in the A360 Web Testing Platform.
 *
 * Each module is a self-contained test capability that plugs into the shared shell.
 * Adding a new module = create folder + export TestModule descriptor + register in App.tsx.
 */
import type { SvgIconComponent } from '@mui/icons-material';

export interface ModuleRoute {
  path: string;
  label: string;
  /** Lazy-loaded page component */
  element: React.ReactNode;
}

export interface TestModule {
  /** Unique identifier (kebab-case) */
  id: string;
  /** Display name shown in nav and home page */
  name: string;
  /** Short description for home page cards */
  description: string;
  /** MUI icon component */
  icon: SvgIconComponent;
  /** Base URL path (e.g. '/extraction') */
  basePath: string;
  /** Sub-routes within this module */
  routes: ModuleRoute[];
  /** Optional: hide from nav (for dev/WIP modules) */
  hidden?: boolean;
}

/**
 * Generate React Router route objects from a module descriptor.
 */
export function moduleToRoutes(mod: TestModule) {
  return mod.routes.map((route) => ({
    path: `${mod.basePath}${route.path ? `/${route.path}` : ''}`.replace(/^\//, ''),
    element: route.element,
  }));
}
