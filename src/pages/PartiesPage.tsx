import React, { useMemo, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Parties } from '../api/parties';
import type { PartyDTO, PartyCreate, PartyUpdate, RoleKey } from '../api/types';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert, CircularProgress, Divider, Typography, Paper, Stack, TextField, Button, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, InputAdornment, Switch, FormControlLabel, Grid, FormControl,
  InputLabel, Select, MenuItem, Checkbox, ListItemText, FormHelperText, Tabs, Tab, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { ColumnDef, useReactTable, getCoreRowModel, getFilteredRowModel, flexRender } from '@tanstack/react-table';
import { Bookings } from '../api/bookings';
import { Invoices } from '../api/invoices';

console.log('PartiesPage — with multi-field edit dialog — loaded');

const roleValues = ['Admin','Manager','Engineer','Teacher','Reception','Accounting','Artist','Student','Vendor','ReadOnly','Customer'] as const;
const ROLE_OPTIONS: { value: RoleKey; label: string }[] = roleValues.map(value => ({ value, label: value }));

const createSchema = z.object({
  cDisplayName: z.string().min(2, 'Mínimo 2 caracteres'),
  cIsOrg: z.boolean().default(false),
  cLegalName: z.string().optional(),
  cTaxId: z.string().optional(),
  cPrimaryEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  cPrimaryPhone: z.string().optional(),
  cWhatsapp: z.string().optional(),
  cInstagram: z.string().optional(),
  cEmergencyContact: z.string().optional(),
  cNotes: z.string().optional(),
  cRoles: z.array(z.enum(roleValues)).default([])
});

type CreateForm = z.infer<typeof createSchema>;

function CreatePartyDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const { handleSubmit, register, control, formState: { errors }, reset } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      cDisplayName: '',
      cIsOrg: false,
      cLegalName: '',
      cTaxId: '',
      cPrimaryEmail: '',
      cPrimaryPhone: '',
      cWhatsapp: '',
      cInstagram: '',
      cEmergencyContact: '',
      cNotes: '',
      cRoles: [],
    }
  });

  const normalize = (val?: string | null) => {
    if (!val) return undefined;
    const trimmed = val.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  };

  const mutation = useMutation({
    mutationFn: (body: PartyCreate) => Parties.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parties'] });
      reset();
      onClose();
    }
  });

  const onSubmit = (values: CreateForm) => {
    const payload: PartyCreate = {
      cDisplayName: values.cDisplayName.trim(),
      cIsOrg: values.cIsOrg,
      cLegalName: normalize(values.cLegalName) ?? null,
      cTaxId: normalize(values.cTaxId) ?? null,
      cPrimaryEmail: normalize(values.cPrimaryEmail) ?? null,
      cPrimaryPhone: normalize(values.cPrimaryPhone) ?? null,
      cWhatsapp: normalize(values.cWhatsapp) ?? null,
      cInstagram: normalize(values.cInstagram) ?? null,
      cEmergencyContact: normalize(values.cEmergencyContact) ?? null,
      cNotes: normalize(values.cNotes) ?? null,
    };
    if (values.cRoles.length > 0) {
      payload.cRoles = values.cRoles;
    }
    mutation.mutate(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nueva persona</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={8}>
            <TextField
              label="Nombre / Display"
              fullWidth
              {...register('cDisplayName')}
              error={!!errors.cDisplayName}
              helperText={errors.cDisplayName?.message}
            />
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
            <Controller
              name="cIsOrg"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value}
                      onChange={(event) => field.onChange(event.target.checked)}
                      inputRef={field.ref}
                    />
                  }
                  label="¿Es organización?"
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}><TextField label="Razón social" fullWidth {...register('cLegalName')} /></Grid>
          <Grid item xs={12} md={6}><TextField label="RUC / CI" fullWidth {...register('cTaxId')} /></Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Email"
              fullWidth
              {...register('cPrimaryEmail')}
              error={!!errors.cPrimaryEmail}
              helperText={errors.cPrimaryEmail?.message}
            />
          </Grid>
          <Grid item xs={12} md={6}><TextField label="Teléfono" fullWidth {...register('cPrimaryPhone')} /></Grid>

          <Grid item xs={12} md={6}><TextField label="WhatsApp" fullWidth {...register('cWhatsapp')} /></Grid>
          <Grid item xs={12} md={6}><TextField label="Instagram" fullWidth {...register('cInstagram')} /></Grid>

          <Grid item xs={12}><TextField label="Contacto de emergencia" fullWidth {...register('cEmergencyContact')} /></Grid>

          <Grid item xs={12}>
            <TextField
              label="Notas"
              fullWidth
              multiline
              minRows={3}
              {...register('cNotes')}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="cRoles"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel id="roles-label">Roles iniciales</InputLabel>
                  <Select
                    labelId="roles-label"
                    multiple
                    label="Roles iniciales"
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value as RoleKey[])}
                    renderValue={(selected) => selected.join(', ')}
                  >
                    {ROLE_OPTIONS.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        <Checkbox checked={field.value.includes(option.value)} />
                        <ListItemText primary={option.label} />
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.cRoles && <FormHelperText error>{errors.cRoles.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={mutation.isPending}>
          {mutation.isPending ? 'Creando…' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function PartyDetailDialog({
  party, open, onClose
}: { party: PartyDTO | null; open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<'overview' | 'bookings' | 'packages' | 'invoices'>('overview');

  useEffect(() => {
    if (open) {
      setTab('overview');
    }
  }, [open, party?.partyId]);

  const partyId = party?.partyId ?? null;

  const bookingsQuery = useQuery({
    queryKey: ['party-bookings', partyId],
    queryFn: () => (partyId ? Bookings.listByParty(partyId) : Promise.resolve([])),
    enabled: open && tab === 'bookings' && !!partyId,
  });

  const invoicesQuery = useQuery({
    queryKey: ['party-invoices', partyId],
    queryFn: () => (partyId ? Invoices.listByParty(partyId) : Promise.resolve([])),
    enabled: open && tab === 'invoices' && !!partyId,
  });

  const formatDate = (value: string) => new Date(value).toLocaleString();
  const formatCurrency = (cents: number) => (cents / 100).toLocaleString('es-EC', { style: 'currency', currency: 'USD' });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{party?.displayName ?? 'Detalle'}</DialogTitle>
      <DialogContent dividers>
        <Tabs value={tab} onChange={(_event, value) => setTab(value)} sx={{ mb: 2 }}>
          <Tab label="Resumen" value="overview" />
          <Tab label="Bookings" value="bookings" />
          <Tab label="Paquetes" value="packages" />
          <Tab label="Facturas" value="invoices" />
        </Tabs>
        {tab === 'overview' && (
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label={party?.isOrg ? 'Organización' : 'Persona'} color={party?.isOrg ? 'primary' : 'default'} size="small" />
              <Typography variant="body2" color="text.secondary">ID #{party?.partyId}</Typography>
            </Stack>
            <Divider />
            <Stack spacing={0.5}>
              <Typography variant="subtitle1">Contacto</Typography>
              <Typography variant="body2">Correo: {party?.primaryEmail ?? '—'}</Typography>
              <Typography variant="body2">Teléfono: {party?.primaryPhone ?? '—'}</Typography>
              <Typography variant="body2">WhatsApp: {party?.whatsapp ?? '—'}</Typography>
              <Typography variant="body2">Instagram: {party?.instagram ?? '—'}</Typography>
            </Stack>
            <Stack spacing={0.5}>
              <Typography variant="subtitle1">Información adicional</Typography>
              <Typography variant="body2">Razón social: {party?.legalName ?? '—'}</Typography>
              <Typography variant="body2">RUC / CI: {party?.taxId ?? '—'}</Typography>
              <Typography variant="body2">Contacto de emergencia: {party?.emergencyContact ?? '—'}</Typography>
              <Typography variant="body2">Notas: {party?.notes ?? '—'}</Typography>
            </Stack>
          </Stack>
        )}
        {tab === 'bookings' && (
          <Stack spacing={2}>
            {bookingsQuery.isPending && <CircularProgress size={24} sx={{ alignSelf: 'center' }} />}
            {bookingsQuery.isError && (
              <Alert severity="error">{(bookingsQuery.error as Error).message}</Alert>
            )}
            {!bookingsQuery.isPending && !bookingsQuery.isError && (
              bookingsQuery.data && bookingsQuery.data.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Título</TableCell>
                        <TableCell>Inicio</TableCell>
                        <TableCell>Fin</TableCell>
                        <TableCell>Estado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bookingsQuery.data.map(booking => (
                        <TableRow key={booking.bookingId}>
                          <TableCell>{booking.title}</TableCell>
                          <TableCell>{formatDate(booking.startsAt)}</TableCell>
                          <TableCell>{formatDate(booking.endsAt)}</TableCell>
                          <TableCell>{booking.status}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No hay bookings asociados a este contacto todavía.
                </Typography>
              )
            )}
          </Stack>
        )}
        {tab === 'packages' && (
          <Typography variant="body2" color="text.secondary">
            El historial de paquetes estará disponible cuando el backend exponga `/packages/purchases` con filtros por cliente.
          </Typography>
        )}
        {tab === 'invoices' && (
          <Stack spacing={2}>
            {invoicesQuery.isPending && <CircularProgress size={24} sx={{ alignSelf: 'center' }} />}
            {invoicesQuery.isError && (
              <Alert severity="error">{(invoicesQuery.error as Error).message}</Alert>
            )}
            {!invoicesQuery.isPending && !invoicesQuery.isError && (
              invoicesQuery.data && invoicesQuery.data.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Número</TableCell>
                        <TableCell>Total</TableCell>
                        <TableCell>Estado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {invoicesQuery.data.map(invoice => (
                        <TableRow key={invoice.invId}>
                          <TableCell>{invoice.number ?? invoice.invId}</TableCell>
                          <TableCell>{formatCurrency(invoice.totalC)}</TableCell>
                          <TableCell>{invoice.statusI}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Aún no registramos facturas para este contacto.
                </Typography>
              )
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}

function EditPartyDialog({
  party, open, onClose
}: { party: PartyDTO | null; open: boolean; onClose: () => void }) {

  const qc = useQueryClient();

  // ----- Form & validación -----
  const editSchema = z.object({
    displayName: z.string().min(2, 'Mínimo 2 caracteres'),
    isOrg: z.boolean(),
    legalName: z.string().optional(),
    primaryEmail: z.string().email('Email inválido').optional().or(z.literal('')),
    primaryPhone: z.string().optional(),
    whatsapp: z.string().optional(),
    instagram: z.string().optional(),
    taxId: z.string().optional(),
    emergencyContact: z.string().optional(),
    notes: z.string().optional(),
  });

  type EditForm = z.infer<typeof editSchema>;

  const { control, register, handleSubmit, reset, formState: { errors } } = useForm<EditForm>({
  resolver: zodResolver(editSchema),
  defaultValues: {
    displayName: '',
    isOrg: false,
    legalName: '',
    primaryEmail: '',
    primaryPhone: '',
    whatsapp: '',
    instagram: '',
    taxId: '',
    emergencyContact: '',
    notes: '',
  },
});


  React.useEffect(() => {
    // Cuando cambia 'party', refresca los valores
    if (party) {
      reset({
        displayName: party.displayName,
        isOrg: party.isOrg,
        legalName: party.legalName ?? '',
        primaryEmail: party.primaryEmail ?? '',
        primaryPhone: party.primaryPhone ?? '',
        whatsapp: party.whatsapp ?? '',
        instagram: party.instagram ?? '',
        taxId: party.taxId ?? '',
        emergencyContact: party.emergencyContact ?? '',
        notes: party.notes ?? '',
      });
    }
  }, [party, reset]);

  // Convierte '' -> null para campos opcionales
  const n = (s?: string) => (s && s.trim() !== '' ? s.trim() : null);

  // Construye payload con SOLO cambios
  const buildUpdate = (orig: PartyDTO, v: EditForm): PartyUpdate => {
    const out: PartyUpdate = {};
    if (v.displayName !== orig.displayName) out.uDisplayName = v.displayName.trim();
    if (v.isOrg !== orig.isOrg)           out.uIsOrg = v.isOrg;

    if (n(v.legalName)        !== (orig.legalName ?? null))        out.uLegalName = n(v.legalName);
    if (n(v.primaryEmail)     !== (orig.primaryEmail ?? null))     out.uPrimaryEmail = n(v.primaryEmail);
    if (n(v.primaryPhone)     !== (orig.primaryPhone ?? null))     out.uPrimaryPhone = n(v.primaryPhone);
    if (n(v.whatsapp)         !== (orig.whatsapp ?? null))         out.uWhatsapp = n(v.whatsapp);
    if (n(v.instagram)        !== (orig.instagram ?? null))        out.uInstagram = n(v.instagram);
    if (n(v.taxId)            !== (orig.taxId ?? null))            out.uTaxId = n(v.taxId);
    if (n(v.emergencyContact) !== (orig.emergencyContact ?? null)) out.uEmergencyContact = n(v.emergencyContact);
    if (n(v.notes)            !== (orig.notes ?? null))            out.uNotes = n(v.notes);
    return out;
  };

  const m = useMutation({
    mutationFn: (body: PartyUpdate) => Parties.update(party!.partyId, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['parties'] }); onClose(); }
  });

  const onSubmit = (vals: EditForm) => {
    if (!party) return;
    const payload = buildUpdate(party, vals);
    // Si el usuario no cambió nada, no peguemos PUT vacío
    if (Object.keys(payload).length === 0) { onClose(); return; }
    m.mutate(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar {party?.displayName}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={8}>
            <TextField
              label="Nombre / Display"
              fullWidth
              {...register('displayName')}
              error={!!errors.displayName}
              helperText={errors.displayName?.message}
            />
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
          <Controller
            name="isOrg"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    inputRef={field.ref}
                  />
                }
                label="¿Es organización?"
              />
            )}
          />

          </Grid>

          <Grid item xs={12} md={6}><TextField label="Razón social" fullWidth {...register('legalName')} /></Grid>
          <Grid item xs={12} md={6}><TextField label="RUC / CI" fullWidth {...register('taxId')} /></Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Email"
              fullWidth
              {...register('primaryEmail')}
              error={!!errors.primaryEmail}
              helperText={errors.primaryEmail?.message}
            />
          </Grid>
          <Grid item xs={12} md={6}><TextField label="Teléfono" fullWidth {...register('primaryPhone')} /></Grid>

          <Grid item xs={12} md={6}><TextField label="WhatsApp" fullWidth {...register('whatsapp')} /></Grid>
          <Grid item xs={12} md={6}><TextField label="Instagram" fullWidth {...register('instagram')} /></Grid>

          <Grid item xs={12}><TextField label="Contacto de emergencia" fullWidth {...register('emergencyContact')} /></Grid>

          <Grid item xs={12}>
            <TextField
              label="Notas"
              fullWidth
              multiline
              minRows={3}
              {...register('notes')}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={m.isPending}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function PartiesPage() {
  const { data = [], isLoading, error } = useQuery({ queryKey: ['parties'], queryFn: Parties.list });
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<PartyDTO | null>(null);
  const [detail, setDetail] = useState<PartyDTO | null>(null);
  const [search, setSearch] = useState('');

  const columns = useMemo<ColumnDef<PartyDTO>[]>(() => [
    { header: 'Nombre', accessorKey: 'displayName' },
    { header: 'Org', cell: ({ row }) => row.original.isOrg ? 'Sí' : 'No' },
    { header: 'Email', accessorKey: 'primaryEmail' },
    { header: 'Instagram', accessorKey: 'instagram' },
    {
      header: 'Acciones', cell: ({ row }) => (
        <IconButton
          onClick={(event) => {
            event.stopPropagation();
            setEditing(row.original);
          }}
        >
          <EditIcon />
        </IconButton>
      )
    }
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter: search },
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const v = (filterValue || '').toString().toLowerCase();
      return Object.values(row.original).join(' ').toLowerCase().includes(v);
    },
  });

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Personas / CRM</Typography>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>Nueva Persona</Button>
      </Stack>

      <TextField
        placeholder="Buscar…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        size="small"
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
        sx={{ mb: 1 }}
      />

      <Paper variant="outlined">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {table.getHeaderGroups().map(hg => hg.headers.map(h => (
                  <TableCell key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableCell>
                )))}
              </TableRow>
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.map(r => (
                <TableRow key={r.id} hover onClick={() => setDetail(r.original)} sx={{ cursor: 'pointer' }}>
                  {r.getVisibleCells().map(c => (
                    <TableCell key={c.id}>{flexRender(c.column.columnDef.cell, c.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {isLoading && <Typography sx={{ p: 2 }}>Cargando…</Typography>}
        {error && <Typography color="error" sx={{ p: 2 }}>{(error as Error).message}</Typography>}
      </Paper>

      <CreatePartyDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      {editing && (
        <EditPartyDialog
          key={editing.partyId}    // (optional) forces a clean mount per record
          party={editing}
          open
          onClose={() => setEditing(null)}
        />
      )}
      {detail && (
        <PartyDetailDialog party={detail} open onClose={() => setDetail(null)} />
      )}
    </>
  );
}
