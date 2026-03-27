import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import { agentsApi } from '@/shared/api';
import type { Agent } from '@/shared/api/types';
import { ROUTES } from '@/shared/constants/routes';

export function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    agentsApi
      .list()
      .then((data) => setAgents(Array.isArray(data) ? data : []))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Agents
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Run agents from a run detail page. This page lists all available agents (built-in, config, or DB).
      </Typography>
      {agents.length === 0 ? (
        <Typography color="text.secondary">No agents available.</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {agents.map((agent) => (
            <Card key={agent.id} variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="subtitle1">{agent.name}</Typography>
                  <Chip label={agent.id} size="small" variant="outlined" />
                  <Chip label={agent.type} size="small" />
                </Box>
                {agent.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {agent.description}
                  </Typography>
                )}
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => navigate(ROUTES.RUNS)}
                >
                  Use in run
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
