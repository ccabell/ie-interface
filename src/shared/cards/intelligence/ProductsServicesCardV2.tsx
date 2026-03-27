/**
 * ProductsServicesCardV2 — ported from a360-web-app production Intelligence tab.
 * Grid of product/service cards with status chips and optional snippets.
 * Adapted: uses MUI Chip instead of custom MDChip.
 */
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { SummaryCard } from '../base/SummaryCard';

type ProductStatus = 'Recommended - receptive' | 'Discussed - considering' | 'Mentioned - hesitant';

export type ProductItemV2 = {
  title: string;
  status: ProductStatus;
  area?: string;
  quantity?: string;
  snippet?: string;
};

type ProductsServicesCardPropsV2 = {
  items: ProductItemV2[];
  potentialValue?: string;
  potentialValueNote?: string;
  icon?: React.ReactNode;
};

const STATUS_COLORS: Record<ProductStatus, 'primary' | 'warning' | 'error'> = {
  'Recommended - receptive': 'primary',
  'Discussed - considering': 'warning',
  'Mentioned - hesitant': 'error',
};

const ProductCardV2: React.FC<ProductItemV2> = ({ title, status, area, quantity, snippet }) => (
  <Card variant="outlined" sx={{ height: 1 }}>
    <CardContent sx={{ p: 1.5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1} mb={1.5}>
        <Typography variant="body1" fontWeight={600} textTransform="uppercase">
          {title}
        </Typography>
        <Chip
          label={status}
          size="small"
          color={STATUS_COLORS[status] ?? 'default'}
          sx={{ flexShrink: 0, borderRadius: 1 }}
        />
      </Stack>

      {snippet && (
        <Typography variant="body2" color="textSecondary" fontStyle="italic" mb={1}>
          {snippet}
        </Typography>
      )}

      <Stack gap={0.25}>
        {area && (
          <Typography variant="body2" color="textSecondary">
            <b>Area:</b> {area}
          </Typography>
        )}
        {quantity && (
          <Typography variant="body2" color="textSecondary">
            <b>Quantity:</b> {quantity}
          </Typography>
        )}
      </Stack>
    </CardContent>
  </Card>
);

export const ProductsServicesCardV2: React.FC<ProductsServicesCardPropsV2> = ({
  items,
  potentialValue,
  potentialValueNote,
  icon,
}) => (
  <SummaryCard
    title="Products and services discussed"
    icon={icon}
    description="Provider discussed multiple treatment options tailored to patient's concerns and aesthetic goals."
  >
    <Grid container spacing={1.5}>
      {items.map(item => (
        <Grid key={item.title} size={{ xs: 12, sm: 6, lg: 4 }}>
          <ProductCardV2 {...item} />
        </Grid>
      ))}
    </Grid>

    {potentialValue && (
      <>
        <Divider sx={{ my: 1.5 }} />
        <Card sx={{ p: 1 }}>
          <Box>
            <Typography variant="subtitle2">
              <b>Potential value:</b>{' '}
              <Typography component="span" variant="subtitle2" color="primary" fontWeight={700}>
                {potentialValue}
              </Typography>
            </Typography>
          </Box>
          {potentialValueNote && (
            <Typography variant="body1" color="textSecondary">
              {potentialValueNote}
            </Typography>
          )}
        </Card>
      </>
    )}
  </SummaryCard>
);
