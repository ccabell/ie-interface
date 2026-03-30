/**
 * Simulator Page — run prompts against transcripts and see output in production cards.
 *
 * Selection flow:
 *   1. Prompt Set OR Prompt Template (mutually exclusive)
 *   2. Transcript OR Run (mutually exclusive)
 *   3. Practice Library
 *   4. Run → see output in cards + raw JSON
 */
import { useState, useEffect, useCallback } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import ScienceIcon from '@mui/icons-material/Science';

import { IntelligenceRenderer } from '@/modules/extraction/components/IntelligenceRenderer';
import {
  mapExtractionToCards,
  mapRunResponseToCards,
  validateExtractionJson,
  type MappedCardData,
  type ExtractionOutput,
  type RunExtractionResponse,
} from '@/modules/extraction/utils/extractionToCards';
import { PageHeader } from '@/shared/components/PageHeader';
import { client as apiClient } from '@/shared/api/client';

// ─── Types ───

interface PromptSetOption {
  id: string;
  set_id: string;
  name: string;
  description?: string;
  prompt_order: string[];
  prompt_versions?: Record<string, string>;
}

interface PromptTemplateOption {
  id: string;
  prompt_id: string;
  name: string;
  description?: string;
  version: string;
}

interface TranscriptOption {
  id: string;
  label: string;
  consult_number?: number;
  clinic?: string;
  transcript_summary?: string;
  duration_minutes?: number;
  consult_type?: string;
}

interface RunOption {
  id: string;
  run_id?: string;
  status?: string;
  transcript_id?: string;
  created_at?: string;
}

interface PracticeOption {
  id: string;
  name: string;
  slug?: string;
}

// ─── Component ───

