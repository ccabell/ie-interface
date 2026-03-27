/**
 * VisitContextCard — ported from a360-web-app production Intelligence tab.
 * Displays visit context fields (type, referral, reason, motivating event).
 */
import { CardContent } from '@mui/material';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { SummaryCard } from '../base/SummaryCard';

type VisitContextProps = {
  visitType: string;
  referredBy: string;
  reasonForVisit: string;
  referrals: string;
  motivatingEvent: string;
};

const Field: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Stack gap={0.25}>
    <Typography variant="overline" color="text.secondary" fontWeight={600} lineHeight={1.8}>
      {label}
    </Typography>
    <Typography variant="body2">{value}</Typography>
  </Stack>
);

export const VisitContextCard: React.FC<VisitContextProps> = ({
  visitType,
  referredBy: _referredBy,
  reasonForVisit,
  referrals,
  motivatingEvent,
}) => (
  <SummaryCard title="Visit context">
    <Card>
      <CardContent>
        <Stack gap={2}>
          <Field label="Visit Type" value={visitType} />
          <Field label="Referred By" value={referrals} />
          <Field label="Reason for Visit" value={reasonForVisit} />
          <Field label="Motivating Event" value={motivatingEvent} />
        </Stack>
      </CardContent>
    </Card>
  </SummaryCard>
);
