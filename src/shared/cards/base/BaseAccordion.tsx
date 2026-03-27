/**
 * BaseAccordion — ported from a360-web-app production.
 * Accordion card with expand/collapse, optional info tooltip.
 * Adapted: uses MUI InfoOutlined icon instead of custom Icon component.
 * Removed MenuPopover/usePopover dependency — uses Tooltip only.
 */
import { type PropsWithChildren, useState } from 'react';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip, { type TooltipProps } from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export type InfoIconConfig = {
  icon?: React.ReactNode;
  tooltip?: Pick<TooltipProps, 'title' | 'placement' | 'arrow'>;
  popoverContent?: React.ReactNode;
  ariaLabel?: string;
};

export type BaseAccordionProps = PropsWithChildren<{
  title: string;
  ariaLabel?: string;
  isExpandedByDefault?: boolean;
  isDisableToggle?: boolean;
  hasToggleIcon?: boolean;
  infoIcon?: InfoIconConfig;
  headerContent?: React.ReactNode;
}>;

const handleKeyDown = (callback: () => void) => (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    callback();
  }
};

const InfoIconButton: React.FC<{
  config: InfoIconConfig;
}> = ({ config }) => {
  const { icon, tooltip, ariaLabel = 'More information' } = config;

  const button = (
    <IconButton aria-label={ariaLabel} size="small">
      {icon ?? <InfoOutlinedIcon sx={{ fontSize: 18 }} />}
    </IconButton>
  );

  if (!tooltip?.title) return button;

  return (
    <Tooltip
      disableInteractive
      title={tooltip.title}
      placement={tooltip.placement ?? 'top-end'}
      arrow={tooltip.arrow ?? true}
    >
      {button}
    </Tooltip>
  );
};

export const BaseAccordion: React.FC<BaseAccordionProps> = ({
  title,
  infoIcon,
  isExpandedByDefault = false,
  hasToggleIcon = true,
  headerContent,
  children,
  ariaLabel,
  isDisableToggle = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(isExpandedByDefault);

  const toggleExpand = () => {
    if (isDisableToggle) return;
    setIsExpanded(prev => !prev);
  };

  return (
    <Card sx={{ overflow: 'hidden' }}>
      <Stack
        p={{ xs: 1.5, sm: 2 }}
        onClick={toggleExpand}
        onKeyDown={handleKeyDown(toggleExpand)}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label={ariaLabel ?? `Expand ${title}`}
        sx={{
          ...(!isDisableToggle && {
            cursor: 'pointer',
            ':hover': {
              bgcolor: '#F9FAFB',
            },
          }),
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={headerContent ? 1.5 : 0}>
          <Typography variant="subtitle2" fontWeight={600}>
            {title}
          </Typography>

          <Stack direction="row" alignItems="center" gap={hasToggleIcon ? 0.5 : 0}>
            {infoIcon && <InfoIconButton config={infoIcon} />}

            {hasToggleIcon && !isDisableToggle && (
              <ExpandMoreIcon
                sx={{
                  fontSize: 18,
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s',
                }}
              />
            )}
          </Stack>
        </Stack>

        {headerContent}
      </Stack>

      <Collapse in={isExpanded} unmountOnExit>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>{children}</CardContent>
      </Collapse>
    </Card>
  );
};
