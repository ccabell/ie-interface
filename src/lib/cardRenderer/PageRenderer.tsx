/**
 * PageRenderer — Generic component that renders PageLayout JSON
 *
 * This component NEVER changes — all the logic is in the mapper and registry.
 * It simply walks the PageLayout structure and renders cards.
 *
 * Usage:
 *   const layout = mapAIOutputToPageLayout(aiOutput);
 *   <PageRenderer layout={layout} />
 */
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';

import type { LayoutCell, LayoutSection, PageLayout } from './types';
import { CARD_REGISTRY } from './registry';

/* ────────────────────────────────────────────────────────────────────────────
 * CELL RENDERER — Renders a single card
 * ──────────────────────────────────────────────────────────────────────────── */

interface CellRendererProps {
  cell: LayoutCell;
}

const CellRenderer: React.FC<CellRendererProps> = ({ cell }) => {
  const Component = CARD_REGISTRY[cell.cardType];

  if (!Component) {
    // Unknown card type — show debug warning in development
    if (process.env.NODE_ENV === 'development') {
      return (
        <Grid size={cell.grid}>
          <Alert severity="warning" sx={{ height: '100%' }}>
            Unknown cardType: "{cell.cardType}"
          </Alert>
        </Grid>
      );
    }
    return null;
  }

  // Handle list mode: if props has __items array, render one card per item
  if (Array.isArray(cell.props.__items)) {
    return (
      <>
        {(cell.props.__items as Record<string, unknown>[]).map((item, i) => (
          <Grid key={`${cell.id}-${i}`} size={cell.grid}>
            <Component {...item} />
          </Grid>
        ))}
      </>
    );
  }

  // Standard mode: render single card
  return (
    <Grid size={cell.grid}>
      <Component {...cell.props} />
    </Grid>
  );
};

/* ────────────────────────────────────────────────────────────────────────────
 * SECTION RENDERER — Renders a section with optional title
 * ──────────────────────────────────────────────────────────────────────────── */

interface SectionRendererProps {
  section: LayoutSection;
  spacing?: number;
}

const SectionRenderer: React.FC<SectionRendererProps> = ({
  section,
  spacing = 2,
}) => {
  if (section.cells.length === 0) {
    return null;
  }

  return (
    <Stack gap={1.5}>
      {section.title && (
        <Typography variant="subtitle1" fontWeight={600}>
          {section.title}
        </Typography>
      )}
      <Grid container spacing={spacing}>
        {section.cells.map((cell) => (
          <CellRenderer key={cell.id} cell={cell} />
        ))}
      </Grid>
    </Stack>
  );
};

/* ────────────────────────────────────────────────────────────────────────────
 * PAGE RENDERER — Main component
 * ──────────────────────────────────────────────────────────────────────────── */

interface PageRendererProps {
  layout: PageLayout;
  showMetadata?: boolean;
}

export const PageRenderer: React.FC<PageRendererProps> = ({
  layout,
  showMetadata = false,
}) => {
  const hasContent = layout.sections.some((s) => s.cells.length > 0);

  if (!hasContent) {
    return (
      <Stack alignItems="center" justifyContent="center" py={4}>
        <Typography variant="body1" color="text.secondary">
          No cards to display. Check that your JSON has valid cardType and props.
        </Typography>
      </Stack>
    );
  }

  return (
    <Box>
      <Stack gap={3}>
        {layout.sections.map((section) => (
          <SectionRenderer
            key={section.id}
            section={section}
            spacing={layout.spacing}
          />
        ))}
      </Stack>

      {showMetadata && layout.metadata && (
        <Box mt={3} pt={2} sx={{ borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            Layout v{layout.metadata.version} • Generated{' '}
            {layout.metadata.generatedAt}
            {layout.metadata.promptSetId &&
              ` • Prompt Set: ${layout.metadata.promptSetId}`}
            {layout.metadata.transcriptId &&
              ` • Transcript: ${layout.metadata.transcriptId}`}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

/* ────────────────────────────────────────────────────────────────────────────
 * CONVENIENCE: Render from JSON string
 * ──────────────────────────────────────────────────────────────────────────── */

interface JSONRendererProps {
  json: string;
  showMetadata?: boolean;
  onError?: (error: string) => void;
}

export const JSONRenderer: React.FC<JSONRendererProps> = ({
  json,
  showMetadata = false,
  onError,
}) => {
  try {
    const parsed = JSON.parse(json);

    // Import mapper inline to avoid circular dependency
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { mapAIOutputToPageLayout } = require('./mapper');
    const layout = mapAIOutputToPageLayout(parsed);

    return <PageRenderer layout={layout} showMetadata={showMetadata} />;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    onError?.(message);
    return (
      <Alert severity="error">
        Failed to render JSON: {message}
      </Alert>
    );
  }
};
