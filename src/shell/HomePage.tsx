/**
 * Home Page — landing page showing all available test modules as cards.
 */
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { TestModule } from './ModuleRegistry';

interface HomePageProps {
  modules: TestModule[];
}

export function HomePage({ modules }: HomePageProps) {
  const visibleModules = modules.filter((m) => !m.hidden);

  return (
    <Stack gap={4}>
      {/* Header */}
      <Stack gap={1}>
        <Typography variant="h4" fontWeight={700}>
          A360 Web Testing Platform
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Production-mirror environment for testing card output, prompts, coaching, and more.
          Select a module to get started.
        </Typography>
      </Stack>

      {/* Module Cards */}
      <Grid container spacing={2}>
        {visibleModules.map((mod) => {
          const Icon = mod.icon;
          const firstRoute = mod.routes[0];
          const href = firstRoute?.path
            ? `${mod.basePath}/${firstRoute.path}`
            : mod.basePath;

          return (
            <Grid key={mod.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  height: 1,
                  transition: 'all 150ms',
                  '&:hover': { borderColor: 'primary.main', boxShadow: 2 },
                }}
              >
                <CardActionArea component={RouterLink} to={href} sx={{ height: 1 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack gap={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon sx={{ color: 'white', fontSize: 24 }} />
                      </Box>
                      <Stack gap={0.5}>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {mod.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {mod.description}
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.disabled">
                        {mod.routes.length} page{mod.routes.length !== 1 ? 's' : ''}
                      </Typography>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Footer hint */}
      <Typography variant="caption" color="text.disabled" textAlign="center">
        Modules connect to Prompt Runner at prompt-runner-production.up.railway.app
      </Typography>
    </Stack>
  );
}
