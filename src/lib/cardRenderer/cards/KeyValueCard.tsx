/**
 * KeyValueCard — Renders key-value pairs in a table-like format
 *
 * Useful for displaying structured data like patient demographics,
 * visit details, or any labeled data.
 */
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { KeyValueCardProps } from '../types';

export const KeyValueCard: React.FC<KeyValueCardProps> = ({ title, items }) => (
  <Card variant="outlined">
    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
      {title && (
        <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
          {title}
        </Typography>
      )}
      <Stack gap={1}>
        {items.map((item, index) => (
          <Stack
            key={index}
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            gap={2}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ flexShrink: 0 }}
            >
              {item.key}
            </Typography>
            <Typography
              variant="body2"
              fontWeight={500}
              textAlign="right"
              sx={{ wordBreak: 'break-word' }}
            >
              {item.value}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </CardContent>
  </Card>
);
