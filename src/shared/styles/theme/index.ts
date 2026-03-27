import { createTheme, alpha } from '@mui/material/styles';
import { palette, GREY_COLORS } from './palette';

// A360 Design Tokens
const FONT_PRIMARY = '"Plus Jakarta Sans", Inter, "Helvetica Neue", Arial, sans-serif';

const boxShadows = {
  none: 'none',
  xs: '0px 1px 12px 1px rgba(0, 0, 0, 0.03)',
  sm: '0px 0px 16px 2px rgba(0, 0, 0, 0.04)',
  md: '0px 0px 34px 3px rgba(0, 0, 0, 0.06), 0px 2px 12px -2px rgba(0, 0, 0, 0.06)',
  lg: '0px 0px 36px 4px rgba(0, 0, 0, 0.07), 0px 5px 22px -4px rgba(0, 0, 0, 0.06)',
  xl: '0px 0px 48px 6px rgba(0, 0, 0, 0.09), 0px 8px 30px -4px rgba(0, 0, 0, 0.08)',
};

const borderRadius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const theme = createTheme({
  palette: {
    primary: palette.primary,
    secondary: palette.secondary,
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
    info: palette.info,
    grey: GREY_COLORS,
    text: {
      primary: palette.text.primary,
      secondary: palette.text.secondary,
    },
    background: {
      default: palette.background.surfaceSoft,
      paper: palette.background.paper,
    },
    divider: palette.divider,
    action: {
      hover: alpha(palette.primary.main, 0.04),
      selected: alpha(palette.primary.main, 0.08),
      disabled: palette.disabled.disabledSoft,
      disabledBackground: palette.background.surfaceMedium,
    },
  },
  typography: {
    fontFamily: FONT_PRIMARY,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    h1: {
      fontSize: 48,
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: 36,
      fontWeight: 600,
      lineHeight: 1.25,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: 28,
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: 24,
      fontWeight: 600,
      lineHeight: 1.35,
    },
    h5: {
      fontSize: 20,
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: 18,
      fontWeight: 600,
      lineHeight: 1.45,
    },
    subtitle1: {
      fontSize: 16,
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: 14,
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: 16,
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: 14,
      fontWeight: 400,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: 12,
      fontWeight: 400,
      lineHeight: 1.5,
    },
    overline: {
      fontSize: 12,
      fontWeight: 600,
      lineHeight: 1.5,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
    },
    button: {
      fontSize: 14,
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: borderRadius.md,
  },
  shadows: [
    'none',
    boxShadows.xs,
    boxShadows.sm,
    boxShadows.sm,
    boxShadows.md,
    boxShadows.md,
    boxShadows.md,
    boxShadows.lg,
    boxShadows.lg,
    boxShadows.lg,
    boxShadows.lg,
    boxShadows.lg,
    boxShadows.xl,
    boxShadows.xl,
    boxShadows.xl,
    boxShadows.xl,
    boxShadows.xl,
    boxShadows.xl,
    boxShadows.xl,
    boxShadows.xl,
    boxShadows.xl,
    boxShadows.xl,
    boxShadows.xl,
    boxShadows.xl,
    boxShadows.xl,
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#FAFBFC',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: borderRadius.md,
          fontWeight: 600,
          textTransform: 'none',
          transition: 'all 150ms ease-in-out',
        },
        sizeLarge: {
          height: 48,
          padding: '12px 24px',
          fontSize: 16,
        },
        sizeMedium: {
          height: 40,
          padding: '8px 16px',
          fontSize: 14,
        },
        sizeSmall: {
          height: 32,
          padding: '6px 12px',
          fontSize: 13,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: boxShadows.sm,
          },
        },
        outlined: {
          borderWidth: 1.5,
          '&:hover': {
            borderWidth: 1.5,
            backgroundColor: alpha(palette.primary.main, 0.04),
          },
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: borderRadius.lg,
          border: '1px solid #EAECF0',
          backgroundColor: '#FFFFFF',
          overflow: 'hidden',
          transition: 'box-shadow 150ms ease-in-out, border-color 150ms ease-in-out',
          '&:hover': {
            borderColor: '#D0D5DD',
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 20,
          '&:last-child': {
            paddingBottom: 20,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.sm,
          fontWeight: 500,
          fontSize: 12,
        },
        sizeSmall: {
          height: 24,
        },
        sizeMedium: {
          height: 28,
        },
        filled: {
          backgroundColor: '#F2F4F7',
          color: palette.text.primary,
          '&:hover': {
            backgroundColor: '#EAECF0',
          },
        },
        outlined: {
          borderColor: '#D0D5DD',
        },
        colorSuccess: {
          backgroundColor: palette.success.light,
          color: palette.success.main,
        },
        colorWarning: {
          backgroundColor: palette.warning.light,
          color: palette.warning.main,
        },
        colorError: {
          backgroundColor: palette.error.light,
          color: palette.error.main,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.md,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#D0D5DD',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: palette.primary.main,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: 1.5,
          },
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #EAECF0',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 64,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.full,
          backgroundColor: '#EAECF0',
        },
        bar: {
          borderRadius: borderRadius.full,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#EAECF0',
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          padding: 0,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.md,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: borderRadius.xl,
          boxShadow: boxShadows.xl,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: palette.text.primary,
          borderRadius: borderRadius.sm,
          fontSize: 12,
          padding: '6px 10px',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.md,
        },
        standardSuccess: {
          backgroundColor: palette.success.light,
          color: palette.success.dark,
        },
        standardWarning: {
          backgroundColor: palette.warning.light,
          color: palette.warning.dark,
        },
        standardError: {
          backgroundColor: palette.error.light,
          color: palette.error.dark,
        },
        standardInfo: {
          backgroundColor: palette.info.light,
          color: palette.info.dark,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #EAECF0',
          padding: '12px 16px',
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#F9FAFB',
          color: palette.text.secondary,
          fontSize: 12,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#F9FAFB',
          },
        },
      },
    },
  },
});

// Export design tokens for use in components
export const tokens = {
  boxShadows,
  borderRadius,
};

// Export palette colors for direct use in components
export { palette, GREY_COLORS as colors } from './palette';
