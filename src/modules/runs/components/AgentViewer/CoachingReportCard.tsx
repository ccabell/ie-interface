/**
 * CoachingReportCard - Sales Excellence Framework Coaching Output
 *
 * Displays coaching report using MUI.
 * Based on: tremor-agent-viewer/src/components/CoachingReportCard.tsx
 */

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import type { CoachingReport, DimensionScore, ScoreColor } from '@/shared/api/agentOutputs';
import { DIMENSION_LABELS, getScoreColor } from '@/shared/api/agentOutputs';

interface CoachingReportCardProps {
  data: CoachingReport;
}

function OverallScoreCard({ score, summary }: { score: number; summary: string }) {
  const color: ScoreColor = score >= 8 ? 'success' : score >= 6 ? 'warning' : 'error';

  return (
    <Card
      sx={{
        borderTop: 4,
        borderColor: `${color}.main`,
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Box sx={{ textAlign: 'center', minWidth: 100 }}>
            <Typography variant="h2" fontWeight={700} color={`${color}.main`}>
              {score.toFixed(1)}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              / 10
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              Overall Performance
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {summary}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function DimensionScoreCard({ dimension }: { dimension: DimensionScore }) {
  const label = DIMENSION_LABELS[dimension.id] || dimension.id;
  const color = getScoreColor(dimension.score * 10);

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="body2" fontWeight={500}>
            {label}
          </Typography>
          <Chip
            label={`${dimension.score}/10`}
            size="small"
            color={color}
            sx={{ fontWeight: 600 }}
          />
        </Box>

        <LinearProgress
          variant="determinate"
          value={dimension.score * 10}
          color={color}
          sx={{ height: 6, borderRadius: 3, mb: 2 }}
        />

        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
          {dimension.evidence}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            fontStyle: 'italic',
            color: 'primary.main',
            bgcolor: 'action.hover',
            p: 1,
            borderRadius: 1,
          }}
        >
          "{dimension.key_quote}"
        </Typography>
      </CardContent>
    </Card>
  );
}

export function CoachingReportCard({ data }: CoachingReportCardProps) {
  const { overallScore, consultationSummary, dimensionScores, coachingReport } = data;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Overall Score */}
      <OverallScoreCard score={overallScore} summary={consultationSummary} />

      {/* Dimension Scores Grid */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <SchoolIcon color="primary" />
          <Typography variant="h6">Sales Excellence Dimensions</Typography>
        </Box>
        <Grid container spacing={2}>
          {dimensionScores.map((dim) => (
            <Grid key={dim.id} size={{ xs: 12, sm: 6, lg: 3 }}>
              <DimensionScoreCard dimension={dim} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Strengths */}
      {coachingReport.strengths?.length > 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CheckCircleOutlineIcon sx={{ color: 'success.main' }} />
              <Typography variant="h6">Strengths</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {coachingReport.strengths.map((s, i) => (
                <Card
                  key={i}
                  sx={{
                    bgcolor: 'success.light',
                    border: 1,
                    borderColor: 'success.main',
                  }}
                  elevation={0}
                >
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ color: 'success.dark', mb: 1 }}>
                      {s.title}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1.5 }}>
                      {s.observation}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontStyle: 'italic', color: 'text.secondary', mb: 1.5 }}
                    >
                      "{s.quote}"
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                      <Chip label={s.framework_principle} size="small" color="success" />
                      <Chip label={s.framework_ref} size="small" variant="outlined" />
                    </Box>
                    <Alert severity="success" icon={false}>
                      <Typography variant="subtitle2" gutterBottom>
                        Impact
                      </Typography>
                      <Typography variant="body2">{s.impact}</Typography>
                    </Alert>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Improvements */}
      {coachingReport.improvements?.length > 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TrendingUpIcon sx={{ color: 'warning.main' }} />
              <Typography variant="h6">Areas for Improvement</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {coachingReport.improvements.map((imp, i) => (
                <Card
                  key={i}
                  sx={{
                    bgcolor: 'warning.light',
                    border: 1,
                    borderColor: 'warning.main',
                  }}
                  elevation={0}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ color: 'warning.dark' }}>
                        {imp.title}
                      </Typography>
                      <Chip
                        label={`${imp.priority} priority`}
                        size="small"
                        color={
                          imp.priority === 'high'
                            ? 'error'
                            : imp.priority === 'medium'
                            ? 'warning'
                            : 'default'
                        }
                      />
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1.5 }}>
                      {imp.observation}
                    </Typography>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography variant="body2" color="primary.main" fontWeight={500} sx={{ mb: 1 }}>
                      Technique: {imp.technique}
                    </Typography>
                    <Card sx={{ bgcolor: 'background.default', mb: 1.5 }} elevation={0}>
                      <CardContent sx={{ py: 1.5 }}>
                        <Typography variant="caption" fontWeight={600} display="block" gutterBottom>
                          Suggested Rewrite:
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'success.main', fontStyle: 'italic' }}>
                          "{imp.rewrite}"
                        </Typography>
                      </CardContent>
                    </Card>
                    <Alert severity="info" icon={false}>
                      <Typography variant="subtitle2" gutterBottom>
                        Expected Impact
                      </Typography>
                      <Typography variant="body2">{imp.expected_impact}</Typography>
                    </Alert>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Quick Wins */}
      {coachingReport.quick_wins?.length > 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <LightbulbOutlinedIcon sx={{ color: 'secondary.dark' }} />
              <Typography variant="h6">Quick Wins</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {coachingReport.quick_wins.map((qw, i) => (
                <Card
                  key={i}
                  sx={{
                    bgcolor: 'info.light',
                    border: 1,
                    borderColor: 'info.main',
                  }}
                  elevation={0}
                >
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="body2" fontWeight={500} color="primary.main" gutterBottom>
                      {qw.action}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {qw.rationale}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Coaching Focus */}
      {coachingReport.coaching_focus && (
        <Card
          sx={{
            borderLeft: 4,
            borderColor: 'primary.main',
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <ChatBubbleOutlineIcon color="primary" />
              <Typography variant="h6">
                Coaching Focus: {coachingReport.coaching_focus}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {coachingReport.coaching_focus_rationale}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default CoachingReportCard;
