import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
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
  Typography,
} from '@mui/material';
import { Receipts } from '../../api/receipts';
import type { ReceiptDTO, ReceiptLineDTO } from '../../api/types';

function formatAmount(cents: number, currency: string) {
  const amount = cents / 100;
  try {
    return new Intl.NumberFormat('es-EC', { style: 'currency', currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

type ReceiptLineWithTotals = ReceiptLineDTO & {
  lineSubtotal: number;
  lineTax: number;
};

export default function ReceiptView() {
  const { receiptId } = useParams<{ receiptId: string }>();

  const query = useQuery<ReceiptDTO>({
    queryKey: ['receipt', receiptId],
    queryFn: () => Receipts.get(receiptId ?? ''),
    enabled: Boolean(receiptId),
  });

  const { receipt, lines } = useMemo(() => {
    const data = query.data;
    if (!data) {
      return { receipt: undefined, lines: [] as ReceiptLineWithTotals[] };
    }
    const enriched = data.lineItems.map((item) => {
      const lineSubtotal = item.rlQuantity * item.rlUnitCents;
      const lineTax = item.rlTotalCents - lineSubtotal;
      return { ...item, lineSubtotal, lineTax };
    });
    return { receipt: data, lines: enriched };
  }, [query.data]);

  return (
    <Box p={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <div>
          <Typography variant="h5">
            {receipt ? `Recibo ${receipt.receiptNumber}` : `Recibo #${receiptId ?? ''}`}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {receipt?.issuedAt ? new Date(receipt.issuedAt).toLocaleString() : '—'}
          </Typography>
        </div>
        <Button variant="outlined" disabled>
          Descargar PDF (próximamente)
        </Button>
      </Stack>

      <Paper sx={{ p: 3 }}>
        {query.isLoading && <Typography>Cargando…</Typography>}
        {query.isError && (
          <Alert severity="error">{(query.error as Error).message}</Alert>
        )}
        {receipt && (
          <Stack spacing={3}>
            <Stack spacing={0.5}>
              <Typography variant="h6">{receipt.buyerName}</Typography>
              {receipt.buyerEmail && (
                <Typography color="text.secondary">{receipt.buyerEmail}</Typography>
              )}
              <Typography color="text.secondary">
                Factura relacionada: #{receipt.invoiceId}
              </Typography>
            </Stack>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Descripción</TableCell>
                    <TableCell>Cantidad</TableCell>
                    <TableCell align="right">Unitario</TableCell>
                    <TableCell align="right">IVA</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lines.map((line) => (
                    <TableRow key={line.receiptLineId}>
                      <TableCell>{line.rlDescription}</TableCell>
                      <TableCell>{line.rlQuantity}</TableCell>
                      <TableCell align="right">
                        {formatAmount(line.rlUnitCents, receipt.currency)}
                      </TableCell>
                      <TableCell align="right">
                        {line.lineTax > 0
                          ? formatAmount(line.lineTax, receipt.currency)
                          : '—'}
                      </TableCell>
                      <TableCell align="right">
                        {formatAmount(line.rlTotalCents, receipt.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {lines.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography variant="body2" color="text.secondary" align="center">
                          No se registraron conceptos en este recibo.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Stack spacing={0.5} sx={{ ml: 'auto', minWidth: 240 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Subtotal</Typography>
                <Typography>{formatAmount(receipt.subtotalCents, receipt.currency)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">IVA</Typography>
                <Typography>{formatAmount(receipt.taxCents, receipt.currency)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography fontWeight={600}>Total</Typography>
                <Typography fontWeight={600}>
                  {formatAmount(receipt.totalCents, receipt.currency)}
                </Typography>
              </Stack>
            </Stack>

            {receipt.notes && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Notas</Typography>
                <Typography variant="body2" color="text.secondary">{receipt.notes}</Typography>
              </Paper>
            )}
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
