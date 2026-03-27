/**
 * MetricsPanel Component
 *
 * Displays KPI scores in a grid layout using MUI.
 * Based on: tremor-agent-viewer/src/components/MetricsPanel.tsx
 */

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import BarChartIcon from '@mui/icons-material/BarChart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import DescriptionIcon from '@mui/icons-material/Description';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { getScoreColor } from '@/shared/api/agentOutputs';

export interface MetricItem {
  label: string;
  value: number;
  icon?: 'chart' | 'heart' | 'check' | 'chat' | 'sparkle' | 'smile' | 'document' | 'lightbulb';
  tooltip?: string;
}

interface MetricsPanelProps {
  metrics: MetricItem[];
  columns?: 2 | 3 | 4;
  title?: string;
}

const iconMap = {
  chart: BarChartIcon,
  heart: FavoriteIcon,
  check: CheckCircleIcon,
  chat: ChatBubbleIcon,
  sparkle: AutoAwesomeIcon,
  smile: SentimentSatisfiedIcon,
  document: DescriptionIcon,
  lightbulb: LightbulbIcon,
};

function MetricCard({ label, value, icon, tooltip }: MetricItem) {
  const color = getScoreColor(value);
  const IconComponent = icon ? iconMap[icon] : BarChartIcon;

  const cardContent = (
    <Card
      sx={{
        height: '100%',
        borderTop: 3,
        borderColor: `${color}.main`,
        transition: 'transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 2,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
            <IconComponent sx={{ color: 'text.secondary', fontSize: 20 }} />
            <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
              {label}
            </Typography>
          </Box>
          <Chip label={`${value}%`} size="small" color={color} />
        </Box>

        <Typography variant="h4" fontWeight={700} sx={{ mb: 1.5 }}>
          {value}%
        </Typography>

        <LinearProgress
          variant="determinate"
          value={value}
          color={color}
          sx={{ height: 6, borderRadius: 3 }}
        />

        {tooltip && (
          <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1.5, display: 'block' }}>
            {tooltip}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} placement="top" arrow>
        {cardContent}
      </Tooltip>
    );
  }

  return cardContent;
}

export function MetricsPanel({ metrics, columns = 4, title }: MetricsPanelProps) {
  const getGridSize = () => {
    switch (columns) {
      case 2:
        return { xs: 12, sm: 6 };
      case 3:
        return { xs: 12, sm: 6, lg: 4 };
      case 4:
      default:
        return { xs: 12, sm: 6, lg: 3 };
    }
  };

  const gridSize = getGridSize();

  return (
    <Box>
      {title && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <BarChartIcon color="primary" />
          <Typography variant="h6">{title}</Typography>
        </Box>
      )}

      <Grid container spacing={2}>
        {metrics.map((metric) => (
          <Grid key={metric.label} size={gridSize}>
            <MetricCard {...metric} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

// ============================================================================
// Pre-configured metric sets for common use cases
// ============================================================================

interface ConsultationMetricsPanelProps {
  patientSentiment?: number;
  protocolAdherence?: number;
  patientEngagement?: number;
  planClarity?: number;
}

export function ConsultationMetricsPanel({
  patientSentiment,
  protocolAdherence,
  patientEngagement,
  planClarity,
}: ConsultationMetricsPanelProps) {
  const metrics: MetricItem[] = [];

  if (patientSentiment !== undefined) {
    metrics.push({
      label: 'Patient Sentiment',
      value: patientSentiment,
      icon: 'smile',
      tooltip: 'Overall patient emotional response during consultation',
    });
  }

  if (protocolAdherence !== undefined) {
    metrics.push({
      label: 'Protocol Adherence',
      value: protocolAdherence,
      icon: 'check',
      tooltip: 'How well the consultation followed standard protocols',
    });
  }

  if (patientEngagement !== undefined) {
    metrics.push({
      label: 'Patient Engagement',
      value: patientEngagement,
      icon: 'chat',
      tooltip: 'Level of patient participation and interest',
    });
  }

  if (planClarity !== undefined) {
    metrics.push({
      label: 'Plan Clarity',
      value: planClarity,
      icon: 'document',
      tooltip: 'How clearly the treatment plan was communicated',
    });
  }

  return <MetricsPanel metrics={metrics} columns={4} title="Consultation Metrics" />;
}

export default MetricsPanel;
