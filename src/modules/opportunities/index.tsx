import type { TestModule } from '@/shell/ModuleRegistry';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { OpportunitiesBoard } from './pages/OpportunitiesBoard';

export const opportunitiesModule: TestModule = {
  id: 'opportunities',
  name: 'Opportunities',
  description: 'Kanban board for tracking consultation opportunities across pipeline stages.',
  icon: LightbulbIcon,
  basePath: '/opportunities',
  routes: [
    { path: '', label: 'Opportunities', element: <OpportunitiesBoard /> },
  ],
};
