/**
 * Score color mapping — matches production a360-web-app exactly.
 * 80+ = success (green), 50-79 = warning (orange), <50 = error (red)
 */
export const getScoreColor = (score: number): 'success' | 'warning' | 'error' => {
  if (score >= 80) return 'success';
  if (score >= 50) return 'warning';
  return 'error';
};
