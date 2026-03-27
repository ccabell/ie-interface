/**
 * ConcernsCard — ported from a360-web-app production Intelligence tab.
 * Displays primary/secondary concerns as chips.
 * Adapted: uses MUI Chip instead of custom MDChip.
 */
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { BaseAccordion } from '../base/BaseAccordion';

type ConcernsCardProps = {
  primary: string[];
  secondary: string[];
  isExpandedByDefault?: boolean;
};

export const ConcernsCard: React.FC<ConcernsCardProps> = ({ primary, secondary, isExpandedByDefault }) => (
  <BaseAccordion title="Concerns" hasToggleIcon isExpandedByDefault={isExpandedByDefault}>
    <Stack gap={2}>
      <Stack gap={1}>
        <Typography variant="body2" fontWeight={500}>
          Primary
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {primary.map(label => (
            <Chip key={label} color="primary" label={label} size="small" sx={{ borderRadius: 1 }} />
          ))}
        </Stack>
      </Stack>

      <Stack gap={1}>
        <Typography variant="body2" fontWeight={500}>
          Secondary
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {secondary.map(label => (
            <Chip key={label} label={label} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
          ))}
        </Stack>
      </Stack>
    </Stack>
  </BaseAccordion>
);
