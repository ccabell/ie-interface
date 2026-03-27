import type { TestModule } from '@/shell/ModuleRegistry';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import { RunsList } from './pages/RunsList';
import { RunDetail } from './pages/RunDetail';
import { Agents } from './pages/Agents';

export const runsModule: TestModule = {
  id: 'runs',
  name: 'Run Explorer',
  description: 'Browse extraction runs, view layered outputs, and execute downstream agents on results.',
  icon: PlaylistPlayIcon,
  basePath: '/runs',
  routes: [
    { path: '', label: 'Runs', element: <RunsList /> },
    { path: ':runId', label: 'Run Detail', element: <RunDetail /> },
    { path: 'agents', label: 'Agents', element: <Agents /> },
  ],
};
