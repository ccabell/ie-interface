/**
 * PatientGoalsCard — ported from a360-web-app production Intelligence tab.
 * Displays goals, anticipated outcomes, and stated interests in a 3-column grid.
 */
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { SummaryCard } from '../base/SummaryCard';

type PatientGoalsCardProps = {
  goals: string[];
  anticipatedOutcomes: string[];
  statedInterests: string[];
};

const SectionCard: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <Card>
    <Stack p={1.5} gap={1}>
      <Typography variant="body2" color="textSecondary" fontWeight={600}>
        {label}
      </Typography>
      {children}
    </Stack>
  </Card>
);

const BulletList: React.FC<{ items: string[] }> = ({ items }) => (
  <Stack gap={0.5}>
    {items.map(item => (
      <Typography key={item} variant="body2">
        &bull; {item}
      </Typography>
    ))}
  </Stack>
);

export const PatientGoalsCard: React.FC<PatientGoalsCardProps> = ({
  goals,
  anticipatedOutcomes,
  statedInterests,
}) => (
  <SummaryCard title="Patient goals">
    <Grid container spacing={1.5} columns={12}>
      <Grid size={{ xs: 12, md: 4 }}>
        <SectionCard label="Goals">
          <BulletList items={goals} />
        </SectionCard>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <SectionCard label="Anticipated Outcomes">
          <BulletList items={anticipatedOutcomes} />
        </SectionCard>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <SectionCard label="Stated Interests">
          <BulletList items={statedInterests} />
        </SectionCard>
      </Grid>
    </Grid>
  </SummaryCard>
);
