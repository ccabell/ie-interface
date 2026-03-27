import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { opportunitiesApi } from '@/shared/api';
import type { Opportunity } from '@/shared/api/types';
import { runDetailPath } from '@/shared/constants/routes';
import { useNavigate } from 'react-router-dom';

const STAGES: Opportunity['stage'][] = ['New', 'In progress', 'Won', 'Lost'];

function DraggableCard({
  opportunity,
  onMove,
  isDragOverlay,
}: {
  opportunity: Opportunity;
  onMove: (stage: Opportunity['stage']) => void;
  isDragOverlay?: boolean;
}) {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: opportunity.id,
    data: { opportunity },
  });

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (isDragOverlay) return;
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <Card
        ref={setNodeRef}
        variant="outlined"
        sx={{
          mb: 1,
          cursor: isDragOverlay ? 'grabbing' : 'grab',
          opacity: isDragging && !isDragOverlay ? 0.5 : 1,
          '&:active': { cursor: 'grabbing' },
        }}
        onClick={handleClick}
        {...(!isDragOverlay ? { ...listeners, ...attributes } : {})}
      >
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Typography variant="subtitle2">
            {opportunity.title ?? opportunity.product_or_service ?? `Opportunity ${(opportunity.item_index ?? 0) + 1}`}
          </Typography>
          {(opportunity.blurb ?? opportunity.description) && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
              {opportunity.blurb ?? opportunity.description}
            </Typography>
          )}
          {opportunity.value != null && opportunity.value > 0 && (
            <Typography variant="caption" color="text.secondary" display="block">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(opportunity.value)}
            </Typography>
          )}
          <Typography
            variant="caption"
            component={Box}
            sx={{ color: 'primary.main', cursor: 'pointer', mt: 0.5, display: 'block' }}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              navigate(runDetailPath(opportunity.run_id));
            }}
          >
            Run {opportunity.run_id.slice(0, 8)}…
          </Typography>
        </CardContent>
      </Card>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {STAGES.filter((s) => s !== opportunity.stage).map((stage) => (
          <MenuItem
            key={stage}
            onClick={() => {
              onMove(stage);
              handleClose();
            }}
          >
            <ListItemIcon />
            Move to {stage}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

function DroppableColumn({
  stage,
  opportunities,
  onMove,
}: {
  stage: Opportunity['stage'];
  opportunities: Opportunity[];
  onMove: (id: string, stage: Opportunity['stage']) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage, data: { stage } });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        minWidth: 280,
        flexShrink: 0,
        p: 1.5,
        borderRadius: 1,
        bgcolor: isOver ? 'action.hover' : 'transparent',
        transition: 'background-color 0.15s',
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        {stage}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {opportunities.map((opp) => (
          <DraggableCard
            key={opp.id}
            opportunity={opp}
            onMove={(newStage) => onMove(opp.id, newStage)}
          />
        ))}
      </Box>
    </Box>
  );
}

export function OpportunitiesBoard() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    opportunitiesApi
      .list()
      .then((data) => {
        setOpportunities(Array.isArray(data) ? data : (data as unknown as { data?: Opportunity[] })?.data ?? []);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleMove = (id: string, stage: Opportunity['stage']) => {
    opportunitiesApi
      .updateStage(id, stage)
      .then(() => {
        setOpportunities((prev) =>
          prev.map((o) => (o.id === id ? { ...o, stage } : o))
        );
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, color: 'error.main' }}>
        <Typography>Failed to load opportunities: {error}</Typography>
        <Button onClick={load} sx={{ mt: 1 }}>Retry</Button>
      </Box>
    );
  }

  const byStage = STAGES.reduce<Record<string, Opportunity[]>>((acc, s) => {
    acc[s] = opportunities.filter((o) => o.stage === s);
    return acc;
  }, {});

  const activeOpp = activeId ? opportunities.find((o) => o.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => setActiveId(String(event.active.id));
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const overId = event.over?.id;
    const dragId = event.active.id;
    if (!overId || typeof dragId !== 'string') return;
    const newStage = STAGES.includes(overId as Opportunity['stage']) ? (overId as Opportunity['stage']) : null;
    if (newStage) handleMove(dragId, newStage);
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Box>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Opportunities board
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
          {STAGES.map((stage) => (
            <DroppableColumn
              key={stage}
              stage={stage}
              opportunities={byStage[stage] ?? []}
              onMove={handleMove}
            />
          ))}
        </Box>
      </Box>
      <DragOverlay>
        {activeOpp ? (
          <Card variant="outlined" sx={{ minWidth: 260, boxShadow: 2 }}>
            <CardContent sx={{ py: 1.5 }}>
              <Typography variant="subtitle2">
                {activeOpp.title ?? activeOpp.product_or_service ?? `Opportunity ${(activeOpp.item_index ?? 0) + 1}`}
              </Typography>
              {activeOpp.description && (
                <Typography variant="caption" color="text.secondary" display="block" noWrap>
                  {activeOpp.description}
                </Typography>
              )}
            </CardContent>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
