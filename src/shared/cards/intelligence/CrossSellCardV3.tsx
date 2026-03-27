/**
 * CrossSellCardV3 — ported from a360-web-app production Intelligence tab.
 * Score-based accordion for cross-sell/upsell effort.
 */
import { ValueAccordionCard } from '../base/ValueAccordionCard';

type CrossSellCardV3Props = {
  score: number;
  description: string;
};

export const CrossSellCardV3: React.FC<CrossSellCardV3Props> = ({ score, description }) => (
  <ValueAccordionCard title="Cross-sell / upsell effort" value={score} hasToggleIcon isExpandedByDefault>
    {description}
  </ValueAccordionCard>
);
