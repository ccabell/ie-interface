import type { TestModule } from '@/shell/ModuleRegistry';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { Dashboard } from './pages/Dashboard';

export const dashboardModule: TestModule = {
  id: 'dashboard',
  name: 'Dashboard',
  description: 'KPI analytics and charts across extraction runs and opportunities.',
  icon: DashboardIcon,
  basePath: '/dashboard',
  routes: [
    { path: '', label: 'Dashboard', element: <Dashboard /> },
  ],
};
