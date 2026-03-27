/**
 * AgentOutputCard Component
 *
 * Smart router that detects output type and renders the appropriate component.
 * This is the main entry point for rendering AI agent outputs.
 *
 * Usage:
 *   <AgentOutputCard output={run.output} />
 *
 * Based on: tremor-agent-viewer/src/components/AgentOutputCard.tsx
 */

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import DescriptionIcon from '@mui/icons-material/Description';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { SummaryCard } from './SummaryCard';
import { MetricsPanel, ConsultationMetricsPanel } from './MetricsPanel';
import { ProductsServicesCard } from './ProductsServicesCard';
import { ObjectionsCard } from './ObjectionsCard';
import { CoachingReportCard } from './CoachingReportCard';
import type {
  AgentOutput,
  ConsultationIntelligence,
  TreatmentCarePlan,
  SoapNote,
  KpiEvaluation,
  CoachingReport,
  ProductServiceItem,
} from '@/shared/api/agentOutputs';
import { detectOutputType, getScoreColor } from '@/shared/api/agentOutputs';

interface AgentOutputCardProps {
  output: AgentOutput | Record<string, unknown>;
}

// ============================================================================
// Consultation Intelligence View
// ============================================================================

function ConsultationIntelligenceView({ data }: { data: ConsultationIntelligence }) {
  // Transform products_discussed to ProductServiceItem format if needed
  const products: ProductServiceItem[] = (data.products_discussed || []).map((p) => ({
    title: typeof p === 'string' ? p : p.title || 'Unknown',
    status: (typeof p === 'object' ? p.status : 'Discussed - considering') as ProductServiceItem['status'],
    area: typeof p === 'object' ? p.area : undefined,
    quantity: typeof p === 'object' ? p.quantity : undefined,
    snippet: typeof p === 'object' ? p.snippet : undefined,
  }));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Summary Section */}
      {data.general_summary && (
        <SummaryCard
          description={data.general_summary}
          commitmentLevel={data.intent_strength_0_100_value}
          stats={[
            ...(data.patient_goal_primary_value
              ? [{ label: 'Patient Goal', value: data.patient_goal_primary_value, score: 90 }]
              : []),
            ...(data.call_type ? [{ label: 'Encounter Type', value: data.call_type }] : []),
            ...(data.target_areas_value?.length
              ? [{ label: 'Target Areas', value: data.target_areas_value.join(', ') }]
              : []),
          ]}
        />
      )}

      {/* KPI Metrics */}
      {(data.patient_sentiment_score !== undefined ||
        data.protocol_adherence_score !== undefined ||
        data.patient_engagement_score !== undefined ||
        data.plan_clarity_score !== undefined) && (
        <ConsultationMetricsPanel
          patientSentiment={data.patient_sentiment_score}
          protocolAdherence={data.protocol_adherence_score}
          patientEngagement={data.patient_engagement_score}
          planClarity={data.plan_clarity_score}
        />
      )}

      {/* Concerns Section */}
      {(data.concerns?.primary?.length || data.concerns?.secondary?.length) && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Primary Concerns
                </Typography>
                <List dense>
                  {data.concerns?.primary?.map((c, i) => (
                    <ListItem key={i}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Chip label="Primary" size="small" color="error" sx={{ fontSize: '0.7rem' }} />
                      </ListItemIcon>
                      <ListItemText primary={c} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          {data.concerns?.secondary?.length && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Secondary Concerns
                  </Typography>
                  <List dense>
                    {data.concerns.secondary.map((c, i) => (
                      <ListItem key={i}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Chip label="Secondary" size="small" color="warning" sx={{ fontSize: '0.7rem' }} />
                        </ListItemIcon>
                        <ListItemText primary={c} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* Patient Goals */}
      {data.patient_goals?.length && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Patient Goals
            </Typography>
            <List dense>
              {data.patient_goals.map((goal, i) => (
                <ListItem key={i}>
                  <ListItemText primary={goal} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Products & Services */}
      {products.length > 0 && <ProductsServicesCard items={products} />}

      {/* Objections */}
      {data.objections?.length && <ObjectionsCard items={data.objections} />}

      {/* Next Steps */}
      {data.next_steps?.length && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Next Steps
            </Typography>
            <List dense>
              {data.next_steps.map((step, i) => (
                <ListItem key={i}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {step.is_completed ? (
                      <CheckCircleIcon color="success" fontSize="small" />
                    ) : (
                      <AssignmentIcon color="action" fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {step.is_completed && <Chip label="Completed" size="small" color="success" />}
                        <Typography
                          variant="body2"
                          sx={{ textDecoration: step.is_completed ? 'line-through' : 'none' }}
                        >
                          {step.title}
                        </Typography>
                        {step.when && (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            ({step.when})
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

// ============================================================================
// TCP View
// ============================================================================

function TcpView({ data }: { data: TreatmentCarePlan }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {data.plan_summary && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AssignmentIcon color="primary" />
              <Typography variant="h6">Treatment & Care Plan</Typography>
            </Box>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {data.plan_summary}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Treatment Options */}
      {data.options?.length && (
        <Grid container spacing={2}>
          {data.options.map((option) => (
            <Grid key={option.tier} size={{ xs: 12, md: 4 }}>
              <Card
                sx={{
                  height: '100%',
                  borderTop: 4,
                  borderColor:
                    option.tier === 'best'
                      ? 'success.main'
                      : option.tier === 'better'
                      ? 'primary.main'
                      : 'grey.400',
                }}
              >
                <CardContent>
                  <Chip
                    label={option.tier.toUpperCase()}
                    color={
                      option.tier === 'best'
                        ? 'success'
                        : option.tier === 'better'
                        ? 'primary'
                        : 'default'
                    }
                    sx={{ mb: 1.5 }}
                  />
                  <Typography variant="h6" gutterBottom>
                    {option.name}
                  </Typography>
                  {option.description && (
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                      {option.description}
                    </Typography>
                  )}
                  <List dense>
                    {option.services.map((service, i) => (
                      <ListItem key={i} sx={{ px: 0 }}>
                        <ListItemText
                          primary={service.name}
                          secondary={service.quantity}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="h5" color="primary.main" fontWeight={700}>
                      ${option.total_price.toLocaleString()}
                    </Typography>
                    {option.savings && option.savings > 0 && (
                      <Chip
                        label={`Save $${option.savings.toLocaleString()}`}
                        size="small"
                        color="success"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Patient Education */}
      {data.patient_education?.length && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Patient Education
            </Typography>
            <List dense>
              {data.patient_education.map((item, i) => (
                <ListItem key={i}>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

// ============================================================================
// SOAP Note View
// ============================================================================

function SoapNoteView({ data }: { data: SoapNote }) {
  const sections = [
    { key: 'subjective', label: 'Subjective', color: 'primary' as const },
    { key: 'objective', label: 'Objective', color: 'success' as const },
    { key: 'assessment', label: 'Assessment', color: 'warning' as const },
    { key: 'plan', label: 'Plan', color: 'secondary' as const },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <DescriptionIcon color="primary" />
        <Typography variant="h6">SOAP Note</Typography>
      </Box>

      {sections.map(({ key, label, color }) => {
        const content = data[key as keyof SoapNote];
        if (!content) return null;

        return (
          <Card
            key={key}
            sx={{
              borderLeft: 4,
              borderColor: `${color}.main`,
            }}
          >
            <CardContent>
              <Chip label={label} size="small" color={color} sx={{ mb: 1.5 }} />
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {content}
              </Typography>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}

// ============================================================================
// KPI Evaluation View
// ============================================================================

function KpiView({ data }: { data: KpiEvaluation }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {data.category} Evaluation
          </Typography>
          {data.overall_score !== undefined && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Overall Score
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h3" fontWeight={700}>
                  {data.overall_score}%
                </Typography>
                <Chip
                  label={
                    data.overall_score >= 80
                      ? 'Excellent'
                      : data.overall_score >= 60
                      ? 'Good'
                      : 'Needs Improvement'
                  }
                  color={getScoreColor(data.overall_score)}
                  size="medium"
                />
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      <MetricsPanel
        metrics={data.scores.map((s) => ({
          label: s.kpi_name,
          value: s.score,
        }))}
        columns={3}
      />

      {data.recommendations?.length && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recommendations
            </Typography>
            <List dense>
              {data.recommendations.map((rec, i) => (
                <ListItem key={i}>
                  <ListItemText primary={rec} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

// ============================================================================
// Raw JSON View (Fallback)
// ============================================================================

function RawJsonView({ data }: { data: Record<string, unknown> }) {
  return (
    <Card>
      <CardContent>
        <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 2 }}>
          This output type is not recognized. Displaying raw JSON data.
        </Alert>
        <Box
          component="pre"
          sx={{
            bgcolor: 'grey.100',
            p: 2,
            borderRadius: 1,
            overflow: 'auto',
            fontSize: '0.875rem',
            maxHeight: 500,
          }}
        >
          {JSON.stringify(data, null, 2)}
        </Box>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function AgentOutputCard({ output }: AgentOutputCardProps) {
  // Detect output type
  const data = 'data' in output ? output.data : output;
  const outputType = 'type' in output ? output.type : detectOutputType(data as Record<string, unknown>);

  switch (outputType) {
    case 'consultation_intelligence':
      return <ConsultationIntelligenceView data={data as unknown as ConsultationIntelligence} />;
    case 'tcp':
      return <TcpView data={data as unknown as TreatmentCarePlan} />;
    case 'soap_note':
      return <SoapNoteView data={data as unknown as SoapNote} />;
    case 'kpi_evaluation':
      return <KpiView data={data as unknown as KpiEvaluation} />;
    case 'coaching_report':
      return <CoachingReportCard data={data as unknown as CoachingReport} />;
    default:
      return <RawJsonView data={data as Record<string, unknown>} />;
  }
}

export default AgentOutputCard;
