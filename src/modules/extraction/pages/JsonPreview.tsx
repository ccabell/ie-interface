/**
 * JSON Preview Page — paste extraction JSON and instantly see
 * how it renders in the production Intelligence tab card system.
 */
import { useState, useCallback } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

import { IntelligenceRenderer } from '@/modules/extraction/components/IntelligenceRenderer';
import {
  mapExtractionToCards,
  validateExtractionJson,
  SAMPLE_EXTRACTION_JSON,
  type MappedCardData,
} from '@/modules/extraction/utils/extractionToCards';
import { PageHeader } from '@/shared/components/PageHeader';

export function JsonPreview() {
  const [jsonInput, setJsonInput] = useState('');
  const [cardData, setCardData] = useState<MappedCardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showEmptyCards, setShowEmptyCards] = useState(true);
  const [showRawJson, setShowRawJson] = useState(false);

  const handleRender = useCallback(() => {
    setError(null);
    setCardData(null);

    if (!jsonInput.trim()) {
      setError('Please paste extraction JSON first.');
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput);
      const validation = validateExtractionJson(parsed);

      if (!validation.valid) {
        setError(validation.error ?? 'Invalid extraction JSON.');
        return;
      }

      const mapped = mapExtractionToCards(validation.data!);
      setCardData(mapped);
    } catch (e) {
      setError(`JSON parse error: ${(e as Error).message}`);
    }
  }, [jsonInput]);

  const handleLoadSample = useCallback(() => {
    setJsonInput(JSON.stringify(SAMPLE_EXTRACTION_JSON, null, 2));
    setError(null);
    setCardData(null);
  }, []);

  const handleClear = useCallback(() => {
    setJsonInput('');
    setCardData(null);
    setError(null);
  }, []);

  return (
    <Stack gap={3}>
      <PageHeader
        title="JSON Preview"
        subtitle="Paste extraction JSON output and see how it renders in the production Intelligence tab card system"
      />

      {/* Input Section */}
      <Card>
        <CardContent>
          <Stack gap={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle2" fontWeight={600}>
                Extraction JSON
              </Typography>
              <Stack direction="row" gap={1}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AutoFixHighIcon />}
                  onClick={handleLoadSample}
                >
                  Load Sample
                </Button>
                <Button size="small" variant="outlined" color="secondary" onClick={handleClear}>
                  Clear
                </Button>
              </Stack>
            </Stack>

            <TextField
              multiline
              minRows={10}
              maxRows={20}
              value={jsonInput}
              onChange={e => setJsonInput(e.target.value)}
              placeholder='{\n  "summary": "...",\n  "patient_goals": [...],\n  "treatments_discussed": [...],\n  "concerns": [...],\n  "next_steps": [...],\n  "sentiment": "positive",\n  "commitment_score": 78\n}'
              sx={{
                fontFamily: 'monospace',
                '& .MuiInputBase-input': {
                  fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
                  fontSize: 13,
                  lineHeight: 1.6,
                },
              }}
            />

            {error && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" gap={2}>
                <FormControlLabel
                  control={
                    <Switch checked={showEmptyCards} onChange={(_, v) => setShowEmptyCards(v)} size="small" />
                  }
                  label={<Typography variant="body2">Show empty state cards</Typography>}
                />
                <FormControlLabel
                  control={
                    <Switch checked={showRawJson} onChange={(_, v) => setShowRawJson(v)} size="small" />
                  }
                  label={<Typography variant="body2">Show parsed JSON</Typography>}
                />
              </Stack>
              <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={handleRender} size="large">
                Render Cards
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Output Section */}
      {cardData && (
        <>
          <Divider>
            <Chip label="Production Card Preview" size="small" />
          </Divider>

          <Grid container spacing={2}>
            {/* Optional raw JSON panel */}
            {showRawJson && (
              <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ height: 1 }}>
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight={600} mb={1}>
                      Parsed Data
                    </Typography>
                    <Box
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: 11,
                        whiteSpace: 'pre-wrap',
                        maxHeight: 600,
                        overflow: 'auto',
                        bgcolor: '#F9FAFB',
                        p: 1.5,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      {JSON.stringify(cardData, null, 2)}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Card Preview */}
            <Grid size={{ xs: 12, md: showRawJson ? 8 : 12 }}>
              <IntelligenceRenderer data={cardData} showEmptyCards={showEmptyCards} />
            </Grid>
          </Grid>
        </>
      )}
    </Stack>
  );
}
