import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignTrial, listTrials } from '../../api/trials';
import { Container, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button } from '@mui/material';

export default function TrialQueuePage(){
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey:['trial-requests'], queryFn:()=>listTrials({}) });
  const m = useMutation({ mutationFn: (id:number)=>assignTrial(id, 1), onSuccess:()=>qc.invalidateQueries({queryKey:['trial-requests']}) });

  return (
    <Container sx={{py:4}} maxWidth="lg">
      <Typography variant="h5" gutterBottom>Solicitudes de prueba</Typography>
      <Paper>
        <Table size="small">
          <TableHead><TableRow><TableCell>ID</TableCell><TableCell>Subject</TableCell><TableCell>Status</TableCell><TableCell/></TableRow></TableHead>
          <TableBody>
            {data.map((r:any)=>(
              <TableRow key={r.id}>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.subjectId}</TableCell>
                <TableCell>{r.status}</TableCell>
                <TableCell><Button onClick={()=>m.mutate(r.id)}>Tomar</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}
