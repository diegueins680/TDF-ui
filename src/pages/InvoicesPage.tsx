import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Invoices } from '../api/invoices';
import type { CreateInvoiceReq, InvoiceDTO } from '../api/types';

const schema = z.object({
  ciCustomerId: z.coerce.number().int().positive('ID inválido'),
  ciSubtotal: z.coerce.number().min(0, 'Subtotal inválido'),
  ciTax: z.coerce.number().min(0, 'Impuesto inválido'),
  ciNumber: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type CreateInvoiceDialogProps = {
  open: boolean;
  onClose: () => void;
};

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString('es-EC', { style: 'currency', currency: 'USD' });
}

function CreateInvoiceDialog({ open, onClose }: CreateInvoiceDialogProps) {
  const qc = useQueryClient();
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ciCustomerId: 0,
      ciSubtotal: 0,
      ciTax: 0,
      ciNumber: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (payload: CreateInvoiceReq) => Invoices.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      reset({ ciCustomerId: 0, ciSubtotal: 0, ciTax: 0, ciNumber: '' });
      onClose();
    },
  });

  const subtotal = watch('ciSubtotal') || 0;
  const tax = watch('ciTax') || 0;
  const total = subtotal + tax;

  const submit = (values: FormValues) => {
    const payload: CreateInvoiceReq = {
      ciCustomerId: values.ciCustomerId,
      ciSubtotalCents: Math.round(values.ciSubtotal * 100),
      ciTaxCents: Math.round(values.ciTax * 100),
      ciTotalCents: Math.round((values.ciSubtotal + values.ciTax) * 100),
      ciNumber: values.ciNumber?.trim() ? values.ciNumber.trim() : undefined,
    };
    mutation.mutate(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nueva factura</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="ID del cliente (PartyId)"
            type="number"
            {...register('ciCustomerId')}
            error={!!errors.ciCustomerId}
            helperText={errors.ciCustomerId?.message}
            required
          />
          <TextField
            label="Subtotal"
            type="number"
            {...register('ciSubtotal')}
            error={!!errors.ciSubtotal}
            helperText={errors.ciSubtotal?.message}
            required
          />
          <TextField
            label="Impuesto"
            type="number"
            {...register('ciTax')}
            error={!!errors.ciTax}
            helperText={errors.ciTax?.message}
            required
          />
          <TextField
            label="Número interno (opcional)"
            {...register('ciNumber')}
          />
          <Typography variant="body2" color="text.secondary">
            Total estimado: <strong>${total.toFixed(2)}</strong>
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit(submit)} disabled={mutation.isPending}>
          {mutation.isPending ? 'Creando…' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function InvoicesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const invoicesQuery = useQuery({ queryKey: ['invoices'], queryFn: Invoices.list });

  const invoices = invoicesQuery.data ?? [];

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h5">Facturación</Typography>
        <Button variant="contained" onClick={() => setDialogOpen(true)}>Nueva factura</Button>
      </Stack>
      <Paper variant="outlined">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Subtotal</TableCell>
                <TableCell>IVA</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((invoice: InvoiceDTO) => (
                <TableRow key={invoice.invId} hover>
                  <TableCell>{invoice.number ?? invoice.invId}</TableCell>
                  <TableCell>{formatCurrency(invoice.totalC)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{invoice.statusI}</Typography>
                  </TableCell>
                  <TableCell>{formatCurrency(invoice.subtotalC)}</TableCell>
                  <TableCell>{formatCurrency(invoice.taxC)}</TableCell>
                </TableRow>
              ))}
              {invoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                      No hay facturas registradas.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <CreateInvoiceDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Stack>
  );
}
