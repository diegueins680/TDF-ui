import * as React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tdfApi } from '../../api/client';
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

export default function TeacherLessons() {
  const { teacherId } = useParams<{ teacherId: string }>();
  const query = useQuery({
    queryKey: ['teacher-lessons', teacherId],
    queryFn: () => tdfApi.lessonsByTeacher(teacherId!),
    enabled: Boolean(teacherId),
  });

  return (
    <Box p={2}>
      <Typography variant="h5" mb={2}>Clases del profesor #{teacherId}</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Estudiante</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell align="right">Duración (min)</TableCell>
              <TableCell>Tema</TableCell>
              <TableCell>Estado</TableCell>
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
            {query.data?.map(lesson => (
              <TableRow key={lesson.id}>
                <TableCell>{lesson.id}</TableCell>
                <TableCell>{lesson.studentId}</TableCell>
                <TableCell>{new Date(lesson.scheduledAt).toLocaleString()}</TableCell>
                <TableCell align="right">{lesson.durationMin}</TableCell>
                <TableCell>{lesson.topic ?? '—'}</TableCell>
                <TableCell>{lesson.status ?? 'SCHEDULED'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
