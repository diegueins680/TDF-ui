import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { useAuth } from '../auth/AuthProvider';

type LocationState = {
  from?: { pathname: string };
};

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as LocationState | undefined)?.from?.pathname ?? '/parties';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      await login(username.trim(), password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(message || 'Credenciales inválidas');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100', p: 2 }}>
      <Card sx={{ width: 360 }}>
        <CardContent>
          <Stack component="form" onSubmit={handleSubmit} spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={700}>Iniciar sesión</Typography>
              <Typography variant="body2" color="text.secondary">Usa tu cuenta de TDF HQ</Typography>
            </Box>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              disabled={isLoading}
              required
            />
            <TextField
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={isLoading}
              required
            />
            <Button type="submit" variant="contained" size="large" disabled={isLoading}>
              {isLoading ? 'Ingresando…' : 'Ingresar'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

