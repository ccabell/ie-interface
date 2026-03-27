/**
 * EvidenceCard — ported from a360-web-app production.
 * Small card with title, score chip, and snippet.
 * Adapted: uses MUI Chip instead of custom MDChip.
 */
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { getScoreColor } from './helpers';

type EvidenceCardProps = {
  title: string;
  score: number;
  snippet: string;
};

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ title, score, snippet }) => (
  <Card variant="outlined">
    <CardContent sx={{ p: 1.5 }}>
      <Stack direction="row" flexWrap="wrap" justifyContent="space-between" gap={0.25} mb={1.5}>
        <Typography variant="body1" flex={1} fontWeight={600} textTransform="uppercase">
          {title}
        </Typography>

        <Chip label={`${score}%`} color={getScoreColor(score)} size="small" sx={{ borderRadius: 1 }} />
      </Stack>

      <Typography variant="body2" color="textSecondary" fontStyle="italic">
        {snippet}
      </Typography>
    </CardContent>
  </Card>
);
