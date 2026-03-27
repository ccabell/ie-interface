/**
 * SummaryCard Component
 *
 * Displays general summary and key statistics using MUI.
 * Based on: tremor-agent-viewer/src/components/SummaryCard.tsx
 */

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { getScoreColor, formatCurrency, type ScoreColor } from '@/shared/api/agentOutputs';

interface StatField {
  label: string;
  value: string;
  score?: number;
}

interface SummaryCardProps {
  title?: string;
  description: string;
  stats?: StatField[];
  commitmentLevel?: number;
  totalPotentialValue?: number;
  consultationDuration?: string;
}

function StatRow({ label, value, score }: StatField) {
  const color = score !== undefined ? getScoreColor(score) : undefined;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="overline" sx={{ color: 'text.secondary', display: 'block' }}>
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={600} noWrap>
          {value}
        </Typography>
      </Box>
      {score !== undefined && (
        <Chip label={`${score}%`} size="small" color={color} sx={{ ml: 2, flexShrink: 0 }} />
      )}
    </Box>
  );
}

function getProgressColor(value: number): ScoreColor {
  if (value >= 80) return 'success';
  if (value >= 60) return 'warning';
  return 'error';
}

export function SummaryCard({
  title = 'General Summary',
  description,
  stats,
  commitmentLevel,
  totalPotentialValue,
  consultationDuration,
}: SummaryCardProps) {
  return (
    <Grid container spacing={2}>
      {/* Left - Summary */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <InfoOutlinedIcon color="primary" />
              <Typography variant="h6">{title}</Typography>
            </Box>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              {description}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Right - Stats */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            {/* Commitment Level */}
            {commitmentLevel !== undefined && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" fontWeight={500}>
                    Commitment Level
                  </Typography>
                  <Chip
                    label={`${commitmentLevel}%`}
                    size="small"
                    color={getProgressColor(commitmentLevel)}
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={commitmentLevel}
                  color={getProgressColor(commitmentLevel)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                  Patient readiness and commitment to proceed with treatment (0-100%)
                </Typography>
              </Box>
            )}

            {/* Total Potential Value */}
            {totalPotentialValue !== undefined && (
              <Card
                sx={{
                  bgcolor: 'primary.light',
                  border: 1,
                  borderColor: 'primary.main',
                  p: 2,
                  mb: 2,
                }}
                elevation={0}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <AttachMoneyIcon color="primary" />
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Total Potential Value
                    </Typography>
                    <Typography variant="h5" color="primary.main" fontWeight={700}>
                      {formatCurrency(totalPotentialValue)}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            )}

            {/* Consultation Duration */}
            {consultationDuration && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <AccessTimeIcon sx={{ color: 'text.secondary' }} />
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Consultation Duration
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {consultationDuration}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Custom Stats */}
            {stats && stats.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ '& > *:not(:last-child)': { borderBottom: 1, borderColor: 'divider' } }}>
                  {stats.map((stat) => (
                    <StatRow key={stat.label} {...stat} />
                  ))}
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default SummaryCard;
