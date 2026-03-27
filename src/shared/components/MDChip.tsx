/**
 * MDChip — Production-faithful chip that matches a360-web-app's MDChip.
 *
 * Key difference from MUI Chip:
 * - variant="soft" renders tinted background + colored text (not solid bg + white text)
 * - isSquare prop sets borderRadius to 4px
 *
 * This closes the biggest visual gap between our ported cards and production.
 */
import Chip, { type ChipProps } from '@mui/material/Chip';

type MDChipProps = Omit<ChipProps, 'variant'> & {
  /** "soft" = tinted bg + colored text (production default). "outlined" and "filled" work as standard MUI. */
  variant?: 'soft' | 'outlined' | 'filled';
  /** Square corners (borderRadius: 4px) instead of pill shape */
  isSquare?: boolean;
};

const SOFT_COLOR_MAP: Record<string, { bg: string; text: string }> = {
  primary: { bg: '#EBF0F5', text: '#547BA3' },
  secondary: { bg: '#F2F4F7', text: '#667085' },
  success: { bg: '#ECFDF3', text: '#17826A' },
  warning: { bg: '#FFFAEB', text: '#F79009' },
  error: { bg: '#FEF3F2', text: '#FF6666' },
  info: { bg: '#F5F7FA', text: '#3B82F6' },
  default: { bg: '#F2F4F7', text: '#667085' },
};

export const MDChip: React.FC<MDChipProps> = ({
  variant = 'soft',
  isSquare = false,
  color = 'default',
  sx,
  ...rest
}) => {
  if (variant === 'soft') {
    const colorKey = typeof color === 'string' ? color : 'default';
    const softColors = SOFT_COLOR_MAP[colorKey] ?? SOFT_COLOR_MAP.default;

    return (
      <Chip
        {...rest}
        sx={{
          borderRadius: isSquare ? '4px' : undefined,
          backgroundColor: softColors.bg,
          color: softColors.text,
          fontWeight: 500,
          border: 'none',
          '& .MuiChip-label': {
            fontWeight: 500,
          },
          ...sx,
        }}
      />
    );
  }

  // For "outlined" and "filled", pass through to MUI Chip with color
  return (
    <Chip
      {...rest}
      variant={variant === 'outlined' ? 'outlined' : 'filled'}
      color={color}
      sx={{
        borderRadius: isSquare ? '4px' : undefined,
        ...sx,
      }}
    />
  );
};
