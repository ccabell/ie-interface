/**
 * Config Preview — Test the config-driven card renderer with PageLayout JSON
 */
import { useState, useCallback } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

import { PageHeader } from '@/shared/components/PageHeader';
import { PageRenderer, parseAndMapJSON, type PageLayout } from '@/lib/cardRenderer';

const SAMPLE_LAYOUT = {
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      fields: [
        { cardType: 'summary', grid: { xs: 12, md: 6 }, props: { title: 'Consultation Summary', description: 'Patient presented for Botox consultation. Discussed forehead lines and crow\'s feet. Strong interest expressed.' } },
        { cardType: 'valueAccordion', grid: { xs: 12, md: 6 }, props: { title: 'Commitment Level', value: 85 } },
      ],
    },
    {
      id: 'metrics',
      title: 'Key Metrics',
      fields: [
        { cardType: 'statistic', props: { label: 'Visit Type', value: 'New Patient' } },
        { cardType: 'statistic', props: { label: 'Duration', value: '45 min' } },
        { cardType: 'statistic', props: { label: 'Services Discussed', value: '3' } },
        { cardType: 'statistic', props: { label: 'Conversion', value: 'Scheduled' } },
      ],
    },
    {
      id: 'clinical',
      title: 'Clinical Assessment',
      fields: [
        { cardType: 'concerns', props: { primary: ['Forehead lines', 'Crow\'s feet'], secondary: ['Nasolabial folds'] } },
        { cardType: 'areas', props: { treatmentAreas: ['Forehead', 'Glabella', 'Periorbital'], concernAreas: ['Upper face'] } },
        { cardType: 'patientGoals', props: { goals: ['Look refreshed for wedding', 'Natural results'], anticipatedOutcomes: ['Smoother forehead'], statedInterests: ['Botox', 'Lip filler'] } },
      ],
    },
    {
      id: 'evidence',
      title: 'Key Quotes',
      fields: [
        { cardType: 'evidence', props: { quote: 'I want to look refreshed for my daughter\'s wedding next month.', speaker: 'Patient' } },
        { cardType: 'evidence', props: { quote: 'Results typically last 3-4 months. We can adjust dosage based on response.', speaker: 'Provider' } },
        { cardType: 'evidence', props: { quote: 'Can we schedule for next week?', speaker: 'Patient' } },
      ],
    },
    {
      id: 'lists',
      title: 'Additional Info',
      fields: [
        { cardType: 'list', props: { title: 'Treatment Benefits', items: ['Natural-looking results', 'Minimal downtime', 'FDA approved'], variant: 'check' } },
        { cardType: 'keyValue', props: { title: 'Patient Details', items: [{ key: 'Age', value: '42' }, { key: 'Skin Type', value: 'Fitzpatrick III' }] } },
        { cardType: 'chips', props: { title: 'Treatment Areas', chips: ['Forehead', 'Glabella', 'Crow\'s Feet'], color: 'primary' } },
      ],
    },
  ],
};

export function ConfigPreview() {
  const [jsonInput, setJsonInput] = useState('');
  const [layout, setLayout] = useState<PageLayout | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRender = useCallback(() => {
    setError(null);
    if (!jsonInput.trim()) { setError('Please paste PageLayout JSON first.'); return; }
    const result = parseAndMapJSON(jsonInput);
    if (result) { setLayout(result); }
    else { setError('Invalid PageLayout JSON. Check console for details.'); setLayout(null); }
  }, [jsonInput]);

  const handleLoadSample = useCallback(() => {
    setJsonInput(JSON.stringify(SAMPLE_LAYOUT, null, 2));
    setLayout(parseAndMapJSON(JSON.stringify(SAMPLE_LAYOUT)));
    setError(null);
  }, []);

  return (
    <Stack gap={3}>
      <PageHeader title="Config Card Tester" subtitle="Test the config-driven card renderer with PageLayout JSON — cardType + props" />

      <Card>
        <CardContent>
          <Stack gap={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle2" fontWeight={600}>PageLayout JSON</Typography>
              <Stack direction="row" gap={1}>
                <Button size="small" variant="outlined" startIcon={<AutoFixHighIcon />} onClick={handleLoadSample}>Load Sample</Button>
                <Button size="small" variant="outlined" color="secondary" onClick={() => { setJsonInput(''); setLayout(null); setError(null); }}>Clear</Button>
              </Stack>
            </Stack>
            <TextField multiline minRows={12} maxRows={20} value={jsonInput} onChange={e => setJsonInput(e.target.value)}
              placeholder='{\n  "sections": [\n    {\n      "id": "main",\n      "title": "Section Title",\n      "fields": [\n        { "cardType": "summary", "props": { "description": "..." } }\n      ]\n    }\n  ]\n}'
              sx={{ '& .MuiInputBase-input': { fontFamily: 'monospace', fontSize: 12 } }} />
            {error && <Alert severity="error">{error}</Alert>}
            <Stack direction="row" justifyContent="flex-end">
              <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={handleRender} size="large">Render Cards</Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {layout && (
        <>
          <Divider><Chip label="Card Preview" size="small" /></Divider>
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <PageRenderer layout={layout} showMetadata />
          </Box>
        </>
      )}
    </Stack>
  );
}
