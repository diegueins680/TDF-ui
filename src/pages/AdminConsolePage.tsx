import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminApi } from '../api/admin';
import { Health } from '../utilities/health';
import type { AuditLogEntry } from '../api/types';

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export default function AdminConsolePage() {
  const qc = useQueryClient();
  const [rotationWarning, setRotationWarning] = useState(false);

  const healthQuery = useQuery({
    queryKey: ['admin', 'health'],
    queryFn: Health.fetch,
    staleTime: 30_000,
  });

  const auditQuery = useQuery({
    queryKey: ['admin', 'audit'],
    queryFn: AdminApi.auditLogs,
    staleTime: 10_000,
  });

  const seedMutation = useMutation({
    mutationFn: AdminApi.seed,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'audit'] });
    },
  });

  useEffect(() => {
    const handler = () => setRotationWarning(true);
    window.addEventListener('tdf-session-rotation-due', handler as EventListener);
    return () => {
      window.removeEventListener('tdf-session-rotation-due', handler as EventListener);
    };
  }, []);

  const audits = auditQuery.data ?? [];

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Consola de administración</Typography>

      {rotationWarning && (
        <Alert severity="warning" onClose={() => setRotationWarning(false)}>
          Tu sesión lleva 30 días activa. Genera un nuevo token o vuelve a autenticarte para mantener la seguridad.
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardHeader
              title="Estado del servicio"
              action={(
                <Button size="small" variant="text" startIcon={<RefreshIcon />} onClick={() => qc.invalidateQueries({ queryKey: ['admin', 'health'] })}>
                  Refrescar
                </Button>
              )}
            />
            <CardContent>
              <Typography variant="body2">API: {healthQuery.data?.status ?? '—'}</Typography>
              <Typography variant="body2">Base de datos: {healthQuery.data?.db ?? '—'}</Typography>
              {healthQuery.isError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {(healthQuery.error as Error).message}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardHeader title="Datos de demostración" />
            <CardContent>
              <Typography variant="body2">
                Ejecuta la siembra para restablecer datos de demo en ambientes de prueba.
              </Typography>
              <Button
                sx={{ mt: 2 }}
                variant="contained"
                startIcon={<AutoFixHighIcon />}
                onClick={() => seedMutation.mutate()}
                disabled={seedMutation.isPending}
              >
                {seedMutation.isPending ? 'Sembrando…' : 'Seed demo data'}
              </Button>
              {seedMutation.isSuccess && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Datos de demo regenerados correctamente.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardHeader title="Gestión de usuarios" />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                La asignación de roles se administra desde la pantalla de Parties. Próximamente aquí se podrá crear usuarios de servicio y tokens API.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper variant="outlined">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1 }}>
          <Typography variant="h6">Auditoría reciente</Typography>
          <Button startIcon={<RefreshIcon />} onClick={() => qc.invalidateQueries({ queryKey: ['admin', 'audit'] })}>
            Actualizar
          </Button>
        </Stack>
        {auditQuery.isError && (
          <Alert severity="error" sx={{ mx: 2 }}>
            {(auditQuery.error as Error).message}
          </Alert>
        )}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Entidad</TableCell>
                <TableCell>Acción</TableCell>
                <TableCell>Actor</TableCell>
                <TableCell>Detalle</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {audits.map((entry: AuditLogEntry, index: number) => (
                <TableRow key={`${entry.entity}-${entry.entityId}-${index}`}>
                  <TableCell>{formatDate(entry.createdAt)}</TableCell>
                  <TableCell>{entry.entity} · {entry.entityId}</TableCell>
                  <TableCell>{entry.action}</TableCell>
                  <TableCell>{entry.actorId ?? 'Sistema'}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320, whiteSpace: 'pre-wrap' }}>
                      {entry.diff ?? '—'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
              {audits.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography variant="body2" align="center" color="text.secondary" sx={{ py: 2 }}>
                      Sin eventos de auditoría todavía.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Stack>
  );
}
