/**
 * ValueAccordionCard — ported from a360-web-app production.
 * Accordion with percentage value + progress bar header.
 */
import { type PropsWithChildren } from 'react';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { BaseAccordion, type BaseAccordionProps } from './BaseAccordion';
import { ProgressBar } from './Card.styles';
import { getScoreColor } from './helpers';

type ValueAccordionCardProps = PropsWithChildren<
  Omit<BaseAccordionProps, 'headerContent'> & {
    value: number;
  }
>;

export const ValueAccordionCard: React.FC<ValueAccordionCardProps> = ({ value, children, ...baseProps }) => (
  <BaseAccordion
    {...baseProps}
    headerContent={
      <Stack gap={1}>
        <Typography variant="h5" fontWeight={600}>
          {value}%
        </Typography>
        <ProgressBar variant="determinate" color={getScoreColor(value)} value={value} />
      </Stack>
    }
  >
    {children}
  </BaseAccordion>
);
