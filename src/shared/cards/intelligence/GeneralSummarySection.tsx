/**
 * GeneralSummarySection — ported from a360-web-app production Intelligence tab (CardsContent.tsx).
 * Composite section: summary card + commitment level + statistics.
 */
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { SummaryCard } from '../base/SummaryCard';
import { ValueAccordionCard } from '../base/ValueAccordionCard';
import { StatisticCard } from '../base/StatisticCard';

type StatField = {
  label: string;
  value: string;
  score?: number;
};

type GeneralSummarySectionProps = {
  description: string;
  stats: StatField[];
  commitmentLevel?: number;
  totalPotentialValue?: string;
  consultationDuration?: string;
  sentiment?: 'positive' | 'neutral' | 'negative' | 'unclear';
};

const SENTIMENT_COLORS: Record<string, 'success' | 'default' | 'error'> = {
  positive: 'success',
  neutral: 'default',
  negative: 'error',
  unclear: 'default',
};

export const GeneralSummarySection: React.FC<GeneralSummarySectionProps> = ({
  description,
  stats: _stats,
  commitmentLevel = 50,
  totalPotentialValue,
  consultationDuration,
  sentiment,
}) => (
  <Grid container spacing={2}>
    {/* Left — summary */}
    <Grid size={{ xs: 12, md: 6 }}>
      <SummaryCard
        title="General Summary"
        icon={<InfoOutlinedIcon sx={{ fontSize: 18 }} />}
        sx={{ boxShadow: 'none', height: 1 }}
      >
        <Typography variant="body1" color="textSecondary">
          {description}
        </Typography>
      </SummaryCard>
    </Grid>

    {/* Right — stats */}
    <Grid size={{ xs: 12, md: 6 }}>
      <Stack gap={2}>
        <Stack direction="row" alignItems="center" gap={1}>
          <ValueAccordionCard
            isDisableToggle
            title="Commitment Level"
            value={commitmentLevel}
            infoIcon={{
              tooltip: { title: 'Patient readiness and commitment to proceed with treatment (0-100%)' },
            }}
          />
          {sentiment && (
            <Chip
              label={sentiment}
              size="small"
              color={SENTIMENT_COLORS[sentiment] ?? 'default'}
              sx={{ borderRadius: 1, textTransform: 'capitalize' }}
            />
          )}
        </Stack>

        {totalPotentialValue && (
          <StatisticCard
            label="Total Potential Value"
            value={totalPotentialValue}
            tooltip="Sum of all products and services the patient showed interest in"
          />
        )}

        {consultationDuration && <StatisticCard label="Consultation Duration" value={consultationDuration} />}
      </Stack>
    </Grid>
  </Grid>
);
