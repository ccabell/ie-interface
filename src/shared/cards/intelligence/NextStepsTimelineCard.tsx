/**
 * NextStepsTimelineCard — ported from a360-web-app production Intelligence tab.
 * Timeline-style list of next steps with completion status.
 * Adapted: uses inline timeline instead of importing FollowUpTimeline
 * (which has deep dependencies in a360-web-app).
 */
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

import { BaseAccordion } from '../base/BaseAccordion';

export type NextStepItem = {
  title: string;
  when: string;
  owner: string;
  isCompleted?: boolean;
};

type NextStepsTimelineCardProps = {
  items: NextStepItem[];
  isExpandedByDefault?: boolean;
};

const TimelineItem: React.FC<NextStepItem & { isLast: boolean }> = ({
  title,
  when,
  owner,
  isCompleted = false,
  isLast,
}) => (
  <Stack direction="row" gap={1.5}>
    {/* Timeline connector */}
    <Stack alignItems="center" sx={{ position: 'relative' }}>
      {isCompleted ? (
        <CheckCircleIcon sx={{ fontSize: 20, color: 'success.main', zIndex: 1 }} />
      ) : (
        <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: 'grey.400', zIndex: 1 }} />
      )}
      {!isLast && (
        <Box
          sx={{
            width: 2,
            flex: 1,
            bgcolor: 'divider',
            mt: 0.5,
          }}
        />
      )}
    </Stack>

    {/* Content */}
    <Stack gap={0.25} pb={isLast ? 0 : 2}>
      <Typography variant="body2" fontWeight={600}>
        {title}
      </Typography>
      {when && (
        <Typography variant="caption" color="textSecondary">
          {when}
        </Typography>
      )}
      {owner && (
        <Typography variant="caption" color="textSecondary">
          Owner: {owner}
        </Typography>
      )}
    </Stack>
  </Stack>
);

export const NextStepsTimelineCard: React.FC<NextStepsTimelineCardProps> = ({
  items,
  isExpandedByDefault = true,
}) => (
  <BaseAccordion title="Next Steps" hasToggleIcon isExpandedByDefault={isExpandedByDefault}>
    <Stack>
      {items.map((item, idx) => (
        <TimelineItem key={item.title} {...item} isLast={idx === items.length - 1} />
      ))}
    </Stack>
  </BaseAccordion>
);
