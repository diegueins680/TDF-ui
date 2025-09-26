
import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Parties } from '../api/parties';
import type { PartyDTO, PartyCreate, PartyUpdate } from '../api/types';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Typography, Paper, Stack, TextField, Button, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, InputAdornment
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { ColumnDef, useReactTable, getCoreRowModel, getFilteredRowModel, flexRender } from '@tanstack/react-table';

const createSchema = z.object({
  cDisplayName: z.string().min(2, 'Mínimo 2 caracteres'),
  cIsOrg: z.boolean().default(false),
  cPrimaryEmail: z.string().email('Email inválido').optional().or(z.literal('')),
});

function CreatePartyDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const { handleSubmit, register, formState: { errors }, reset } = useForm<PartyCreate>({
    resolver: zodResolver(createSchema),
    defaultValues: { cDisplayName: '', cIsOrg: false, cPrimaryEmail: '' as any },
  });
  const m = useMutation({
    mutationFn: (body: PartyCreate) => Parties.create({
      ...body,
      cPrimaryEmail: body.cPrimaryEmail ? body.cPrimaryEmail : undefined,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['parties'] }); reset(); onClose(); }
  });
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Nueva persona</DialogTitle>
      <DialogContent>
        <Stack gap={2} sx={{ mt: 1, width: 420 }}>
          <TextField label="Nombre / Display" {...register('cDisplayName')} error={!!errors.cDisplayName} helperText={errors.cDisplayName?.message} />
          <TextField label="Email" {...register('cPrimaryEmail')} error={!!errors.cPrimaryEmail} helperText={errors.cPrimaryEmail?.message} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit((vals)=>m.mutate(vals))} variant="contained" disabled={m.isPending}>Crear</Button>
      </DialogActions>
    </Dialog>
  );
}

function EditPartyDialog({ party, open, onClose }: { party: PartyDTO | null; open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [instagram, setInstagram] = useState(party?.instagram ?? '');
  const m = useMutation({
    mutationFn: (body: PartyUpdate) => Parties.update(party!.partyId, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['parties'] }); onClose(); }
  });
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Editar {party?.displayName}</DialogTitle>
      <DialogContent>
        <TextField autoFocus margin="dense" label="Instagram" fullWidth value={instagram} onChange={e => setInstagram(e.target.value)} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={() => m.mutate({ uInstagram: instagram })} disabled={m.isPending}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function PartiesPage() {
  const { data = [], isLoading, error } = useQuery({ queryKey: ['parties'], queryFn: Parties.list });
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<PartyDTO | null>(null);
  const [search, setSearch] = useState('');

  const columns = useMemo<ColumnDef<PartyDTO>[]>(() => [
    { header: 'Nombre', accessorKey: 'displayName' },
    { header: 'Org', cell: ({ row }) => row.original.isOrg ? 'Sí' : 'No' },
    { header: 'Email', accessorKey: 'primaryEmail' },
    { header: 'Instagram', accessorKey: 'instagram' },
    {
      header: 'Acciones', cell: ({ row }) => (
        <IconButton onClick={() => setEditing(row.original)}><EditIcon /></IconButton>
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
                <TableRow key={r.id} hover>
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
      <EditPartyDialog party={editing} open={!!editing} onClose={() => setEditing(null)} />
    </>
  );
}
