import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Sessions } from '../api/sessions';
import { Rooms } from '../api/rooms';
import type { Page, RoomDTO, SessionDTO, SessionCreate, SessionUpdate } from '../api/types';

const STATUS_OPTIONS: Array<{ value: string; label: string; color: 'default' | 'success' | 'warning' | 'info' | 'error' }> = [
  { value: 'InPrep', label: 'En preparación', color: 'info' },
  { value: 'InSession', label: 'En sesión', color: 'success' },
  { value: 'Break', label: 'Break', color: 'warning' },
  { value: 'Editing', label: 'Edición', color: 'default' },
  { value: 'Approved', label: 'Aprobada', color: 'success' },
  { value: 'Delivered', label: 'Entregada', color: 'success' },
  { value: 'Closed', label: 'Cerrada', color: 'default' },
];

const sessionSchema = z.object({
  scBookingRef: z.string().optional(),
  scStartAt: z.string().min(1, 'Requerido'),
  scEndAt: z.string().min(1, 'Requerido'),
  scEngineerRef: z.string().min(2, 'Ingresa un ingeniero'),
  scRoomIds: z.array(z.string()).min(1, 'Selecciona al menos una sala'),
});

type SessionFormValues = z.infer<typeof sessionSchema>;

function formatDateRange(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return `${startDate.toLocaleString()} → ${endDate.toLocaleTimeString()}`;
}

function CreateSessionDialog({ open, onClose, rooms }: { open: boolean; onClose: () => void; rooms: RoomDTO[] }) {
  const qc = useQueryClient();
  const { handleSubmit, control, reset, formState: { errors } } = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      scBookingRef: '',
      scStartAt: new Date().toISOString().slice(0, 16),
      scEndAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16),
      scEngineerRef: '',
      scRoomIds: [],
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: SessionCreate) => Sessions.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      onClose();
      reset();
    },
  });

  const submit = (values: SessionFormValues) => {
    const payload: SessionCreate = {
      scBookingRef: values.scBookingRef?.trim() || undefined,
      scStartAt: new Date(values.scStartAt).toISOString(),
      scEndAt: new Date(values.scEndAt).toISOString(),
      scEngineerRef: values.scEngineerRef.trim(),
      scRoomIds: values.scRoomIds,
    };
    createMutation.mutate(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nueva sesión</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Controller
            name="scBookingRef"
            control={control}
            render={({ field }) => (
              <TextField
                label="Referencia de booking (opcional)"
                {...field}
                placeholder="BK-2025-001"
              />
            )}
          />
          <Controller
            name="scStartAt"
            control={control}
            render={({ field }) => (
              <TextField
                label="Inicio"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                error={!!errors.scStartAt}
                helperText={errors.scStartAt?.message}
                {...field}
              />
            )}
          />
          <Controller
            name="scEndAt"
            control={control}
            render={({ field }) => (
              <TextField
                label="Fin"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                error={!!errors.scEndAt}
                helperText={errors.scEndAt?.message}
                {...field}
              />
            )}
          />
          <Controller
            name="scEngineerRef"
            control={control}
            render={({ field }) => (
              <TextField
                label="Ingeniero principal"
                placeholder="usuario@tdf"
                error={!!errors.scEngineerRef}
                helperText={errors.scEngineerRef?.message}
                {...field}
              />
            )}
          />
          <Controller
            name="scRoomIds"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel id="rooms-label">Salas asignadas</InputLabel>
                <Select
                  {...field}
                  labelId="rooms-label"
                  label="Salas asignadas"
                  multiple
                  renderValue={(vals) => vals.map(id => rooms.find(r => r.roomId === id)?.rName ?? id).join(', ')}
                >
                  {rooms.map(room => (
                    <MenuItem key={room.roomId} value={room.roomId}>
                      {room.rName}
                    </MenuItem>
                  ))}
                </Select>
                {errors.scRoomIds && <Typography color="error" variant="caption">{errors.scRoomIds.message}</Typography>}
              </FormControl>
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit(submit)} disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Creando…' : 'Crear sesión'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function StatusChip({ value }: { value: string }) {
  const option = STATUS_OPTIONS.find(opt => opt.value === value);
  return (
    <Chip
      size="small"
      label={option?.label ?? value}
      color={option?.color ?? 'default'}
      sx={{ fontWeight: 600 }}
    />
  );
}

function UpdateStatusMenu({ id, onClose }: { id: string; onClose: () => void }) {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (body: SessionUpdate) => Sessions.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      onClose();
    },
  });

  return (
    <Stack spacing={1} sx={{ p: 1, minWidth: 200 }}>
      {STATUS_OPTIONS.map(option => (
        <Button
          key={option.value}
          variant="outlined"
          size="small"
          onClick={() => mutation.mutate({ suStatus: option.value })}
          disabled={mutation.isPending}
        >
          {option.label}
        </Button>
      ))}
    </Stack>
  );
}

export default function SessionsPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [createOpen, setCreateOpen] = useState(false);
  const [statusPicker, setStatusPicker] = useState<string | null>(null);

  const roomsQuery = useQuery({ queryKey: ['rooms', 'for-sessions'], queryFn: Rooms.list });
  const sessionsQuery = useQuery<Page<SessionDTO>>({
    queryKey: ['sessions', page, pageSize],
    queryFn: () => Sessions.list({ page: page + 1, pageSize }),
  });

  const sessions = sessionsQuery.data ?? { items: [], page: 1, pageSize, total: 0 };
  const rows: SessionDTO[] = sessions.items;

  const rooms = roomsQuery.data ?? [];

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h5">Sesiones</Typography>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>Nueva sesión</Button>
      </Stack>
      <Paper variant="outlined">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Horario</TableCell>
                <TableCell>Referencia</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell width={130}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(session => (
                <TableRow key={session.sessionId} hover>
                  <TableCell>{formatDateRange(session.sStartAt, session.sEndAt)}</TableCell>
                  <TableCell>{(session as any).bookingRef ?? '—'}</TableCell>
                  <TableCell><StatusChip value={session.sStatus} /></TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" onClick={() => setStatusPicker(session.sessionId)}>Cambiar estado</Button>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                      No hay sesiones registradas todavía.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={sessions.total}
          page={page}
          onPageChange={(_event, value) => setPage(value)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(event) => {
            setPageSize(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Paper>

      <CreateSessionDialog open={createOpen} onClose={() => setCreateOpen(false)} rooms={rooms} />

      <Dialog open={!!statusPicker} onClose={() => setStatusPicker(null)}>
        <DialogTitle>Actualizar estado</DialogTitle>
        <DialogContent>
          {statusPicker && <UpdateStatusMenu id={statusPicker} onClose={() => setStatusPicker(null)} />}
        </DialogContent>
      </Dialog>
    </Stack>
  );
}
