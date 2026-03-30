/**
 * TimelineCard — Renders a vertical timeline of events
 *
 * Useful for displaying next steps, treatment plans, or any sequential data.
 */
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import AdjustIcon from '@mui/icons-material/Adjust';

import type { TimelineCardProps, TimelineEvent } from '../types';

const StatusIcon: React.FC<{ status?: TimelineEvent['status'] }> = ({ status }) => {
  switch (status) {
    case 'completed':
      return <CheckCircleIcon color="success" sx={{ fontSize: 20 }} />;
    case 'current':
      return <AdjustIcon color="primary" sx={{ fontSize: 20 }} />;
    default:
      return <RadioButtonUncheckedIcon color="disabled" sx={{ fontSize: 20 }} />;
  }
};

export const TimelineCard: React.FC<TimelineCardProps> = ({ title, events }) => (
  <Card variant="outlined">
    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
      {title && (
        <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
          {title}
        </Typography>
      )}
      <Stack gap={0}>
        {events.map((event, index) => (
          <Stack key={index} direction="row" gap={1.5}>
            {/* Timeline line and dot */}
            <Stack alignItems="center" sx={{ width: 20 }}>
              <StatusIcon status={event.status} />
              {index < events.length - 1 && (
                <Box
                  sx={{
                    width: 2,
                    flex: 1,
                    minHeight: 16,
                    bgcolor: 'divider',
                    my: 0.5,
                  }}
                />
              )}
            </Stack>

            {/* Content */}
            <Stack pb={index < events.length - 1 ? 2 : 0} sx={{ flex: 1 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                gap={1}
              >
                <Typography variant="body2" fontWeight={600}>
                  {event.title}
                </Typography>
                {event.timestamp && (
                  <Typography variant="caption" color="text.secondary">
                    {event.timestamp}
                  </Typography>
                )}
              </Stack>
              {event.description && (
                <Typography variant="body2" color="text.secondary">
                  {event.description}
                </Typography>
              )}
            </Stack>
          </Stack>
        ))}
      </Stack>
    </CardContent>
  </Card>
);
