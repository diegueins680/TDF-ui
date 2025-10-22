import * as React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tdfApi } from '../../api/client';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';

type TeacherStudent = { id: string; name: string; email?: string };

export default function StudentsByTeacher() {
  const { teacherId } = useParams<{ teacherId: string }>();
  const query = useQuery({
    queryKey: ['students-by-teacher', teacherId],
    queryFn: () => tdfApi.studentsByTeacher(teacherId!),
    enabled: Boolean(teacherId),
  });

  const students = query.data ?? [];

  return (
    <Box p={2}>
      <Typography variant="h5" mb={2}>Estudiantes asignados al profesor #{teacherId}</Typography>
      <Paper>
        {query.isLoading && (
          <Typography sx={{ p: 2 }}>Cargando…</Typography>
        )}
        {query.isError && (
          <Typography sx={{ p: 2 }} color="error">
            {(query.error as Error).message}
          </Typography>
        )}
        {!query.isLoading && !query.isError && students.length === 0 && (
          <Typography sx={{ p: 2 }} color="text.secondary">
            No hay estudiantes registrados para este profesor.
          </Typography>
        )}
        {students.length > 0 && (
          <List dense>
            {students.map((student: TeacherStudent) => (
              <ListItem key={student.id} divider>
                <ListItemText
                  primary={student.name || `Estudiante #${student.id}`}
                  secondary={student.email}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}
