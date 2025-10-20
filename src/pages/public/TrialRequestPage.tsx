import { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Typography,
  Stack,
  TextField,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Box,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Trials } from '../../api/trials';

type SelectedSlot = { teacherId: number; startAt: string; endAt: string };

export default function TrialRequestPage() {
  const subjectsQuery = useQuery({ queryKey: ['trials', 'subjects'], queryFn: Trials.listSubjects });
  const subjects = subjectsQuery.data ?? [];

  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([]);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (subjectId === null && subjects.length) {
      setSubjectId(subjects[0].subjectId);
    }
  }, [subjectId, subjects]);

  const availabilityQuery = useQuery({
    queryKey: ['trials', 'availability', subjectId],
    queryFn: () => Trials.listTrialAvailability(subjectId!),
    enabled: subjectId !== null,
  });

  useEffect(() => {
    setSelectedSlots([]);
  }, [subjectId]);

  const selectedCount = selectedSlots.length;

  const availability = useMemo(() => availabilityQuery.data ?? [], [availabilityQuery.data]);

  const toggleSlot = (slot: SelectedSlot) => {
    setSelectedSlots((prev) => {
      const exists = prev.some(
        (item) => item.teacherId === slot.teacherId && item.startAt === slot.startAt && item.endAt === slot.endAt,
      );
      if (exists) {
        return prev.filter(
          (item) => !(item.teacherId === slot.teacherId && item.startAt === slot.startAt && item.endAt === slot.endAt),
        );
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, slot];
    });
  };

  const submit = async () => {
    if (!subjectId) {
      setError('Selecciona una materia.');
      return;
    }

    const cleaned = selectedSlots.map((slot) => ({
      startAt: dayjs(slot.startAt).toISOString(),
      endAt: dayjs(slot.endAt).toISOString(),
    }));

    if (cleaned.length === 0) {
      setError('Selecciona al menos un horario disponible.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await Trials.createTrialRequest({
        subjectId,
        preferred: cleaned,
        notes: notes.trim() || undefined,
      });
      setDone(true);
      setSelectedSlots([]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No pudimos registrar tu solicitud.';
      setError(message);
    } finally {
      setSubmitting(false);
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
            value={subjectId ?? ''}
            onChange={(event) => {
              const value = event.target.value;
              setSubjectId(value === '' ? null : Number(value));
            }}
            sx={{ maxWidth: 360 }}
            disabled={subjectsQuery.isLoading}
            helperText={subjectsQuery.isError ? 'No pudimos cargar las materias disponibles.' : 'Selecciona la materia que más te interese.'}
          >
            {subjects.map((subject) => (
              <MenuItem key={subject.subjectId} value={subject.subjectId}>{subject.name}</MenuItem>
            ))}
          </TextField>
          <Stack gap={2}>
            <Typography variant="h6">Selecciona hasta 3 horarios de 45 minutos</Typography>
            {availabilityQuery.isLoading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : availabilityQuery.isError ? (
              <Alert severity="error">No pudimos cargar los horarios disponibles.</Alert>
            ) : availability.length === 0 ? (
              <Alert severity="info">No hay horarios disponibles para esta materia en este momento.</Alert>
            ) : (
              <Stack gap={2}>
                {availability.map((teacher) => (
                  <Box
                    key={teacher.teacherId}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600}>{teacher.teacherName}</Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1.5}>
                      {teacher.slots.map((slot) => {
                        const start = dayjs(slot.startAt);
                        const end = dayjs(slot.endAt);
                        const key = `${teacher.teacherId}-${slot.startAt}`;
                        const selected = selectedSlots.some(
                          (item) => item.teacherId === teacher.teacherId && item.startAt === slot.startAt,
                        );
                        const disabled = !selected && selectedCount >= 3;
                        return (
                          <Button
                            key={key}
                            variant={selected ? 'contained' : 'outlined'}
                            onClick={() =>
                              toggleSlot({
                                teacherId: teacher.teacherId,
                                startAt: slot.startAt,
                                endAt: slot.endAt,
                              })
                            }
                            disabled={disabled}
                          >
                            {start.format('ddd D MMM HH:mm')} · {end.format('HH:mm')}
                          </Button>
                        );
                      })}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
            <Typography variant="body2" color="text.secondary">
              Podrás seleccionar hasta 3 horarios distintos para ayudarte a coordinar la clase.
            </Typography>
          </Stack>
          <TextField
            label="Notas"
            multiline
            minRows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Comparte contexto adicional (experiencia, objetivo, etc.)"
          />
          <Button variant="contained" onClick={submit} size="large" disabled={submitting || !subjectId}>
            {submitting ? 'Enviando…' : 'Enviar solicitud'}
          </Button>
        </Stack>
      )}
    </Container>
  );
}
