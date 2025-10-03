
import { useMemo, useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box, Button, Stack } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

type ModuleKey = 'CRM' | 'Scheduling' | 'Packages' | 'Invoicing' | 'Admin';

export default function Layout() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const { user, logout } = useAuth();

  const items = useMemo(() => ([
    { to: '/parties', icon: <PeopleIcon />, label: 'Parties', module: 'CRM' as ModuleKey },
    { to: '/bookings', icon: <EventIcon />, label: 'Bookings', module: 'Scheduling' as ModuleKey },
    { to: '/pipelines', icon: <ViewKanbanIcon />, label: 'Pipelines', module: 'Packages' as ModuleKey },
  ]), []);

  const allowed = new Set(user?.modules ?? []);
  const visibleItems = items.filter(item => !item.module || allowed.has(item.module));

  return (
    <Box sx={{ display: 'flex', minHeight: '100%' }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => setOpen(true)}><MenuIcon /></IconButton>
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 800 }}>TDF HQ</Typography>
          <Box sx={{ flexGrow: 1 }} />
          {user && (
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {user.username}
              </Typography>
              <Button color="inherit" onClick={logout} startIcon={<LogoutIcon />}>
                Salir
              </Button>
            </Stack>
          )}
        </Toolbar>
      </AppBar>
      <Toolbar />

      <Drawer open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 260 }} role="presentation" onClick={() => setOpen(false)}>
          <List>
            {visibleItems.map(it => (
              <ListItemButton key={it.to} component={Link} to={it.to} selected={loc.pathname.startsWith(it.to)}>
                <ListItemIcon>{it.icon}</ListItemIcon>
                <ListItemText primary={it.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
