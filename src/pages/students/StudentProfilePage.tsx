import { Container, Typography } from '@mui/material';

export default function StudentProfilePage(){
  return (
    <Container sx={{py:4}}>
      <Typography variant="h5">Alumno</Typography>
      <Typography color="text.secondary">Saldos, consumos y make-ups (pendiente de wiring).</Typography>
    </Container>
  );
}
