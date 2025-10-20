import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  Container,
  Typography,
  Stack,
  TextField,
  MenuItem,
  Button,
  Alert,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Box,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { Trials } from '../../api/trials';
import type { PreferredSlotDTO, TrialTeacherAvailabilityDTO } from '../../api/types';

type SelectedSlot = {
  teacherId: number;
  teacherName: string;
  startAt: string;
  endAt: string;
};

function formatSlot(slot: PreferredSlotDTO) {
  return `${dayjs(slot.startAt).format('ddd D MMM · HH:mm')} — ${dayjs(slot.endAt).format('HH:mm')}`;
}

export default function TrialRequestPage() {
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [selected, setSelected] = useState<SelectedSlot | null>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const subjectsQuery = useQuery({ queryKey: ['trials', 'subjects', 'public'], queryFn: Trials.listSubjects });

  const subjects = useMemo(() => {
    const list = subjectsQuery.data ?? [];
    return list.slice().sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }, [subjectsQuery.data]);

  useEffect(() => {
    if (subjectId === null && subjects.length > 0) {
      setSubjectId(subjects[0].subjectId);
    }
  }, [subjectId, subjects]);

  const availabilityQuery = useQuery({
    queryKey: ['trials', 'availability', subjectId],
    queryFn: () => Trials.listTrialAvailability(subjectId as number),
    enabled: typeof subjectId === 'number',
  });

  const availability = availabilityQuery.data ?? [];
  const teachersWithSlots = availability.filter((teacher) => teacher.slots.length > 0);

  const handleSelect = (teacher: TrialTeacherAvailabilityDTO, slot: PreferredSlotDTO) => {
    setError(null);
    setDone(false);
    setSelected({
      teacherId: slot.teacherId ?? teacher.teacherId,
      teacherName: slot.teacherName ?? teacher.teacherName,
      startAt: slot.startAt,
      endAt: slot.endAt,
    });
  };

  const submit = async () => {
    if (typeof subjectId !== 'number') {
      setError('Selecciona una materia.');
import type { PreferredSlotDTO, SubjectDTO, TrialSlotDTO } from '../../api/types';

dayjs.locale('es');

type SelectedSlot = PreferredSlotDTO & { teacherId: number; teacherName: string };

function formatSlotLabel(slot: PreferredSlotDTO) {
  const start = dayjs(slot.startAt);
  const end = dayjs(slot.endAt);
  if (!start.isValid() || !end.isValid()) {
    return `${slot.startAt} → ${slot.endAt}`;
  }

  const durationMinutes = Math.max(end.diff(start, 'minute'), 0);
  const dateLabel = start.format('ddd D [de] MMMM');
  const timeLabel = `${start.format('HH:mm')} – ${end.format('HH:mm')}`;
  const durationLabel = durationMinutes ? ` · ${durationMinutes} min` : '';
  return `${dateLabel}\n${timeLabel}${durationLabel}`;
}

export default function TrialRequestPage() {
  const [notes, setNotes] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<number | ''>('');
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subjectsQuery = useQuery({ queryKey: ['trials', 'subjects'], queryFn: Trials.listSubjects });

  const subjectOptions = subjectsQuery.data ?? [];

  useEffect(() => {
    if (!subjectOptions.length) return;
    setSelectedSubject(prev => (prev ? prev : subjectOptions[0]?.subjectId ?? ''));
  }, [subjectOptions]);

  const slotsQuery = useQuery({
    queryKey: ['trials', 'slots', selectedSubject],
    queryFn: () => Trials.listTrialSlots(Number(selectedSubject)),
    enabled: typeof selectedSubject === 'number',
  });

  useEffect(() => {
    setSelectedSlot(null);
  }, [selectedSubject]);

  const teachersWithSlots: TrialSlotDTO[] = useMemo(() => slotsQuery.data ?? [], [slotsQuery.data]);

  const handleSelectSlot = (teacher: TrialSlotDTO, slot: PreferredSlotDTO) => {
    setSelectedSlot({ ...slot, teacherId: teacher.teacherId, teacherName: teacher.teacherName });
  };

  const submit = async () => {
    if (!selectedSubject) {
      setError('Selecciona una materia para continuar.');
      return;
    }
    if (!selectedSlot) {
      setError('Selecciona un horario disponible.');
      return;
    }

    if (!selected) {
      setError('Selecciona un horario disponible.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await Trials.createTrialRequest({
        subjectId,
        preferred: [
          {
            startAt: dayjs(selected.startAt).toISOString(),
            endAt: dayjs(selected.endAt).toISOString(),
            teacherId: selected.teacherId,
            teacherName: selected.teacherName,
      setIsSubmitting(true);
      setError(null);
      await Trials.createTrialRequest({
        subjectId: Number(selectedSubject),
        preferred: [
          {
            startAt: dayjs(selectedSlot.startAt).toISOString(),
            endAt: dayjs(selectedSlot.endAt).toISOString(),
            teacherId: selectedSlot.teacherId,
            teacherName: selectedSlot.teacherName,
          },
        ],
        notes: notes.trim() || undefined,
      });
      setDone(true);
      setNotes('');
      setSelected(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No pudimos registrar tu solicitud.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const hasSlots = teachersWithSlots.length > 0;
      setIsSubmitting(false);
    }
  };

  const selectedSubjectData: SubjectDTO | undefined =
    typeof selectedSubject === 'number'
      ? subjectOptions.find((item) => item.subjectId === selectedSubject)
      : undefined;

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>Solicitar clase de prueba</Typography>
      {done && (
        <Alert severity="success" sx={{ mb: 3 }}>
          ¡Solicitud enviada! Te contactaremos pronto para confirmar tu clase.
        </Alert>
      {done ? (
        <Alert severity="success">¡Solicitud enviada! Te contactaremos pronto.</Alert>
      ) : (
        <Stack gap={3}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            select
            label="Materia"
            value={selectedSubject}
            onChange={(event) => setSelectedSubject(event.target.value ? Number(event.target.value) : '')}
            sx={{ maxWidth: 360 }}
            disabled={subjectsQuery.isLoading}
            helperText={subjectsQuery.isLoading ? 'Cargando materias…' : undefined}
          >
            {subjectOptions.map((subject) => (
              <MenuItem key={subject.subjectId} value={subject.subjectId}>
                {subject.name}
              </MenuItem>
            ))}
          </TextField>

          <Stack gap={2}>
            <Typography variant="h6">Selecciona un horario de 45 minutos</Typography>
            {typeof selectedSubject !== 'number' ? (
              <Alert severity="info">Elige una materia para ver los horarios disponibles.</Alert>
            ) : slotsQuery.isLoading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : slotsQuery.isError ? (
              <Alert severity="error">No pudimos cargar los horarios disponibles.</Alert>
            ) : teachersWithSlots.length === 0 ? (
              <Alert severity="warning">Por ahora no hay horarios disponibles para esta materia. Vuelve a intentarlo más tarde.</Alert>
            ) : (
              <Stack gap={2}>
                {teachersWithSlots.map((teacher) => (
                  <Card key={teacher.teacherId} variant="outlined">
                    <CardHeader
                      title={teacher.teacherName}
                      subheader={selectedSubjectData?.name ? `Profesor de ${selectedSubjectData.name}` : 'Profesor disponible'}
                    />
                    <CardContent>
                      {teacher.slots.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          No hay horarios disponibles con este profesor por el momento.
                        </Typography>
                      ) : (
                        <Stack direction="row" flexWrap="wrap" gap={1.5}>
                          {teacher.slots.map((slot) => {
                            const key = `${teacher.teacherId}-${slot.startAt}-${slot.endAt}`;
                            const isSelected =
                              !!selectedSlot &&
                              selectedSlot.teacherId === teacher.teacherId &&
                              selectedSlot.startAt === slot.startAt &&
                              selectedSlot.endAt === slot.endAt;

                            return (
                              <Button
                                key={key}
                                variant={isSelected ? 'contained' : 'outlined'}
                                onClick={() => handleSelectSlot(teacher, slot)}
                                sx={{
                                  textTransform: 'none',
                                  justifyContent: 'flex-start',
                                  minWidth: 220,
                                  whiteSpace: 'pre-line',
                                }}
                              >
                                {formatSlotLabel(slot)}
                              </Button>
                            );
                          })}
                        </Stack>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </Stack>

          <TextField
            label="Notas"
            multiline
            minRows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Comparte contexto adicional (experiencia, objetivo, etc.)"
          />
          <Button
            variant="contained"
            onClick={submit}
            size="large"
            disabled={isSubmitting || !selectedSlot}
          >
            {isSubmitting ? 'Enviando…' : 'Enviar solicitud'}
          </Button>
        </Stack>
      )}
      <Stack gap={3}>
        {error && <Alert severity="error">{error}</Alert>}
        {subjectsQuery.isError && (
          <Alert severity="error">No pudimos cargar las materias disponibles. Intenta de nuevo en unos minutos.</Alert>
        )}
        <TextField
          select
          label="Materia"
          value={subjectId ?? ''}
          onChange={(event) => {
            const value = Number(event.target.value);
            setSubjectId(Number.isNaN(value) ? null : value);
            setSelected(null);
            setDone(false);
            setError(null);
          }}
          sx={{ maxWidth: 360 }}
          disabled={subjectsQuery.isLoading || subjects.length === 0}
          helperText={subjectsQuery.isLoading ? 'Cargando materias…' : undefined}
        >
          {subjects.map((subject) => (
            <MenuItem key={subject.subjectId} value={subject.subjectId}>
              {subject.name}
            </MenuItem>
          ))}
        </TextField>

        <Stack gap={2}>
          <Typography variant="h6">Horarios disponibles</Typography>
          {availabilityQuery.isLoading && (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          )}
          {availabilityQuery.isError && (
            <Alert severity="error">No pudimos cargar los horarios disponibles. Intenta nuevamente.</Alert>
          )}
          {!availabilityQuery.isLoading && !availabilityQuery.isError && !hasSlots && (
            <Alert severity="info">Por ahora no hay horarios de prueba disponibles para esta materia.</Alert>
          )}
          {!availabilityQuery.isLoading && !availabilityQuery.isError && hasSlots && (
            <Stack gap={2}>
              {teachersWithSlots.map((teacher) => (
                <Paper key={teacher.teacherId} variant="outlined">
                  <Stack gap={2} p={2}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1}>
                      <Box>
                        <Typography variant="subtitle1">{teacher.teacherName}</Typography>
                        {teacher.subjectName && (
                          <Typography variant="body2" color="text.secondary">{teacher.subjectName}</Typography>
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">Clases de 45 minutos</Typography>
                    </Stack>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {teacher.slots.map((slot) => {
                        const isSelected =
                          selected?.teacherId === (slot.teacherId ?? teacher.teacherId) &&
                          selected?.startAt === slot.startAt &&
                          selected?.endAt === slot.endAt;
                        return (
                          <Button
                            key={`${teacher.teacherId}-${slot.startAt}`}
                            variant={isSelected ? 'contained' : 'outlined'}
                            onClick={() => handleSelect(teacher, slot)}
                            disabled={submitting}
                            sx={{
                              flexBasis: { xs: '100%', sm: 'auto' },
                              flexGrow: { xs: 1, sm: 0 },
                            }}
                          >
                            {formatSlot(slot)}
                          </Button>
                        );
                      })}
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Stack>

        <TextField
          label="Notas"
          multiline
          minRows={3}
          value={notes}
          onChange={(event) => {
            setNotes(event.target.value);
            setDone(false);
          }}
          placeholder="Comparte contexto adicional (experiencia, objetivo, etc.)"
        />

        <Button
          variant="contained"
          size="large"
          onClick={submit}
          disabled={submitting || typeof subjectId !== 'number' || !selected}
        >
          {submitting ? 'Enviando…' : 'Solicitar trial'}
        </Button>
      </Stack>
    </Container>
  );
}
