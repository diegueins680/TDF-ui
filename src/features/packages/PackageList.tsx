import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tdfApi, LessonPackage, cents } from '../../api/client';
import {
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

export default function PackageList() {
  const qc = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['packages-lite'],
    queryFn: tdfApi.listPackages,
  });

  const [draft, setDraft] = React.useState<Partial<LessonPackage>>({
    name: '',
    lessonsIncluded: 4,
    priceCents: 0,
    currency: 'USD',
  });

  const create = useMutation({
    mutationFn: () => tdfApi.createPackage(draft),
    onSuccess: () => {
      setDraft({ name: '', lessonsIncluded: 4, priceCents: 0, currency: 'USD' });
      qc.invalidateQueries({ queryKey: ['packages-lite'] });
    },
  });

  const packages = data ?? [];

  return (
    <Stack spacing={3} p={2}>
      <Box component={Paper} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Nuevo paquete rápido</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Nombre"
            value={draft.name ?? ''}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            required
          />
          <TextField
            label="Clases incluidas"
            type="number"
            value={draft.lessonsIncluded ?? 4}
            onChange={(event) => setDraft({ ...draft, lessonsIncluded: Number(event.target.value) })}
            sx={{ width: 180 }}
          />
          <TextField
            label="Precio (centavos)"
            type="number"
            value={draft.priceCents ?? 0}
            onChange={(event) => setDraft({ ...draft, priceCents: Number(event.target.value) })}
            sx={{ width: 200 }}
          />
          <TextField
            label="Moneda"
            value={draft.currency ?? 'USD'}
            onChange={(event) => setDraft({ ...draft, currency: event.target.value })}
            sx={{ width: 140 }}
          />
          <Button
            variant="contained"
            onClick={() => create.mutate()}
            disabled={create.isPending || !(draft.name ?? '').trim()}
          >
            {create.isPending ? 'Guardando…' : 'Crear'}
          </Button>
        </Stack>
      </Box>

      <Paper>
        <Typography variant="h6" sx={{ p: 2 }}>Paquetes activos</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Clases</TableCell>
                <TableCell>Precio</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={3}>Cargando…</TableCell>
                </TableRow>
              )}
              {isError && (
                <TableRow>
                  <TableCell colSpan={3} sx={{ color: 'error.main' }}>
                    {(error as Error).message}
                  </TableCell>
                </TableRow>
              )}
              {packages.map(pkg => (
                <TableRow key={pkg.id}>
                  <TableCell>{pkg.name}</TableCell>
                  <TableCell>{pkg.lessonsIncluded}</TableCell>
                  <TableCell>{cents(pkg.priceCents ?? 0, pkg.currency ?? 'USD')}</TableCell>
                </TableRow>
              ))}
              {!isLoading && !isError && packages.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} sx={{ color: 'text.secondary' }}>
                    No hay paquetes registrados todavía.
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
