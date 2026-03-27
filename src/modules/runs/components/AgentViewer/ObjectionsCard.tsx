/**
 * ObjectionsCard Component
 *
 * Displays objections, hesitations, and concerns from consultations using MUI.
 * Based on: tremor-agent-viewer/src/components/ObjectionsCard.tsx
 */

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Alert from '@mui/material/Alert';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import type { Objection, ScoreColor } from '@/shared/api/agentOutputs';

interface ObjectionsCardProps {
  items: Objection[];
  title?: string;
  isExpandedByDefault?: boolean;
}

const typeColorMap: Record<string, ScoreColor> = {
  Objection: 'error',
  Hesitation: 'warning',
  Concern: 'warning',
};

const statusColorMap: Record<string, ScoreColor> = {
  Addressed: 'success',
  Resolved: 'info',
  'Not addressed': 'error',
};

const statusIconMap = {
  Addressed: CheckCircleIcon,
  Resolved: CheckCircleIcon,
  'Not addressed': CancelIcon,
};

function ObjectionItem({ type, status, title, snippet, coaching_response }: Objection) {
  const typeColor = typeColorMap[type] || 'default';
  const statusColor = statusColorMap[status] || 'default';
  const StatusIcon = statusIconMap[status] || CancelIcon;

  return (
    <Accordion
      sx={{
        '&:before': { display: 'none' },
        boxShadow: 'none',
        border: 1,
        borderColor: 'divider',
        '&:not(:last-child)': { mb: 1 },
        borderRadius: '8px !important',
        overflow: 'hidden',
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          '& .MuiAccordionSummary-content': {
            alignItems: 'center',
            gap: 1.5,
            my: 1,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
          <Chip
            label={type}
            size="small"
            color={typeColor as 'success' | 'warning' | 'error' | 'info' | 'default'}
            sx={{ fontSize: '0.7rem' }}
          />
          <Typography variant="body2" fontWeight={500} sx={{ flex: 1 }}>
            {title}
          </Typography>
        </Box>
        <Chip
          icon={<StatusIcon sx={{ fontSize: 16 }} />}
          label={status}
          size="small"
          color={statusColor as 'success' | 'warning' | 'error' | 'info' | 'default'}
          sx={{ fontSize: '0.7rem', mr: 1 }}
        />
      </AccordionSummary>

      <AccordionDetails sx={{ pt: 0 }}>
        {snippet && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
              Patient Quote
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontStyle: 'italic',
                bgcolor: 'action.hover',
                p: 1.5,
                borderRadius: 1,
                borderLeft: 3,
                borderColor: 'primary.main',
              }}
            >
              "{snippet}"
            </Typography>
          </Box>
        )}

        {coaching_response && (
          <Alert
            icon={<LightbulbOutlinedIcon />}
            severity="info"
            sx={{ mt: 1 }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Coaching Recommendation
            </Typography>
            <Typography variant="body2">
              {coaching_response}
            </Typography>
          </Alert>
        )}

        {!coaching_response && status === 'Not addressed' && (
          <Alert
            icon={<WarningAmberIcon />}
            severity="warning"
            sx={{ mt: 1 }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Action Required
            </Typography>
            <Typography variant="body2">
              This concern was not addressed during the consultation. Consider following up with the patient.
            </Typography>
          </Alert>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

export function ObjectionsCard({
  items,
  title = 'Objections & Concerns',
}: ObjectionsCardProps) {
  const addressed = items.filter((i) => i.status === 'Addressed' || i.status === 'Resolved').length;
  const notAddressed = items.filter((i) => i.status === 'Not addressed').length;

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningAmberIcon sx={{ color: 'warning.main' }} />
            <Typography variant="h6">{title}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {addressed > 0 && (
              <Chip label={`${addressed} Addressed`} size="small" color="success" />
            )}
            {notAddressed > 0 && (
              <Chip label={`${notAddressed} Not Addressed`} size="small" color="error" />
            )}
          </Box>
        </Box>

        <Box>
          {items.map((item, index) => (
            <ObjectionItem key={`${item.title}-${index}`} {...item} />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

export default ObjectionsCard;
