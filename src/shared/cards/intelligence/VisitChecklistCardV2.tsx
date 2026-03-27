/**
 * VisitChecklistCardV2 — ported from a360-web-app production Intelligence tab.
 * Card-style checklist with completion icons and snippets.
 * Adapted: uses MUI CheckCircle/Cancel icons instead of custom Icon.
 */
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import { SummaryCard } from '../base/SummaryCard';

export type ChecklistItemV2 = {
  label: string;
  completed: boolean;
  snippet?: string;
  note?: string;
};

type VisitChecklistCardV2Props = {
  items: ChecklistItemV2[];
  isExpandedByDefault?: boolean;
};

const IconWrapper: React.FC<{ completed: boolean; children: React.ReactNode }> = ({ completed, children }) => (
  <Box
    sx={{
      width: 28,
      height: 28,
      borderRadius: '50%',
      bgcolor: completed ? 'success.light' : 'error.light',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    {children}
  </Box>
);

const CheckCard: React.FC<ChecklistItemV2> = ({ label, completed, snippet }) => (
  <Card variant="outlined" sx={{ height: 1 }}>
    <CardContent sx={{ p: 1.5 }}>
      <Stack direction="row" alignItems="center" gap={1} mb={snippet ? 1.5 : 0}>
        <IconWrapper completed={completed}>
          {completed ? (
            <CheckIcon sx={{ fontSize: 16, color: 'success.main' }} />
          ) : (
            <CloseIcon sx={{ fontSize: 16, color: 'error.main' }} />
          )}
        </IconWrapper>
        <Typography variant="body1" fontWeight={600}>
          {label}
        </Typography>
      </Stack>

      {snippet && (
        <Typography variant="body2" color="textSecondary" fontStyle="italic">
          {snippet}
        </Typography>
      )}
    </CardContent>
  </Card>
);

export const VisitChecklistCardV2: React.FC<VisitChecklistCardV2Props> = ({ items }) => (
  <SummaryCard title="Visit checklist">
    <Stack gap={1.5}>
      {items.map(item => (
        <CheckCard key={item.label} {...item} />
      ))}
    </Stack>
  </SummaryCard>
);
