import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { tdfApi, cents } from '../../api/client';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

export default function Payments() {
  const query = useQuery({
    queryKey: ['payments'],
    queryFn: tdfApi.listPayments,
  });

  return (
    <Box p={2}>
      <Typography variant="h5" mb={2}>Pagos registrados</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Paquete</TableCell>
              <TableCell>Estudiante</TableCell>
              <TableCell>Método</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell align="right">Monto</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {query.isLoading && (
              <TableRow><TableCell colSpan={6}>Cargando…</TableCell></TableRow>
            )}
            {query.isError && (
              <TableRow>
                <TableCell colSpan={6} sx={{ color: 'error.main' }}>
                  {(query.error as Error).message}
                </TableCell>
              </TableRow>
            )}
            {query.data?.map(payment => (
              <TableRow key={payment.id}>
                <TableCell>{payment.id}</TableCell>
                <TableCell>{payment.packageId}</TableCell>
                <TableCell>{payment.studentId}</TableCell>
                <TableCell>{payment.method ?? '—'}</TableCell>
                <TableCell>{new Date(payment.paidAt).toLocaleString()}</TableCell>
                <TableCell align="right">{cents(payment.amountCents ?? 0, payment.currency ?? 'USD')}</TableCell>
              </TableRow>
            ))}
            {!query.isLoading && !query.isError && (query.data ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={6} sx={{ color: 'text.secondary' }}>
                  No se encontraron pagos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
