/**
 * SummaryCard — ported from a360-web-app production.
 * Container card with title, icon, optional description, and children.
 * Adapted: removed custom Scrollbar/Icon imports, uses simple overflow.
 */
import type { CardProps } from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { IconBadge, SummaryCardRoot } from './Card.styles';

export type SummaryCardProps = Omit<CardProps, 'children'> & {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  hasScroll?: boolean;
  scrollHeight?: number;
  children?: React.ReactNode;
};

export const SummaryCard: React.FC<SummaryCardProps> = ({
  children,
  description,
  hasScroll = false,
  icon,
  title,
  scrollHeight = 300,
  ...cardProps
}) => {
  const body = (
    <>
      {description && (
        <Typography variant="body1" color="textSecondary" whiteSpace="pre-line" mb={children ? 2 : 0}>
          {description}
        </Typography>
      )}
      {children}
    </>
  );

  return (
    <SummaryCardRoot variant="outlined" {...cardProps}>
      <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
        {title && (
          <Stack direction="row" gap={1} alignItems="center" mb={1.5}>
            {icon && <IconBadge>{icon}</IconBadge>}
            <Typography variant="subtitle2" fontWeight={600}>
              {title}
            </Typography>
          </Stack>
        )}
        {hasScroll ? (
          <Box sx={{ maxHeight: scrollHeight, overflow: 'auto' }}>{body}</Box>
        ) : (
          body
        )}
      </CardContent>
    </SummaryCardRoot>
  );
};
