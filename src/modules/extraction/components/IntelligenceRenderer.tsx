/**
 * IntelligenceRenderer — renders the full Intelligence tab card layout
 * from mapped extraction data. This is the production-equivalent layout
 * that mirrors IntelligenceTabContent.tsx from a360-web-app.
 *
 * Pass it a MappedCardData object and it renders all cards in the
 * exact same grid layout as the production Intelligence tab.
 */
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import {
  GeneralSummarySection,
  PatientGoalsCard,
  ProductsServicesCardV2,
  ObjectionsCard,
  NextStepsTimelineCard,
} from '@/shared/cards';
import { type MappedCardData, EMPTY_STATE_MESSAGES } from '@/modules/extraction/utils/extractionToCards';

type IntelligenceRendererProps = {
  data: MappedCardData;
  showEmptyCards?: boolean;
};

const EmptyMessage: React.FC<{ message: string }> = ({ message }) => (
  <Box sx={{ py: 2, textAlign: 'center' }}>
    <Typography variant="body2" color="text.disabled" fontStyle="italic">
      {message}
    </Typography>
  </Box>
);

export const IntelligenceRenderer: React.FC<IntelligenceRendererProps> = ({ data, showEmptyCards = true }) => {
  const { generalSummary, patientGoals, productsServices, objections, nextSteps, isEmpty } = data;

  return (
    <Grid container spacing={2}>
      {/* General Summary Section */}
      {(!isEmpty.summary || showEmptyCards) && (
        <Grid size={12}>
          {isEmpty.summary ? (
            <EmptyMessage message={EMPTY_STATE_MESSAGES.summary} />
          ) : (
            <GeneralSummarySection
              description={generalSummary.description}
              stats={generalSummary.stats}
              commitmentLevel={generalSummary.commitmentLevel}
              sentiment={generalSummary.sentiment}
            />
          )}
        </Grid>
      )}

      {/* Commitment + Sentiment Metrics Row */}
      {isEmpty.commitmentScore && showEmptyCards && (
        <Grid size={12}>
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            {EMPTY_STATE_MESSAGES.commitmentScore}
          </Alert>
        </Grid>
      )}

      {/* Patient Goals */}
      {(!isEmpty.patientGoals || showEmptyCards) && (
        <Grid size={12}>
          {isEmpty.patientGoals ? (
            <EmptyMessage message={EMPTY_STATE_MESSAGES.patientGoals} />
          ) : (
            <PatientGoalsCard
              goals={patientGoals.goals}
              anticipatedOutcomes={patientGoals.anticipatedOutcomes}
              statedInterests={patientGoals.statedInterests}
            />
          )}
        </Grid>
      )}

      {/* Products & Services Discussed */}
      {(!isEmpty.treatments || showEmptyCards) && (
        <Grid size={12}>
          {isEmpty.treatments ? (
            <EmptyMessage message={EMPTY_STATE_MESSAGES.treatments} />
          ) : (
            <ProductsServicesCardV2 items={productsServices.items} />
          )}
        </Grid>
      )}

      {/* Next Steps + Objections (side by side like production) */}
      {((!isEmpty.nextSteps || !isEmpty.concerns) || showEmptyCards) && (
        <>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Stack gap={2}>
              {(!isEmpty.nextSteps || showEmptyCards) && (
                isEmpty.nextSteps ? (
                  <EmptyMessage message={EMPTY_STATE_MESSAGES.nextSteps} />
                ) : (
                  <NextStepsTimelineCard items={nextSteps.items} />
                )
              )}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 8 }}>
            {(!isEmpty.concerns || showEmptyCards) && (
              isEmpty.concerns ? (
                <EmptyMessage message={EMPTY_STATE_MESSAGES.concerns} />
              ) : (
                <ObjectionsCard items={objections.items} isExpandedByDefault />
              )
            )}
          </Grid>
        </>
      )}
    </Grid>
  );
};