export function Simulator() {
  // Prompt selection: set OR template (mutually exclusive)
  const [promptMode, setPromptMode] = useState<'set' | 'template'>('set');
  const [selectedPromptSet, setSelectedPromptSet] = useState('');
  const [selectedPromptTemplate, setSelectedPromptTemplate] = useState('');

  // Input selection: transcript OR run (mutually exclusive)
  const [inputMode, setInputMode] = useState<'transcript' | 'run'>('transcript');
  const [selectedTranscript, setSelectedTranscript] = useState('');
  const [selectedRun, setSelectedRun] = useState('');

  // Practice
  const [selectedPractice, setSelectedPractice] = useState('');

  // Data lists
  const [promptSets, setPromptSets] = useState<PromptSetOption[]>([]);
  const [promptTemplates, setPromptTemplates] = useState<PromptTemplateOption[]>([]);
  const [transcripts, setTranscripts] = useState<TranscriptOption[]>([]);
  const [runs, setRuns] = useState<RunOption[]>([]);
  const [practices, setPractices] = useState<PracticeOption[]>([]);

  // Execution state
  const [isLoading, setIsLoading] = useState(false);
  const [rawOutput, setRawOutput] = useState('');
  const [cardData, setCardData] = useState<MappedCardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showEmptyCards, setShowEmptyCards] = useState(true);
  const [showRawJson, setShowRawJson] = useState(true);

  // Fetch all options on mount
  useEffect(() => {
    const load = async () => {
      const [setsRes, templatesRes, transcriptsRes, runsRes, practicesRes] = await Promise.allSettled([
        apiClient.get('/prompt_sets'),
        apiClient.get('/prompt_templates'),
        apiClient.get('/transcripts'),
        apiClient.get('/runs'),
        apiClient.get('/practices'),
      ]);

      const unwrap = (res: PromiseSettledResult<{ data: unknown }>) => {
        if (res.status !== 'fulfilled') return [];
        const d = res.value.data;
        return Array.isArray(d) ? d : (d as Record<string, unknown>)?.data ?? [];
      };

      setPromptSets(unwrap(setsRes) as PromptSetOption[]);
      setPromptTemplates(unwrap(templatesRes) as PromptTemplateOption[]);
      setPractices(unwrap(practicesRes) as PracticeOption[]);

      const txList = unwrap(transcriptsRes) as Record<string, unknown>[];
      setTranscripts(
        txList.map((t) => ({
          id: (t.id ?? t.transcript_id) as string,
          label:
            `#${t.consult_number ?? '?'} — ${t.clinic ?? 'Unknown'}` +
            (t.duration_minutes ? ` (${Math.round(t.duration_minutes as number)}m)` : '') +
            (t.transcript_summary
              ? ` — ${(t.transcript_summary as string).slice(0, 80)}…`
              : ''),
          consult_number: t.consult_number as number,
          clinic: t.clinic as string,
          transcript_summary: t.transcript_summary as string,
          duration_minutes: t.duration_minutes as number,
          consult_type: t.consult_type as string,
        })),
      );

      setRuns(unwrap(runsRes) as RunOption[]);
    };
    load();
  }, []);

  // Clear the other selection when mode toggles
  const handlePromptModeChange = (mode: 'set' | 'template') => {
    setPromptMode(mode);
    if (mode === 'set') setSelectedPromptTemplate('');
    else setSelectedPromptSet('');
  };

  const handleInputModeChange = (mode: 'transcript' | 'run') => {
    setInputMode(mode);
    if (mode === 'transcript') setSelectedRun('');
    else setSelectedTranscript('');
  };

  // ─── Run ───
  const handleRun = useCallback(async () => {
    setError(null);
    setCardData(null);
    setRawOutput('');
    setIsLoading(true);

    try {
      const payload: Record<string, unknown> = {};

      // Prompt selection
      if (promptMode === 'set' && selectedPromptSet) {
        payload.prompt_set_id = selectedPromptSet;
      } else if (promptMode === 'template' && selectedPromptTemplate) {
        payload.prompt_template_id = selectedPromptTemplate;
      }

      // Input selection
      if (inputMode === 'transcript' && selectedTranscript) {
        payload.transcript_id = selectedTranscript;
      } else if (inputMode === 'run' && selectedRun) {
        payload.run_id = selectedRun;
      }

      // Practice
      if (selectedPractice) {
        payload.catalog_id = selectedPractice;
      }

      // Use /run_extraction for transcript mode, /run_downstream for run mode
      const endpoint = inputMode === 'transcript' ? '/run_extraction' : '/run_downstream';

      // For /run_downstream, map fields to expected shape
      if (inputMode === 'run') {
        payload.module_id = promptMode === 'set' ? selectedPromptSet : selectedPromptTemplate;
        payload.selected_outputs = [];
        delete payload.prompt_set_id;
        delete payload.prompt_template_id;
      }

      const response = await apiClient.post(endpoint, payload);
      const output = response.data;
      const jsonStr = JSON.stringify(output, null, 2);
      setRawOutput(jsonStr);

      tryMapToCards(output);
    } catch (e) {
      setError(`API error: ${(e as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  }, [promptMode, selectedPromptSet, selectedPromptTemplate, inputMode, selectedTranscript, selectedRun, selectedPractice]);

  function tryMapToCards(output: unknown) {
    if (!output || typeof output !== 'object') {
      setError('Response received but could not parse. Check raw JSON.');
      return;
    }

    // First, try the new mapRunResponseToCards which handles both V3 and legacy formats
    const mappedCards = mapRunResponseToCards(output as RunExtractionResponse);
    if (mappedCards) {
      setCardData(mappedCards);
      return;
    }

    // Fallback: try legacy extraction at top level
    const obj = output as Record<string, unknown>;
    let extractionData: ExtractionOutput | null = null;

    // Try various response shapes
    if (obj.summary || obj.patient_goals || obj.treatments_discussed) {
      extractionData = obj as ExtractionOutput;
    }

    if (extractionData) {
      const validation = validateExtractionJson(extractionData);
      if (validation.valid && validation.data) {
        setCardData(mapExtractionToCards(validation.data));
      } else {
        setError(validation.error ?? 'Could not validate extraction output.');
      }
    } else {
      setError('Response received but could not find extraction fields. Check the raw JSON output.');
    }
  }

  const hasInput = inputMode === 'transcript' ? !!selectedTranscript : !!selectedRun;
  const canRun = hasInput; // prompt is optional (uses default), input is required

  return (
    <Stack gap={3}>
      <PageHeader
        title="Prompt Simulator"
        subtitle="Run extraction prompts on transcripts and preview how the output renders in the production card system"
      />

      {/* ─── Selection Panel ─── */}
      <Card>
        <CardContent>
          <Stack gap={3}>

            {/* Section 1: Prompt Selection */}
            <Stack gap={1.5}>
              <Typography variant="subtitle2" fontWeight={700}>
                1. Select Prompt
              </Typography>

              <RadioGroup
                row
                value={promptMode}
                onChange={(e) => handlePromptModeChange(e.target.value as 'set' | 'template')}
              >
                <FormControlLabel value="set" control={<Radio size="small" />} label="Prompt Set" />
                <FormControlLabel value="template" control={<Radio size="small" />} label="Prompt Template" />
              </RadioGroup>

              {promptMode === 'set' ? (
                <FormControl fullWidth size="small">
                  <InputLabel>Prompt Set</InputLabel>
                  <Select
                    value={selectedPromptSet}
                    label="Prompt Set"
                    onChange={(e: SelectChangeEvent) => setSelectedPromptSet(e.target.value)}
                  >
                    <MenuItem value="">
                      <em>Default (server decides)</em>
                    </MenuItem>
                    {promptSets.map((ps) => (
                      <MenuItem key={ps.id} value={ps.set_id}>
                        <Stack>
                          <Stack direction="row" alignItems="center" gap={1}>
                            <Typography variant="body2" fontWeight={600}>{ps.name}</Typography>
                            <Chip label={`${ps.prompt_order.length}-step`} size="small" sx={{ borderRadius: 1, height: 20, fontSize: 11 }} />
                          </Stack>
                          {ps.description && (
                            <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 500 }} noWrap>
                              {ps.description}
                            </Typography>
                          )}
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <FormControl fullWidth size="small">
                  <InputLabel>Prompt Template</InputLabel>
                  <Select
                    value={selectedPromptTemplate}
                    label="Prompt Template"
                    onChange={(e: SelectChangeEvent) => setSelectedPromptTemplate(e.target.value)}
                  >
                    {promptTemplates.map((pt) => (
                      <MenuItem key={pt.id} value={pt.id}>
                        <Stack direction="row" alignItems="center" gap={1}>
                          <Typography variant="body2" fontWeight={600}>{pt.name}</Typography>
                          <Chip label={pt.version} size="small" variant="outlined" sx={{ borderRadius: 1, height: 20, fontSize: 11 }} />
                          <Chip label={pt.prompt_id} size="small" color="primary" sx={{ borderRadius: 1, height: 20, fontSize: 11 }} />
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Stack>

            <Divider />

            {/* Section 2: Input Selection */}
            <Stack gap={1.5}>
              <Typography variant="subtitle2" fontWeight={700}>
                2. Select Input
              </Typography>

              <RadioGroup
                row
                value={inputMode}
                onChange={(e) => handleInputModeChange(e.target.value as 'transcript' | 'run')}
              >
                <FormControlLabel value="transcript" control={<Radio size="small" />} label="Transcript" />
                <FormControlLabel value="run" control={<Radio size="small" />} label="Existing Run" />
              </RadioGroup>

              {inputMode === 'transcript' ? (
                <FormControl fullWidth size="small">
                  <InputLabel>Transcript</InputLabel>
                  <Select
                    value={selectedTranscript}
                    label="Transcript"
                    onChange={(e: SelectChangeEvent) => setSelectedTranscript(e.target.value)}
                  >
                    {transcripts.map((t) => (
                      <MenuItem key={t.id} value={t.id}>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 700 }}>
                          {t.label}
                        </Typography>
                      </MenuItem>
                    ))}
                    {transcripts.length === 0 && <MenuItem disabled>No transcripts available</MenuItem>}
                  </Select>
                </FormControl>
              ) : (
                <FormControl fullWidth size="small">
                  <InputLabel>Run</InputLabel>
                  <Select
                    value={selectedRun}
                    label="Run"
                    onChange={(e: SelectChangeEvent) => setSelectedRun(e.target.value)}
                  >
                    {runs.map((r) => (
                      <MenuItem key={r.id} value={r.id}>
                        <Stack direction="row" alignItems="center" gap={1}>
                          <Typography variant="body2" fontFamily="monospace">
                            {(r.run_id ?? r.id).slice(0, 8)}…
                          </Typography>
                          {r.status && (
                            <Chip
                              label={r.status}
                              size="small"
                              color={r.status === 'success' ? 'success' : r.status === 'running' ? 'warning' : 'default'}
                              sx={{ borderRadius: 1, height: 20, fontSize: 11 }}
                            />
                          )}
                          {r.created_at && (
                            <Typography variant="caption" color="text.secondary">
                              {new Date(r.created_at).toLocaleDateString()}
                            </Typography>
                          )}
                        </Stack>
                      </MenuItem>
                    ))}
                    {runs.length === 0 && <MenuItem disabled>No runs available</MenuItem>}
                  </Select>
                </FormControl>
              )}
            </Stack>

            <Divider />

            {/* Section 3: Practice Library */}
            <Stack gap={1.5}>
              <Typography variant="subtitle2" fontWeight={700}>
                3. Practice Library
              </Typography>

              <FormControl fullWidth size="small">
                <InputLabel>Practice</InputLabel>
                <Select
                  value={selectedPractice}
                  label="Practice"
                  onChange={(e: SelectChangeEvent) => setSelectedPractice(e.target.value)}
                >
                  <MenuItem value="">
                    <em>None (no catalog injection)</em>
                  </MenuItem>
                  {practices.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      <Typography variant="body2" fontWeight={600}>{p.name}</Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Divider />

            {/* Controls + Run Button */}
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" gap={2}>
                <FormControlLabel
                  control={<Switch checked={showEmptyCards} onChange={(_, v) => setShowEmptyCards(v)} size="small" />}
                  label={<Typography variant="body2">Show empty cards</Typography>}
                />
                <FormControlLabel
                  control={<Switch checked={showRawJson} onChange={(_, v) => setShowRawJson(v)} size="small" />}
                  label={<Typography variant="body2">Show raw JSON</Typography>}
                />
              </Stack>

              <Button
                variant="contained"
                size="large"
                startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : <ScienceIcon />}
                onClick={handleRun}
                disabled={!canRun || isLoading}
              >
                {isLoading ? 'Running…' : 'Run Prompt'}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Results */}
      {(cardData || rawOutput) && (
        <>
          <Divider>
            <Chip label="Prompt Output" icon={<ScienceIcon />} size="small" />
          </Divider>

          <Grid container spacing={2}>
            {showRawJson && rawOutput && (
              <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ height: 1 }}>
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight={600} mb={1}>
                      Raw JSON Response
                    </Typography>
                    <Box
                      sx={{
                        fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
                        fontSize: 11,
                        whiteSpace: 'pre-wrap',
                        maxHeight: 800,
                        overflow: 'auto',
                        bgcolor: '#F9FAFB',
                        p: 1.5,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      {rawOutput}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}

            <Grid size={{ xs: 12, md: showRawJson && rawOutput ? 8 : 12 }}>
              {cardData ? (
                <IntelligenceRenderer data={cardData} showEmptyCards={showEmptyCards} />
              ) : (
                <Alert severity="warning">
                  Output received but could not map to cards. Review the raw JSON.
                </Alert>
              )}
            </Grid>
          </Grid>
        </>
      )}

      {/* Loading */}
      {isLoading && !cardData && !rawOutput && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Running extraction prompt on transcript…
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
