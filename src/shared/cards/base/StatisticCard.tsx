/**
 * StatisticCard — ported from a360-web-app production.
 * Simple card displaying a label + value with optional tooltip.
 * Adapted: uses MUI InfoOutlined icon instead of custom Icon.
 */
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

type StatCardProps = {
  label: string;
  value: string;
  tooltip?: string;
};

export const StatisticCard: React.FC<StatCardProps> = ({ label, value, tooltip }) => (
  <Card>
    <Stack p={{ xs: 1.5, sm: 2 }} gap={1}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={0.5}>
        <Typography variant="subtitle2" fontWeight={600}>
          {label}
        </Typography>

        {tooltip && (
          <Tooltip title={tooltip} placement="top" arrow>
            <IconButton size="small">
              <InfoOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      <Typography variant="h5" fontWeight={600} color="primary">
        {value}
      </Typography>
    </Stack>
  </Card>
);
