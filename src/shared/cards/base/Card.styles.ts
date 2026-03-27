/**
 * Styled card components — ported from a360-web-app production.
 * Adapted: uses standard MUI borderRadius instead of custom theme.borders.
 */
import Card from '@mui/material/Card';
import LinearProgress from '@mui/material/LinearProgress';
import { styled } from '@mui/material/styles';

export const IconBadge = styled('div')(({ theme }) => ({
  width: 32,
  height: 32,
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `1px solid ${theme.palette.divider}`,
  background: theme.palette.primary.main,
  color: theme.palette.background.paper,
  flexShrink: 0,
}));

export const SummaryCardRoot = styled(Card)(() => ({
  background: '#F9FAFB', // surfaceSoft
})) as typeof Card;

export const ProgressBar = styled(LinearProgress)(() => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: '#EAECF0', // surfaceStrong
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
  },
})) as typeof LinearProgress;
