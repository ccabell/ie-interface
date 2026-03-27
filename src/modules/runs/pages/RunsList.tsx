import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import { runsApi } from '@/shared/api';
import type { Run } from '@/shared/api/types';
import { runDetailPath } from '@/shared/constants/routes';
import { format } from 'date-fns';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

function getStatusConfig(status: string | undefined) {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'success':
      return { color: 'success' as const, icon: <CheckCircleIcon sx={{ fontSize: 14 }} />, label: 'Completed' };
    case 'failed':
    case 'error':
      return { color: 'error' as const, icon: <ErrorIcon sx={{ fontSize: 14 }} />, label: 'Failed' };
    case 'running':
    case 'in_progress':
      return { color: 'primary' as const, icon: <ScheduleIcon sx={{ fontSize: 14 }} />, label: 'Running' };
    default:
      return { color: 'default' as const, icon: <ScheduleIcon sx={{ fontSize: 14 }} />, label: status || 'Unknown' };
  }
}

interface RunCardProps {
  run: Run;
  onClick: () => void;
}

function RunCard({ run, onClick }: RunCardProps) {
  const statusConfig = getStatusConfig(run.status);
  const hasOutputs = run.outputs && Object.keys(run.outputs).length > 0;

  return (
    <Card
      sx={{
        transition: 'all 150ms ease-in-out',
        '&:hover': {
          boxShadow: 2,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardActionArea onClick={onClick}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  backgroundColor: 'action.hover',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PlaylistPlayIcon sx={{ fontSize: 20, color: 'primary.main' }} />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Run {run.id.slice(0, 8)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {run.id}
                </Typography>
              </Box>
            </Box>
            <Chip
              icon={statusConfig.icon}
              label={statusConfig.label}
              color={statusConfig.color}
              size="small"
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {run.created_at ? format(new Date(run.created_at), 'MMM d, yyyy h:mm a') : '—'}
              </Typography>
            </Box>

            {hasOutputs && (
              <Chip
                label="Has outputs"
                size="small"
                variant="outlined"
                sx={{ height: 20, fontSize: 11 }}
              />
            )}

            {run.transcript_id && (
              <Typography variant="caption" color="text.secondary">
                Transcript: {run.transcript_id.slice(0, 8)}...
              </Typography>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export function RunsList() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    runsApi
      .list()
      .then((data) => {
        setRuns(Array.isArray(data) ? data : (data as unknown as { data?: Run[] })?.data ?? []);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box>
        <PageHeader
          title="Extraction Runs"
          subtitle="View and manage extraction runs from consultation transcripts"
        />
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <PageHeader
          title="Extraction Runs"
          subtitle="View and manage extraction runs from consultation transcripts"
        />
        <Card>
          <CardContent>
            <Typography color="error.main" variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Could not load runs
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {error}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Make sure the prompt-runner API is running and <code>VITE_API_URL</code> is set correctly in <code>.env</code>.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Extraction Runs"
        subtitle={`${runs.length} extraction run${runs.length !== 1 ? 's' : ''} from consultation transcripts`}
      />

      {runs.length === 0 ? (
        <Card>
          <EmptyState
            icon={<PlaylistPlayIcon />}
            title="No extraction runs yet"
            description="Run an extraction from the prompt-runner backend to see results here."
          />
        </Card>
      ) : (
        <Grid container spacing={2}>
          {runs.map((run) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={run.id}>
              <RunCard run={run} onClick={() => navigate(runDetailPath(run.run_id ?? run.id))} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
