/**
 * AreasCard — ported from a360-web-app production Intelligence tab.
 * Displays concern areas and treatment areas as color-coded chips.
 * Adapted: uses MUI Chip instead of custom MDChip.
 */
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { BaseAccordion } from '../base/BaseAccordion';

type AreasCardProps = {
  concernAreas: string[];
  treatmentAreas: string[];
  isExpandedByDefault?: boolean;
};

export const AreasCard: React.FC<AreasCardProps> = ({ concernAreas, treatmentAreas, isExpandedByDefault }) => (
  <BaseAccordion title="Areas" hasToggleIcon isExpandedByDefault={isExpandedByDefault}>
    <Stack gap={2}>
      <Stack gap={1}>
        <Typography variant="body2" fontWeight={500}>
          Concern Areas
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {concernAreas.map(label => (
            <Chip key={label} label={label} size="small" color="warning" sx={{ borderRadius: 1 }} />
          ))}
        </Stack>
      </Stack>

      <Stack gap={1}>
        <Typography variant="body2" fontWeight={500}>
          Treatment Areas
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {treatmentAreas.map(label => (
            <Chip key={label} color="success" label={label} size="small" sx={{ borderRadius: 1 }} />
          ))}
        </Stack>
      </Stack>
    </Stack>
  </BaseAccordion>
);
