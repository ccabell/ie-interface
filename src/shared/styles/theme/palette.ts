/**
 * A360 brand palette - complete color system from production.
 * Source: a360-web-app/src/shared/styles/theme/base/palette.ts
 */

const WHITE_COLOR = '#fff';

export const PRIMARY_COLORS = {
  main: '#547BA3',
  light: '#7A9BBF',
  dark: '#416288',
  darker: '#324A68',
  contrastText: WHITE_COLOR,
};

export const SECONDARY_COLORS = {
  main: '#C5CCD9',
  light: '#D8DDE6',
  dark: '#98A2B3',
  darker: '#344054',
  contrastText: WHITE_COLOR,
};

export const SUCCESS_COLORS = {
  light: '#ECFDF3',
  main: '#17826A',
  dark: '#12705B',
  contrastText: WHITE_COLOR,
};

export const WARNING_COLORS = {
  light: '#FFFAEB',
  main: '#F79009',
  dark: '#DC6803',
  contrastText: WHITE_COLOR,
};

export const ERROR_COLORS = {
  light: '#FEF3F2',
  main: '#FF6666',
  dark: '#D92D20',
  contrastText: WHITE_COLOR,
};

export const INFO_COLORS = {
  light: '#F5F7FA',
  main: '#3B82F6',
  dark: '#2563EB',
  contrastText: WHITE_COLOR,
};

export const GREY_COLORS = {
  50: '#F9FAFB',
  100: '#F2F4F7',
  200: '#EAECF0',
  300: '#D0D5DD',
  400: '#98A2B3',
  500: '#667085',
  600: '#475467',
  700: '#344054',
  800: '#1D2939',
  900: '#101828',
};

export const TEXT_COLORS = {
  primary: '#344054',
  secondary: '#667085',
  body: '#8C95A4',
  disabled: '#EDEDED',
};

export const BACKGROUND_COLORS = {
  default: WHITE_COLOR,
  paper: WHITE_COLOR,
  surfaceSoft: '#F9FAFB',
  surfaceMedium: '#F2F4F7',
  surfaceStrong: '#EAECF0',
};

export const DISABLED_COLORS = {
  disabledSoft: '#EDEDED',
  disabledMedium: '#96999E',
};

export const palette = {
  primary: PRIMARY_COLORS,
  secondary: SECONDARY_COLORS,
  success: SUCCESS_COLORS,
  warning: WARNING_COLORS,
  error: ERROR_COLORS,
  info: INFO_COLORS,
  grey: GREY_COLORS,
  text: TEXT_COLORS,
  background: BACKGROUND_COLORS,
  disabled: DISABLED_COLORS,
  divider: BACKGROUND_COLORS.surfaceStrong,
} as const;
