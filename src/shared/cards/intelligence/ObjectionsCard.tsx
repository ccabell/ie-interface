/**
 * ObjectionsCard — ported from a360-web-app production Intelligence tab.
 * Accordion list of objections/hesitations/concerns with type & status chips.
 * Adapted: uses MUI Chip instead of custom MDChip.
 */
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { BaseAccordion } from '../base/BaseAccordion';

type ObjectionType = 'Objection' | 'Hesitation' | 'Concern';
type ObjectionStatus = 'Addressed' | 'Resolved' | 'Not addressed';

export type ObjectionItem = {
  type: ObjectionType;
  status: ObjectionStatus;
  title: string;
  snippet: string;
  coachingResponse?: string;
};

type ObjectionsCardProps = {
  items: ObjectionItem[];
  isExpandedByDefault?: boolean;
};

const TYPE_COLORS: Record<ObjectionType, 'error' | 'warning' | 'primary'> = {
  Objection: 'error',
  Hesitation: 'warning',
  Concern: 'primary',
};

const STATUS_COLORS: Record<ObjectionStatus, 'success' | 'error' | 'primary'> = {
  Addressed: 'primary',
  Resolved: 'success',
  'Not addressed': 'error',
};

const ObjectionCard: React.FC<ObjectionItem> = ({ type, status, title, snippet, coachingResponse }) => (
  <Stack gap={1}>
    <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
      <Stack direction="row" alignItems="center" gap={1}>
        <Chip label={type} size="small" color={TYPE_COLORS[type]} sx={{ borderRadius: 1 }} />
        <Typography variant="body1" fontWeight={600}>
          {title}
        </Typography>
      </Stack>
      <Chip label={status} size="small" color={STATUS_COLORS[status]} sx={{ borderRadius: 1 }} />
    </Stack>

    <Card variant="outlined">
      <CardContent sx={{ p: 1.5 }}>
        <Typography variant="body2" color="textSecondary" fontStyle="italic">
          {snippet}
        </Typography>
      </CardContent>
    </Card>

    {coachingResponse && (
      <Card sx={{ bgcolor: 'primary.50', boxShadow: 'none' }}>
        <CardContent sx={{ p: 1.5 }}>
          <Typography variant="overline" color="primary" fontWeight={700} display="block" mb={0.75}>
            Suggested Coaching Response
          </Typography>
          <Typography variant="body2">{coachingResponse}</Typography>
        </CardContent>
      </Card>
    )}
  </Stack>
);

export const ObjectionsCard: React.FC<ObjectionsCardProps> = ({ items, isExpandedByDefault }) => (
  <BaseAccordion title="Objections, concerns & hesitations" hasToggleIcon isExpandedByDefault={isExpandedByDefault}>
    <Stack gap={2} divider={<Divider />}>
      {items.map(item => (
        <ObjectionCard key={item.title} {...item} />
      ))}
    </Stack>
  </BaseAccordion>
);
