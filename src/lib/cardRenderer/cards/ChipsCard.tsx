/**
 * ChipsCard — Renders a collection of chips/tags
 *
 * Useful for displaying categories, tags, areas, or any list of short labels.
 */
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { ChipsCardProps } from '../types';

export const ChipsCard: React.FC<ChipsCardProps> = ({
  title,
  chips,
  color = 'primary',
}) => (
  <Card variant="outlined">
    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
      {title && (
        <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
          {title}
        </Typography>
      )}
      <Stack direction="row" flexWrap="wrap" gap={1}>
        {chips.map((chip, index) => (
          <Chip
            key={index}
            label={chip}
            size="small"
            color={color}
            variant="outlined"
            sx={{ borderRadius: 1 }}
          />
        ))}
      </Stack>
    </CardContent>
  </Card>
);
