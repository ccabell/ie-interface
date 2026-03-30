# Card Catalog — Config-Driven Card Renderer

## The Pattern

```
AI Output → { cardType, props } → Mapper → Renderer → UI
```

**AI outputs this:**
```json
{ "cardType": "statistic", "props": { "label": "Duration", "value": "45 min" } }
```

**Renderer does this:**
```tsx
const Component = CARD_REGISTRY[cardType];  // Look up component
<Component {...props} />                     // Spread props
```

**No manual wiring.** Add a cardType to registry → any AI output using it works.

---

## Card Types & Props

### `statistic`
Single metric display.

```json
{
  "cardType": "statistic",
  "props": {
    "label": "string (required)",
    "value": "string (required)",
    "tooltip": "string (optional)"
  }
}
```

**Example:**
```json
{ "cardType": "statistic", "props": { "label": "Duration", "value": "45 min" } }
{ "cardType": "statistic", "props": { "label": "Score", "value": "87%", "tooltip": "Based on 5 factors" } }
```

---

### `summary`
Text block with optional title.

```json
{
  "cardType": "summary",
  "props": {
    "title": "string (optional)",
    "description": "string (required)"
  }
}
```

**Example:**
```json
{ "cardType": "summary", "props": { "title": "Overview", "description": "Patient presented for consultation..." } }
```

---

### `valueAccordion`
Percentage value with progress bar.

```json
{
  "cardType": "valueAccordion",
  "props": {
    "title": "string (required)",
    "value": "number 0-100 (required)",
    "tooltipText": "string (optional)"
  }
}
```

**Example:**
```json
{ "cardType": "valueAccordion", "props": { "title": "Confidence Score", "value": 85 } }
```

---

### `evidence`
Quote/snippet with score badge.

```json
{
  "cardType": "evidence",
  "props": {
    "title": "string (required)",
    "score": "number 0-100 (required)",
    "snippet": "string (required)"
  }
}
```

**Example:**
```json
{ "cardType": "evidence", "props": { "title": "Key Quote", "score": 92, "snippet": "I'm very interested in this option." } }
```

---

### `list`
Bullet, numbered, or check list.

```json
{
  "cardType": "list",
  "props": {
    "title": "string (optional)",
    "items": ["string array (required)"],
    "variant": "'bullet' | 'numbered' | 'check' (optional, default: bullet)"
  }
}
```

**Example:**
```json
{ "cardType": "list", "props": { "title": "Key Points", "items": ["Point one", "Point two"], "variant": "check" } }
```

---

### `keyValue`
Key-value pairs table.

```json
{
  "cardType": "keyValue",
  "props": {
    "title": "string (optional)",
    "items": [{ "key": "string", "value": "string" }]
  }
}
```

**Example:**
```json
{ "cardType": "keyValue", "props": { "title": "Details", "items": [{ "key": "Type", "value": "Initial" }, { "key": "Duration", "value": "30m" }] } }
```

---

### `chips`
Tag cloud / chip group.

```json
{
  "cardType": "chips",
  "props": {
    "title": "string (optional)",
    "chips": ["string array (required)"],
    "color": "'primary' | 'success' | 'warning' | 'error' | 'default' (optional)"
  }
}
```

**Example:**
```json
{ "cardType": "chips", "props": { "title": "Tags", "chips": ["Tag A", "Tag B", "Tag C"], "color": "primary" } }
```

---

### `chipGroup`
Multiple groups of chips with labels.

```json
{
  "cardType": "chipGroup",
  "props": {
    "title": "string (optional)",
    "groups": [
      { "label": "string", "chips": ["string array"], "color": "string (optional)" }
    ]
  }
}
```

**Example:**
```json
{
  "cardType": "chipGroup",
  "props": {
    "title": "Categories",
    "groups": [
      { "label": "Primary", "chips": ["Item A", "Item B"], "color": "primary" },
      { "label": "Secondary", "chips": ["Item C"], "color": "default" }
    ]
  }
}
```

---

### `timeline`
Sequential events.

```json
{
  "cardType": "timeline",
  "props": {
    "title": "string (optional)",
    "events": [
      {
        "title": "string (required)",
        "description": "string (optional)",
        "timestamp": "string (optional)",
        "status": "'completed' | 'current' | 'pending' (optional)"
      }
    ]
  }
}
```

**Example:**
```json
{
  "cardType": "timeline",
  "props": {
    "title": "Process",
    "events": [
      { "title": "Step 1", "status": "completed" },
      { "title": "Step 2", "status": "current" },
      { "title": "Step 3", "status": "pending" }
    ]
  }
}
```

---

### `itemList`
Structured items with status/tags.

```json
{
  "cardType": "itemList",
  "props": {
    "title": "string (optional)",
    "items": [
      {
        "title": "string (required)",
        "subtitle": "string (optional)",
        "snippet": "string (optional)",
        "tags": ["string array (optional)"],
        "status": { "label": "string", "color": "string (optional)" }
      }
    ]
  }
}
```

**Example:**
```json
{
  "cardType": "itemList",
  "props": {
    "title": "Items",
    "items": [
      { "title": "Item A", "status": { "label": "Active", "color": "success" } },
      { "title": "Item B", "subtitle": "Description", "status": { "label": "Pending", "color": "warning" } }
    ]
  }
}
```

---

## Full PageLayout Structure

```json
{
  "sections": [
    {
      "id": "section-1",
      "title": "Section Title (optional)",
      "fields": [
        { "cardType": "statistic", "props": { "label": "...", "value": "..." } },
        { "cardType": "summary", "grid": { "xs": 12, "md": 8 }, "props": { "description": "..." } }
      ]
    }
  ]
}
```

### Grid Breakpoints (optional per field)
```json
"grid": { "xs": 12, "sm": 6, "md": 4 }
```
- `xs`: 0px+ (mobile)
- `sm`: 600px+
- `md`: 900px+
- `lg`: 1200px+

Default grids are applied per cardType if not specified.

---

## Adding a New Card Type

1. **Define props interface** in `types.ts`
2. **Create component** in `cards/`
3. **Add to registry** in `registry.tsx`
4. **Add mapper case** in `mapper.ts` (validates props)

The **renderer never changes** — it just looks up cardType and spreads props.

---

## Prompt Design

Tell the AI what cards are available:

```
You have these card types:
- "statistic": { label: string, value: string }
- "summary": { title?: string, description: string }
- "valueAccordion": { title: string, value: number 0-100 }
- "list": { title?: string, items: string[], variant?: "bullet"|"check" }
- "chips": { title?: string, chips: string[], color?: string }
- "keyValue": { title?: string, items: [{ key, value }] }
- "itemList": { title?: string, items: [{ title, status?, snippet? }] }

Output structure:
{
  "sections": [
    { "id": "...", "title": "...", "fields": [{ "cardType": "...", "props": {...} }] }
  ]
}
```

The closer AI output matches card props, the simpler the mapper.
