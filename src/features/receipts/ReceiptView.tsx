import * as React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tdfApi, cents } from '../../api/client';
import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

export default function ReceiptView() {
  const { receiptId } = useParams<{ receiptId: string }>();
  const query = useQuery({
    queryKey: ['receipt', receiptId],
    queryFn: () => tdfApi.getReceipt(receiptId!),
    enabled: Boolean(receiptId),
  });

  const receipt = query.data;

  return (
    <Box p={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <div>
          <Typography variant="h5">Recibo #{receiptId}</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {receipt?.issueDate ? new Date(receipt.issueDate).toLocaleDateString() : '—'}
          </Typography>
        </div>
        <Button variant="outlined" disabled>
          Descargar PDF (próximamente)
        </Button>
      </Stack>

      <Paper sx={{ p: 3 }}>
        {query.isLoading && <Typography>Cargando…</Typography>}
        {query.isError && (
          <Typography color="error">{(query.error as Error).message}</Typography>
        )}
        {receipt && (
          <Stack spacing={1}>
            <Typography variant="h6">{receipt.studentName}</Typography>
            {receipt.studentEmail && (
              <Typography color="text.secondary">{receipt.studentEmail}</Typography>
            )}
            <Typography>Paquete: {receipt.packageName}</Typography>
            <Typography>
              Monto: {cents(receipt.amountCents ?? 0, receipt.currency ?? 'USD')}
            </Typography>
            {receipt.notes && (
              <Typography color="text.secondary">Notas: {receipt.notes}</Typography>
            )}
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
