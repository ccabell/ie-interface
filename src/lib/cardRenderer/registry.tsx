/**
 * Card Registry — Maps cardType strings to React components
 */
import type { ComponentType } from 'react';
import type { CardType } from './types';

// Generic cards
import { ChipsCard, KeyValueCard, ListCard, TimelineCard } from './cards';

// Basic cards (inline for now - can be extracted later)
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

/* ──────────────────────────────────────────────────────────────────────────
 * INLINE CARD COMPONENTS
 * ────────────────────────────────────────────────────────────────────────── */

const StatisticCard: React.FC<{ label: string; value: string; tooltip?: string }> = ({ label, value }) => (
  <Card variant="outlined">
    <CardContent sx={{ p: 2 }}>
      <Typography variant="body2" color="text.secondary" mb={0.5}>{label}</Typography>
      <Typography variant="h5" fontWeight={600} color="primary">{value}</Typography>
    </CardContent>
  </Card>
);

const SummaryCard: React.FC<{ title?: string; description: string }> = ({ title, description }) => (
  <Card variant="outlined">
    <CardContent sx={{ p: 2 }}>
      {title && <Typography variant="subtitle2" fontWeight={600} mb={1}>{title}</Typography>}
      <Typography variant="body2" color="text.secondary" whiteSpace="pre-line">{description}</Typography>
    </CardContent>
  </Card>
);

const AccordionCard: React.FC<{ title: string; value: number }> = ({ title, value }) => (
  <Card variant="outlined">
    <CardContent sx={{ p: 2 }}>
      <Typography variant="subtitle2" fontWeight={600} mb={1}>{title}</Typography>
      <Typography variant="h5" fontWeight={600} mb={1}>{value}%</Typography>
      <LinearProgress variant="determinate" value={value} color={value >= 70 ? 'success' : value >= 40 ? 'warning' : 'error'} />
    </CardContent>
  </Card>
);

const ValueAccordionCard = AccordionCard;

const ConcernsCard: React.FC<{ primary: string[]; secondary: string[] }> = ({ primary, secondary }) => (
  <Card variant="outlined">
    <CardContent sx={{ p: 2 }}>
      <Typography variant="subtitle2" fontWeight={600} mb={1.5}>Concerns</Typography>
      <Stack gap={1.5}>
        <Box>
          <Typography variant="caption" color="text.secondary">Primary</Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.5} mt={0.5}>
            {primary.map(c => <Chip key={c} label={c} size="small" color="primary" />)}
          </Stack>
        </Box>
        {secondary.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary">Secondary</Typography>
            <Stack direction="row" flexWrap="wrap" gap={0.5} mt={0.5}>
              {secondary.map(c => <Chip key={c} label={c} size="small" variant="outlined" />)}
            </Stack>
          </Box>
        )}
      </Stack>
    </CardContent>
  </Card>
);

const AreasCard: React.FC<{ treatmentAreas: string[]; concernAreas: string[] }> = ({ treatmentAreas, concernAreas }) => (
  <Card variant="outlined">
    <CardContent sx={{ p: 2 }}>
      <Typography variant="subtitle2" fontWeight={600} mb={1.5}>Areas</Typography>
      <Stack gap={1.5}>
        <Box>
          <Typography variant="caption" color="text.secondary">Treatment Areas</Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.5} mt={0.5}>
            {treatmentAreas.map(a => <Chip key={a} label={a} size="small" color="success" />)}
          </Stack>
        </Box>
        {concernAreas.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary">Concern Areas</Typography>
            <Stack direction="row" flexWrap="wrap" gap={0.5} mt={0.5}>
              {concernAreas.map(a => <Chip key={a} label={a} size="small" color="warning" />)}
            </Stack>
          </Box>
        )}
      </Stack>
    </CardContent>
  </Card>
);

const PatientGoalsCard: React.FC<{ goals: string[]; anticipatedOutcomes: string[]; statedInterests: string[] }> = ({ goals, anticipatedOutcomes, statedInterests }) => (
  <Card variant="outlined">
    <CardContent sx={{ p: 2 }}>
      <Typography variant="subtitle2" fontWeight={600} mb={1.5}>Patient Goals</Typography>
      <Stack gap={1.5}>
        {goals.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary">Goals</Typography>
            <Stack gap={0.25} mt={0.5}>{goals.map(g => <Typography key={g} variant="body2">• {g}</Typography>)}</Stack>
          </Box>
        )}
        {anticipatedOutcomes.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary">Anticipated Outcomes</Typography>
            <Stack gap={0.25} mt={0.5}>{anticipatedOutcomes.map(o => <Typography key={o} variant="body2">• {o}</Typography>)}</Stack>
          </Box>
        )}
        {statedInterests.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary">Stated Interests</Typography>
            <Stack direction="row" flexWrap="wrap" gap={0.5} mt={0.5}>
              {statedInterests.map(i => <Chip key={i} label={i} size="small" />)}
            </Stack>
          </Box>
        )}
      </Stack>
    </CardContent>
  </Card>
);

