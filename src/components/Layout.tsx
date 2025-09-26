
import { ReactNode, useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import { Link, useLocation } from 'react-router-dom';

export default function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  const items = [
    { to: '/parties', icon: <PeopleIcon />, label: 'Parties' },
    { to: '/bookings', icon: <EventIcon />, label: 'Bookings' },
    { to: '/pipelines', icon: <ViewKanbanIcon />, label: 'Pipelines' },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100%' }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => setOpen(true)}><MenuIcon /></IconButton>
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 800 }}>TDF HQ</Typography>
        </Toolbar>
      </AppBar>
      <Toolbar />

      <Drawer open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 260 }} role="presentation" onClick={() => setOpen(false)}>
          <List>
            {items.map(it => (
              <ListItemButton key={it.to} component={Link} to={it.to} selected={loc.pathname.startsWith(it.to)}>
                <ListItemIcon>{it.icon}</ListItemIcon>
                <ListItemText primary={it.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
}
