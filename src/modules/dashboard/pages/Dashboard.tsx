import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { runsApi, opportunitiesApi } from '@/shared/api';
import type { Run, Opportunity } from '@/shared/api/types';
import { runOutputToLayers } from '@/modules/runs/utils/runOutputToLayers';

const STAGES: Opportunity['stage'][] = ['New', 'In progress', 'Won', 'Lost'];

export function Dashboard() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([runsApi.list(), opportunitiesApi.list()])
      .then(([runsData, oppsData]) => {
        setRuns(Array.isArray(runsData) ? runsData : (runsData as unknown as { data?: Run[] })?.data ?? []);
        setOpportunities(Array.isArray(oppsData) ? oppsData : (oppsData as unknown as { data?: Opportunity[] })?.data ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const byStage = STAGES.map((stage) => ({
    stage,
    count: opportunities.filter((o) => o.stage === stage).length,
  }));

  const buySignals = runs
    .map((r) => runOutputToLayers(r.outputs).buySignalStrength)
    .filter((v): v is number => v != null);
  const buckets = [0, 25, 50, 75, 100];
  const buySignalDistribution = buckets.slice(0, -1).map((low, i) => {
    const high = buckets[i + 1];
    const count = buySignals.filter((v) => v >= low && v < high).length;
    return { label: `${low}-${high}%`, value: count };
  });
  if (buySignals.some((v) => v === 100)) {
    buySignalDistribution[buySignalDistribution.length - 1].value += buySignals.filter((v) => v === 100).length;
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        KPI Dashboard
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Opportunities by stage
              </Typography>
              <BarChart
                dataset={byStage}
                xAxis={[{ scaleType: 'band', dataKey: 'stage' }]}
                series={[{ dataKey: 'count', label: 'Count' }]}
                height={280}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Buy signal strength distribution
              </Typography>
              {buySignalDistribution.some((d) => d.value > 0) ? (
                <PieChart
                  series={[{ data: buySignalDistribution.map((d) => ({ id: d.label, value: d.value, label: d.label })) }]}
                  height={280}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No buy signal data from runs yet.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2">Summary</Typography>
              <Typography variant="body2" color="text.secondary">
                Total runs: {runs.length} · Total opportunities: {opportunities.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
