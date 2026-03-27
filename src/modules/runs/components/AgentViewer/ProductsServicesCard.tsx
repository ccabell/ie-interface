/**
 * ProductsServicesCard Component
 *
 * Displays products and services discussed during consultation using MUI.
 * Based on: tremor-agent-viewer/src/components/ProductsServicesCard.tsx
 */

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import type { ProductServiceItem, ScoreColor } from '@/shared/api/agentOutputs';
import { formatCurrency } from '@/shared/api/agentOutputs';

interface ProductsServicesCardProps {
  items: ProductServiceItem[];
  potentialValue?: number;
  potentialValueNote?: string;
  title?: string;
  description?: string;
}

const statusColorMap: Record<string, ScoreColor> = {
  'Recommended - receptive': 'success',
  'Discussed - considering': 'warning',
  'Mentioned - hesitant': 'error',
};

function ProductCard({ title, status, area, quantity, snippet }: ProductServiceItem) {
  const color = statusColorMap[status] || 'default';

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 2,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
          <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
            {title}
          </Typography>
          <Chip
            label={status}
            size="small"
            color={color as 'success' | 'warning' | 'error' | 'default'}
            sx={{ flexShrink: 0, fontSize: '0.7rem' }}
          />
        </Box>

        {snippet && (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontStyle: 'italic',
              bgcolor: 'action.hover',
              p: 1,
              borderRadius: 1,
              borderLeft: 3,
              borderColor: 'primary.main',
              mb: 2,
            }}
          >
            "{snippet}"
          </Typography>
        )}

        <Box sx={{ mt: 'auto' }}>
          {area && (
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <Box component="span" fontWeight={600}>Area:</Box> {area}
            </Typography>
          )}
          {quantity && (
            <Typography variant="body2">
              <Box component="span" fontWeight={600}>Quantity:</Box> {quantity}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export function ProductsServicesCard({
  items,
  potentialValue,
  potentialValueNote,
  title = 'Products and Services Discussed',
  description = "Provider discussed multiple treatment options tailored to patient's concerns and aesthetic goals.",
}: ProductsServicesCardProps) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <ShoppingBagOutlinedIcon color="primary" />
          <Typography variant="h6">{title}</Typography>
        </Box>

        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          {description}
        </Typography>

        <Grid container spacing={2}>
          {items.map((item, index) => (
            <Grid key={`${item.title}-${index}`} size={{ xs: 12, sm: 6, lg: 4 }}>
              <ProductCard {...item} />
            </Grid>
          ))}
        </Grid>

        {potentialValue !== undefined && (
          <>
            <Divider sx={{ my: 3 }} />
            <Card
              sx={{
                bgcolor: 'info.light',
                border: 1,
                borderColor: 'info.main',
              }}
              elevation={0}
            >
              <CardContent sx={{ py: 2 }}>
                <Typography variant="body2">
                  <Box component="span" fontWeight={600}>Potential Value:</Box>{' '}
                  <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>
                    {formatCurrency(potentialValue)}
                  </Box>
                </Typography>
                {potentialValueNote && (
                  <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                    {potentialValueNote}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default ProductsServicesCard;
