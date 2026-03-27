import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Grid from '@mui/material/Grid';
import { runsApi, agentsApi } from '@/shared/api';
import type { Run, Agent, DownstreamResult } from '@/shared/api/types';
import { runOutputToLayers, type ExtractionLayers } from '@/modules/runs/utils/runOutputToLayers';
import { detectExtractionVersion } from '@/shared/utils/versionDetect';
import { runOutputToCards, type Card as CardData } from '@/modules/runs/utils/runOutputToCards';
import { formatCurrency as formatCurrencyNorm } from '@/shared/utils/normalize';
import { ROUTES } from '@/shared/constants/routes';
import { format } from 'date-fns';

function LayerCard({
  title,
  children,
  defaultExpanded = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Typography
          variant="subtitle1"
          onClick={() => setExpanded((e) => !e)}
          sx={{ cursor: 'pointer', fontWeight: 600, mb: expanded ? 1 : 0 }}
        >
          {title} {expanded ? '▼' : '▶'}
        </Typography>
        {expanded && children}
      </CardContent>
    </Card>
  );
}

function CardRenderer({ card }: { card: CardData }) {
  const wrap = (title: string, body: React.ReactNode) => (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
          {title}
        </Typography>
        {body}
      </CardContent>
    </Card>
  );

  switch (card.type) {
    case 'summary':
      return wrap(card.title, (
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          {card.summary ?? 'No summary extracted.'}
        </Typography>
      ));
    case 'value_metrics':
      if (card.isEmpty) {
        return wrap(card.title, (
          <Typography variant="body2" color="text.secondary">No value data (offerings not matched to catalog)</Typography>
        ));
      }
      return wrap(card.title, (
        <Box>
          <Grid container spacing={1} sx={{ mb: 1 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" color="success.main">Realized</Typography>
              <Typography variant="body1" fontWeight={600}>{formatCurrencyNorm(card.realizedValue)}</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" color="info.main">Committed</Typography>
              <Typography variant="body1" fontWeight={600}>{formatCurrencyNorm(card.committedValue)}</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" color="warning.main">Potential</Typography>
              <Typography variant="body1" fontWeight={600}>{formatCurrencyNorm(card.potentialValue)}</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" color="text.secondary">Total opportunity</Typography>
              <Typography variant="body1" fontWeight={600}>{formatCurrencyNorm(card.totalOpportunityValue)}</Typography>
            </Grid>
          </Grid>
        </Box>
      ));
    case 'kpi_intent':
      return wrap(card.title, (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, Math.max(0, card.percentage ?? 0))}
            sx={{ flex: 1, height: 8, borderRadius: 1 }}
          />
          <Typography variant="body2" fontWeight={600}>{card.percentage ?? 0}%</Typography>
          <Typography variant="body2" color="text.secondary">({card.label})</Typography>
        </Box>
      ));
    case 'visit_checklist':
      return wrap(card.title, (
        <List dense disablePadding>
          {card.items.map((item, i) => (
            <ListItem key={i} disablePadding sx={{ py: 0.25 }}>
              <ListItemText
                primary={item.label}
                secondary={item.completed === true ? 'Yes' : item.completed === false ? 'No' : '—'}
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          ))}
          {card.items.length === 0 && (
            <Typography variant="body2" color="text.secondary">No visit checklist for this visit type</Typography>
          )}
        </List>
      ));
    case 'visit_context': {
      const vc = card;
      return wrap(vc.title, (
        <Box>
          {vc.visitType && <Typography variant="body2"><strong>Visit type:</strong> {vc.visitType}</Typography>}
          {vc.reasonForVisit && <Typography variant="body2"><strong>Reason for visit:</strong> {vc.reasonForVisit}</Typography>}
          {vc.referredBy && <Typography variant="body2"><strong>Referred by:</strong> {vc.referredBy}</Typography>}
          {vc.referrals && <Typography variant="body2"><strong>Referrals:</strong> {vc.referrals}</Typography>}
          {vc.motivatingEvent && <Typography variant="body2"><strong>Motivating event:</strong> {vc.motivatingEvent}</Typography>}
          {!vc.visitType && !vc.reasonForVisit && !vc.referredBy && !vc.referrals && !vc.motivatingEvent && (
            <Typography variant="body2" color="text.secondary">No visit context</Typography>
          )}
        </Box>
      ));
    }
    case 'patient_goals': {
      const pg = card;
      const hasAny =
        (pg.primaryConcern && pg.primaryConcern.trim()) ||
        pg.secondaryConcerns.length > 0 ||
        pg.goals.length > 0 ||
        pg.anticipatedOutcomes.length > 0 ||
        pg.treatmentAreas.length > 0 ||
        pg.statedInterests.length > 0 ||
        pg.futureInterests.length > 0;
      return wrap(pg.title, (
        <Box>
          {pg.primaryConcern && pg.primaryConcern.trim() && (
            <Typography variant="body2" sx={{ mb: 1 }}><strong>Primary concern:</strong> {pg.primaryConcern}</Typography>
          )}
          {pg.secondaryConcerns.length > 0 && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary">Secondary concerns</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {pg.secondaryConcerns.map((c) => <Chip key={c} label={c} size="small" variant="outlined" />)}
              </Box>
            </Box>
          )}
          {pg.goals.length > 0 && (
            <Typography variant="body2" sx={{ mb: 1 }}><strong>Goals:</strong> {pg.goals.join(', ')}</Typography>
          )}
          {pg.anticipatedOutcomes.length > 0 && (
            <Typography variant="body2" sx={{ mb: 1 }}><strong>Anticipated outcomes:</strong> {pg.anticipatedOutcomes.join(', ')}</Typography>
          )}
          {pg.treatmentAreas.length > 0 && (
            <Typography variant="body2" sx={{ mb: 1 }}><strong>Treatment areas:</strong> {pg.treatmentAreas.join(', ')}</Typography>
          )}
          {pg.statedInterests.length > 0 && (
            <Typography variant="body2" sx={{ mb: 1 }}><strong>Stated interests:</strong> {pg.statedInterests.join(', ')}</Typography>
          )}
          {pg.futureInterests.length > 0 && (
            <Typography variant="body2"><strong>Future interests:</strong>{' '}
              {pg.futureInterests.map((fi) => fi.interestLevel ? `${fi.interest} (${fi.interestLevel})` : fi.interest).join('; ')}
            </Typography>
          )}
          {!hasAny && (
            <Typography variant="body2" color="text.secondary">No goals extracted</Typography>
          )}
        </Box>
      ));
    }
    case 'offerings':
      return wrap(card.title, (
        <Box>
          {card.groups.map((g, i) => (
            <Box key={i} sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary">{g.label}</Typography>
              <List dense disablePadding>
                {g.offerings.map((o, j) => (
                  <ListItem key={j} disablePadding>
                    <ListItemText
                      primary={o.name}
                      secondary={o.disposition + (o.value != null ? ` · ${formatCurrencyNorm(o.value)}` : '')}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          ))}
          <Typography variant="body2" fontWeight={600}>
            Potential value: {formatCurrencyNorm(card.valueMetrics.potentialValue)}
          </Typography>
          {card.groups.length === 0 && (
            <Typography variant="body2" color="text.secondary">No offerings</Typography>
          )}
        </Box>
      ));
    case 'opportunities': {
      const oppCard = card;
      return wrap(oppCard.title, (
        <Box>
          {oppCard.opportunitiesSummary && (
            <Typography variant="body2" sx={{ mb: 1 }}>
              {oppCard.opportunitiesSummary}
            </Typography>
          )}
          {oppCard.items.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No opportunities (interest but not booked)</Typography>
          ) : (
            <List dense disablePadding>
              {oppCard.items.map((o, i) => (
                <ListItem key={i} disablePadding sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <ListItemText
                    primary={o.name}
                    secondary={
                      <>
                        {o.blurb}
                        {o.value != null && ` · ${formatCurrencyNorm(o.value)}`}
                      </>
                    }
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                    secondaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      ));
    }
    case 'next_steps':
      return wrap(card.title, (
        <List dense disablePadding>
          {card.steps.map((s, i) => (
            <ListItem key={i} disablePadding>
              <ListItemText
                primary={s.action}
                secondary={[s.timing, s.owner].filter(Boolean).join(' · ')}
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          ))}
          {card.steps.length === 0 && (
            <Typography variant="body2" color="text.secondary">No next steps</Typography>
          )}
        </List>
      ));
    case 'cross_sell_effort': {
      const cse = card;
      return wrap(cse.title, (
        <Typography variant="body2">
          Did the provider attempt to present cross-sell/upsell? <strong>{cse.label}</strong>
        </Typography>
      ));
    }
    case 'objections':
      return wrap(card.title, (
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
            {card.resolvedCount} of {card.totalCount} resolved/addressed. Use &quot;Reveal suggestion&quot; for coaching responses.
          </Typography>
          <List dense disablePadding>
            {card.items.map((o, i) => (
              <ListItem key={i} disablePadding sx={{ py: 0.25 }}>
                <ListItemText
                  primary={[o.kind, o.typeOrTopic].filter(Boolean).join(': ')}
                  secondary={o.statement ? `${o.statement.slice(0, 60)}${o.statement.length > 60 ? '…' : ''} · ${o.resolvedLabel}` : o.resolvedLabel}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
          </List>
          {card.items.length === 0 && (
            <Typography variant="body2" color="text.secondary">No objections, hesitations, or concerns</Typography>
          )}
        </Box>
      ));
    default:
      return null;
  }
}

function AgentResultPreview({ result }: { result: unknown }) {
  const [expanded, setExpanded] = useState(false);
  const str = typeof result === 'object' && result !== null
    ? JSON.stringify(result, null, 2)
    : String(result);
  return (
    <Box sx={{ mt: 1 }}>
      <Button size="small" onClick={() => setExpanded((e) => !e)} sx={{ textTransform: 'none' }}>
        {expanded ? 'Hide result' : 'Show result'}
      </Button>
      {expanded && (
        <Typography
          component="pre"
          variant="caption"
          sx={{
            display: 'block',
            mt: 1,
            p: 1,
            bgcolor: 'action.hover',
            borderRadius: 1,
            overflow: 'auto',
            maxHeight: 320,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {str}
        </Typography>
      )}
    </Box>
  );
}

export function RunDetail() {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();
  const [run, setRun] = useState<Run | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hideEmptyCards, setHideEmptyCards] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [runningAgentId, setRunningAgentId] = useState<string | null>(null);

  const refetchRun = useCallback(() => {
    if (!runId) return;
    runsApi.getById(runId).then((data) => setRun(data));
  }, [runId]);

  useEffect(() => {
    if (!runId) return;
    runsApi
      .getById(runId)
      .then((data) => setRun(data))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [runId]);

  useEffect(() => {
    setAgentsLoading(true);
    agentsApi
      .list()
      .then((data) => setAgents(Array.isArray(data) ? data : []))
      .catch(() => setAgents([]))
      .finally(() => setAgentsLoading(false));
  }, []);

  const version = useMemo(() => detectExtractionVersion(run?.outputs), [run?.outputs]);
  const cards = useMemo(
    () => runOutputToCards(run?.outputs, { hideEmptyCards }),
    [run?.outputs, hideEmptyCards]
  );
  const layers: ExtractionLayers = useMemo(() => runOutputToLayers(run?.outputs), [run?.outputs]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !run) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error ?? 'Run not found'}</Typography>
        <Button onClick={() => navigate(ROUTES.RUNS)} sx={{ mt: 1 }}>
          Back to runs
        </Button>
      </Box>
    );
  }

  const useCards = version === 'v2' && cards.length > 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button size="small" onClick={() => navigate(ROUTES.RUNS)}>
          ← Back to runs
        </Button>
        <Typography variant="h5">{useCards ? 'Extraction cards' : 'Extraction layers'}</Typography>
        <Chip label={version.toUpperCase()} size="small" variant="outlined" />
        <Chip label={run.id.slice(0, 8)} size="small" />
        {useCards && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input
              type="checkbox"
              checked={hideEmptyCards}
              onChange={(e) => setHideEmptyCards(e.target.checked)}
            />
            <Typography variant="body2">Hide empty cards</Typography>
          </label>
        )}
      </Box>

      {useCards ? (
        <Box>
          {cards.map((card) => (
            <CardRenderer key={card.id} card={card} />
          ))}
        </Box>
      ) : (
        <>
          <LayerCard title="Consultation summary">
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {layers.summaryText}
            </Typography>
          </LayerCard>

          <LayerCard title="Buy signal strength (KPI)">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {layers.buySignalDefinition}
            </Typography>
            {layers.buySignalStrength != null ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, Math.max(0, layers.buySignalStrength))}
                  sx={{ flex: 1, height: 8, borderRadius: 1 }}
                />
                <Typography variant="body2" fontWeight={600}>{layers.buySignalStrength}%</Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">Not extracted</Typography>
            )}
          </LayerCard>

          <LayerCard title="Visit type and context">
            {layers.visitType && (
              <Typography variant="body2" sx={{ mb: 1 }}><strong>Visit type:</strong> {layers.visitType}</Typography>
            )}
            {layers.primaryConcerns.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                {layers.primaryConcerns.map((c) => <Chip key={c} label={c} size="small" variant="outlined" />)}
              </Box>
            )}
            {layers.desiredOutcomes.length > 0 && (
              <Typography variant="body2"><strong>Desired outcomes:</strong> {layers.desiredOutcomes.join(', ')}</Typography>
            )}
            {!layers.visitType && layers.primaryConcerns.length === 0 && layers.desiredOutcomes.length === 0 && (
              <Typography variant="body2" color="text.secondary">No visit context extracted</Typography>
            )}
          </LayerCard>

          <LayerCard title="Clinical constraints">
            {layers.clinicalConstraints.length > 0 ? (
              <List dense disablePadding>
                {layers.clinicalConstraints.map(({ key, value }) => (
                  <ListItem key={key} disablePadding sx={{ py: 0.25 }}>
                    <ListItemText primary={key} secondary={value} primaryTypographyProps={{ variant: 'body2' }} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">None extracted</Typography>
            )}
          </LayerCard>

          <LayerCard title="Products and services">
            {layers.productsAndServices.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {layers.productsAndServices.map((p) => <Chip key={p} label={p} size="small" />)}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">None extracted</Typography>
            )}
          </LayerCard>

          <LayerCard title="Opportunities">
            {layers.opportunitiesSummary && (
              <Typography variant="body2" sx={{ mb: 1 }}>{layers.opportunitiesSummary}</Typography>
            )}
            {layers.opportunityItems.length > 0 ? (
              <List dense disablePadding>
                {layers.opportunityItems.map((item, idx) => (
                  <ListItem key={idx} disablePadding sx={{ py: 0.5 }}>
                    <ListItemText
                      primary={item.title ?? item.product_or_service ?? `Opportunity ${idx + 1}`}
                      secondary={item.description}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">No opportunity items extracted</Typography>
            )}
          </LayerCard>
        </>
      )}

      <Card variant="outlined" sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Related agents
          </Typography>
          {agentsLoading ? (
            <Typography variant="body2" color="text.secondary">Loading agents…</Typography>
          ) : agents.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No agents available.</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {agents.map((agent) => {
                const downstream = run?.outputs?.downstream as Record<string, DownstreamResult> | undefined;
                const resultEntry = downstream?.[agent.id];
                const ranAt = resultEntry?.ran_at;
                const result = resultEntry?.result;
                return (
                  <Card key={agent.id} variant="outlined" sx={{ bgcolor: 'action.hover', borderColor: 'divider' }}>
                    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2">{agent.name}</Typography>
                        <Chip label={agent.type} size="small" variant="outlined" />
                        {ranAt ? (
                          <Typography variant="caption" color="text.secondary">
                            Run at {format(new Date(ranAt), 'PPp')}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.secondary">Not run</Typography>
                        )}
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={runningAgentId !== null}
                          onClick={() => {
                            if (!runId) return;
                            setRunningAgentId(agent.id);
                            agentsApi
                              .runDownstream({ run_id: runId, module_id: agent.id })
                              .then(() => refetchRun())
                              .catch((e) => {
                                setError(e instanceof Error ? e.message : String(e));
                              })
                              .finally(() => setRunningAgentId(null));
                          }}
                        >
                          {runningAgentId === agent.id ? 'Running…' : 'Run'}
                        </Button>
                      </Box>
                      {agent.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {agent.description}
                        </Typography>
                      )}
                      {result !== undefined && <AgentResultPreview result={result} />}
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
