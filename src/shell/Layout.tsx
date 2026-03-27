/**
 * Shell Layout — main app layout with module-aware navigation.
 * Reads registered modules and generates nav groups automatically.
 */
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import type { TestModule } from './ModuleRegistry';
import { ErrorBoundary } from './ErrorBoundary';

interface LayoutProps {
  modules: TestModule[];
}

export function Layout({ modules }: LayoutProps) {
  const location = useLocation();
  const visibleModules = modules.filter((m) => !m.hidden);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AppBar position="sticky">
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ gap: 1 }}>
            {/* Logo */}
            <Box
              component={RouterLink}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit',
                mr: 3,
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  background: 'linear-gradient(135deg, #547BA3 0%, #324A68 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1.5,
                }}
              >
                <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 12 }}>A360</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.2 }}>
                  Web Testing Platform
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10 }}>
                  Production Mirror
                </Typography>
              </Box>
            </Box>

            {/* Home */}
            <Button
              component={RouterLink}
              to="/"
              startIcon={<HomeIcon sx={{ fontSize: 16 }} />}
              sx={{
                color: location.pathname === '/' ? 'primary.main' : 'text.secondary',
                bgcolor: location.pathname === '/' ? 'action.selected' : 'transparent',
                fontWeight: location.pathname === '/' ? 600 : 500,
                px: 1.5,
                py: 0.75,
                borderRadius: 1.5,
                fontSize: 13,
                minWidth: 'auto',
              }}
            >
              Home
            </Button>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            {/* Module Nav */}
            <Box sx={{ display: 'flex', gap: 0.25, flex: 1, overflow: 'auto' }}>
              {visibleModules.map((mod) => {
                const Icon = mod.icon;
                const isModuleActive = location.pathname.startsWith(mod.basePath);

                return mod.routes.map((route) => {
                  const fullPath = route.path
                    ? `${mod.basePath}/${route.path}`
                    : mod.basePath;
                  const isActive = location.pathname === fullPath;

                  return (
                    <Button
                      key={fullPath}
                      component={RouterLink}
                      to={fullPath}
                      startIcon={<Icon sx={{ fontSize: 16 }} />}
                      sx={{
                        color: isActive ? 'primary.main' : isModuleActive ? 'text.primary' : 'text.secondary',
                        bgcolor: isActive ? 'action.selected' : 'transparent',
                        fontWeight: isActive ? 600 : 500,
                        px: 1.5,
                        py: 0.75,
                        borderRadius: 1.5,
                        fontSize: 13,
                        whiteSpace: 'nowrap',
                        '&:hover': {
                          bgcolor: isActive ? 'action.selected' : 'action.hover',
                        },
                      }}
                    >
                      {route.label}
                    </Button>
                  );
                });
              })}
            </Box>

            {/* Version */}
            <Stack direction="row" alignItems="center" gap={1}>
              <Typography variant="caption" color="text.secondary">
                v0.2.0
              </Typography>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" sx={{ flex: 1, py: 3 }}>
        <Container maxWidth="xl">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </Container>
      </Box>

      <Box
        component="footer"
        sx={{ py: 2, px: 3, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
      >
        <Container maxWidth="xl">
          <Typography variant="caption" color="text.secondary">
            A360 Web Testing Platform · Mirrors production card system · Connected to Prompt Runner
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
