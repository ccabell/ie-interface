/**
 * FutureInterestsCard — ported from a360-web-app production Intelligence tab.
 * Grid of future interest cards with priority chips.
 * Adapted: uses MUI Chip instead of custom MDChip.
 */
import type { ChipProps } from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { SummaryCard } from '../base/SummaryCard';

type Priority = 'High' | 'Medium' | 'Low';

export type FutureInterest = {
  label: string;
  priority: Priority;
  snippet?: string;
};

type FutureInterestsCardProps = {
  items: FutureInterest[];
  icon?: React.ReactNode;
};

const PRIORITY_COLORS: Record<Priority, ChipProps['color']> = {
  High: 'warning',
  Medium: 'primary',
  Low: 'default',
};

const InterestCard: React.FC<FutureInterest> = ({ label, priority, snippet }) => (
  <Card variant="outlined" sx={{ width: 'auto', maxWidth: 1 }}>
    <CardContent sx={{ p: 1.5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1} mb={snippet ? 1.5 : 0}>
        <Typography variant="body1" fontWeight={600}>
          {label}
        </Typography>
        <Chip label={priority} size="small" color={PRIORITY_COLORS[priority]} sx={{ flexShrink: 0, borderRadius: 1 }} />
      </Stack>

      {snippet && (
        <Typography variant="body2" color="textSecondary" fontStyle="italic">
          {snippet}
        </Typography>
      )}
    </CardContent>
  </Card>
);

export const FutureInterestsCard: React.FC<FutureInterestsCardProps> = ({ items, icon }) => (
  <SummaryCard title="Future interests" icon={icon}>
    <Grid container spacing={1.5}>
      {items.map(interest => (
        <Grid key={interest.label} size={{ xs: 12, sm: 6, md: 4 }}>
          <InterestCard {...interest} />
        </Grid>
      ))}
    </Grid>
  </SummaryCard>
);
