import { useState } from 'react';
import { Container, Typography, Stack, TextField, MenuItem, Button, Grid, Alert } from '@mui/material';
import dayjs from 'dayjs';
import { Trials } from '../../api/trials';

const SUBJECTS = ['Producción', 'Guitar', 'Bass', 'Drums', 'Voice', 'Ableton', 'Modular', 'DJ'];

type SlotDraft = { startAt: string; endAt: string };

export default function TrialRequestPage() {
  const [subject, setSubject] = useState('Ableton');
  const [notes, setNotes] = useState('');
  const [slots, setSlots] = useState<SlotDraft[]>([
    { startAt: '', endAt: '' },
    { startAt: '', endAt: '' },
    { startAt: '', endAt: '' },
  ]);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (index: number, field: keyof SlotDraft, value: string) => {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const submit = async () => {
    const cleaned = slots
      .filter((slot) => slot.startAt && slot.endAt)
      .slice(0, 3)
      .map((slot) => ({
        startAt: dayjs(slot.startAt).toISOString(),
        endAt: dayjs(slot.endAt).toISOString(),
      }));

    if (cleaned.length === 0) {
      setError('Selecciona al menos un horario disponible.');
      return;
    }

    try {
      setError(null);
      await Trials.createTrialRequest({
        subjectId: SUBJECTS.indexOf(subject) + 1,
        preferred: cleaned,
        notes: notes.trim() || undefined,
      });
      setDone(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No pudimos registrar tu solicitud.';
      setError(message);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>Solicitar clase de prueba</Typography>
      {done ? (
        <Alert severity="success">¡Solicitud enviada! Te contactaremos pronto.</Alert>
      ) : (
        <Stack gap={3}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            select
            label="Materia"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            sx={{ maxWidth: 360 }}
          >
            {SUBJECTS.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
          <Grid container spacing={2}>
            {slots.map((slot, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Stack gap={1}>
                  <TextField
                    type="datetime-local"
                    label={`Inicio #${index + 1}`}
                    value={slot.startAt}
                    onChange={(event) => handleChange(index, 'startAt', event.target.value)}
                    inputProps={{ step: 900 }}
                  />
                  <TextField
                    type="datetime-local"
                    label={`Fin #${index + 1}`}
                    value={slot.endAt}
                    onChange={(event) => handleChange(index, 'endAt', event.target.value)}
                    inputProps={{ step: 900 }}
                  />
                </Stack>
              </Grid>
            ))}
          </Grid>
          <TextField
            label="Notas"
            multiline
            minRows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Comparte contexto adicional (experiencia, objetivo, etc.)"
          />
          <Button variant="contained" onClick={submit} size="large">
            Enviar solicitud
          </Button>
        </Stack>
      )}
    </Container>
  );
}