const EvidenceCard: React.FC<{ quote: string; speaker?: string }> = ({ quote, speaker }) => (
  <Card variant="outlined" sx={{ borderLeft: 3, borderLeftColor: 'primary.main' }}>
    <CardContent sx={{ p: 2 }}>
      <Typography variant="body2" fontStyle="italic" mb={speaker ? 1 : 0}>"{quote}"</Typography>
      {speaker && <Typography variant="caption" color="text.secondary">— {speaker}</Typography>}
    </CardContent>
  </Card>
);

const CrossSellCard: React.FC<{ score: number; description: string }> = ({ score, description }) => (
  <Card variant="outlined">
    <CardContent sx={{ p: 2 }}>
      <Typography variant="subtitle2" fontWeight={600} mb={1}>Cross-Sell Effort</Typography>
      <Typography variant="h5" fontWeight={600} color={score >= 70 ? 'success.main' : 'text.primary'} mb={0.5}>{score}%</Typography>
      <Typography variant="body2" color="text.secondary">{description}</Typography>
    </CardContent>
  </Card>
);

// Placeholder cards for types that need complex implementation
const PlaceholderCard: React.FC<{ cardType: string; props: Record<string, unknown> }> = ({ cardType, props }) => (
  <Card variant="outlined" sx={{ bgcolor: 'action.hover' }}>
    <CardContent sx={{ p: 2 }}>
      <Typography variant="caption" color="text.secondary">Card: {cardType}</Typography>
      <Typography variant="body2" component="pre" sx={{ fontSize: 11, overflow: 'auto', maxHeight: 200 }}>
        {JSON.stringify(props, null, 2)}
      </Typography>
    </CardContent>
  </Card>
);

/* ──────────────────────────────────────────────────────────────────────────
 * CARD REGISTRY
 * ────────────────────────────────────────────────────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CARD_REGISTRY: Record<CardType, ComponentType<any>> = {
  statistic: StatisticCard,
  summary: SummaryCard,
  accordion: AccordionCard,
  valueAccordion: ValueAccordionCard,
  evidence: EvidenceCard,
  concerns: ConcernsCard,
  areas: AreasCard,
  patientGoals: PatientGoalsCard,
  crossSell: CrossSellCard,
  list: ListCard,
  keyValue: KeyValueCard,
  timeline: TimelineCard,
  chips: ChipsCard,
  // Placeholders - implement fully when needed
  futureInterests: (props: any) => <PlaceholderCard cardType="futureInterests" props={props} />,
  productsServices: (props: any) => <PlaceholderCard cardType="productsServices" props={props} />,
  nextSteps: (props: any) => <PlaceholderCard cardType="nextSteps" props={props} />,
  objections: (props: any) => <PlaceholderCard cardType="objections" props={props} />,
  visitContext: (props: any) => <PlaceholderCard cardType="visitContext" props={props} />,
  visitChecklist: (props: any) => <PlaceholderCard cardType="visitChecklist" props={props} />,
  chipGroup: (props: any) => <PlaceholderCard cardType="chipGroup" props={props} />,
  bulletGroup: (props: any) => <PlaceholderCard cardType="bulletGroup" props={props} />,
  itemList: (props: any) => <PlaceholderCard cardType="itemList" props={props} />,
  sectionCard: (props: any) => <PlaceholderCard cardType="sectionCard" props={props} />,
};

export const DEFAULT_GRIDS: Record<CardType, { xs: number; sm?: number; md?: number }> = {
  statistic: { xs: 12, sm: 6, md: 3 },
  summary: { xs: 12, md: 6 },
  accordion: { xs: 12, sm: 6, md: 4 },
  valueAccordion: { xs: 12, sm: 6, md: 4 },
  evidence: { xs: 12, sm: 6, md: 4 },
  concerns: { xs: 12, sm: 6 },
  areas: { xs: 12, sm: 6 },
  patientGoals: { xs: 12 },
  crossSell: { xs: 12, sm: 6, md: 4 },
  list: { xs: 12, sm: 6, md: 4 },
  keyValue: { xs: 12, sm: 6, md: 4 },
  timeline: { xs: 12, sm: 6, md: 4 },
  chips: { xs: 12, sm: 6, md: 4 },
  futureInterests: { xs: 12 },
  productsServices: { xs: 12 },
  nextSteps: { xs: 12, sm: 6, md: 4 },
  objections: { xs: 12, sm: 6, md: 8 },
  visitContext: { xs: 12, sm: 6 },
  visitChecklist: { xs: 12, sm: 6 },
  chipGroup: { xs: 12, sm: 6 },
  bulletGroup: { xs: 12 },
  itemList: { xs: 12 },
  sectionCard: { xs: 12 },
};

export const getCardComponent = (cardType: string): ComponentType<unknown> | undefined => CARD_REGISTRY[cardType as CardType];
export const isValidCardType = (cardType: string): cardType is CardType => cardType in CARD_REGISTRY;
export const getDefaultGrid = (cardType: CardType) => DEFAULT_GRIDS[cardType] ?? { xs: 12 };
