/**
 * ListCard — Renders a simple list of items
 *
 * Supports bullet, numbered, or check variants.
 */
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircleIcon from '@mui/icons-material/Circle';

import type { ListCardProps } from '../types';

export const ListCard: React.FC<ListCardProps> = ({
  title,
  items,
  variant = 'bullet',
}) => (
  <Card variant="outlined">
    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
      {title && (
        <Typography variant="subtitle2" fontWeight={600} mb={1}>
          {title}
        </Typography>
      )}
      <List dense disablePadding>
        {items.map((item, index) => (
          <ListItem key={index} disableGutters sx={{ py: 0.25 }}>
            {variant !== 'numbered' && (
              <ListItemIcon sx={{ minWidth: 28 }}>
                {variant === 'check' ? (
                  <CheckCircleIcon color="success" sx={{ fontSize: 18 }} />
                ) : (
                  <CircleIcon sx={{ fontSize: 8, color: 'text.secondary' }} />
                )}
              </ListItemIcon>
            )}
            <ListItemText
              primary={
                variant === 'numbered' ? `${index + 1}. ${item}` : item
              }
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
        ))}
      </List>
    </CardContent>
  </Card>
);
