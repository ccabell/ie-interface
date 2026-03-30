import type { TestModule } from '@/shell/ModuleRegistry';
import ScienceIcon from '@mui/icons-material/Science';
import { Simulator } from './pages/Simulator';
import { JsonPreview } from './pages/JsonPreview';
import { ConfigPreview } from './pages/ConfigPreview';

export const extractionModule: TestModule = {
  id: 'extraction',
  name: 'Extraction Cards',
  description: 'Run prompts against transcripts and preview how the output renders in production Intelligence tab cards.',
  icon: ScienceIcon,
  basePath: '/extraction',
  routes: [
    { path: '', label: 'Simulator', element: <Simulator /> },
    { path: 'preview', label: 'JSON Preview', element: <JsonPreview /> },
    { path: 'config', label: 'Config Tester', element: <ConfigPreview /> },
  ],
};
