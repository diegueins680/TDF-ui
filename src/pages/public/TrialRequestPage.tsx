import { useState } from 'react';
import { Container, Typography, Stack, TextField, MenuItem, Button, Grid, Alert } from '@mui/material';
import dayjs from 'dayjs';
import { createTrial } from '../../api/trials';

const SUBJECTS = ['Producción','Guitar','Bass','Drums','Voice','Ableton','Modular','DJ'];

export default function TrialRequestPage() {
  const [subject, setSubject] = useState('Ableton');
  const [notes, setNotes] = useState('');
  const [slots, setSlots] = useState([{startAt:'', endAt:''},{startAt:'', endAt:''},{startAt:'', endAt:''}]);
  const [done, setDone] = useState(false);

  const submit = async () => {
    const cleaned = slots.filter(s=>s.startAt && s.endAt);
    if (cleaned.length===0) return;
    await createTrial({ subjectId: SUBJECTS.indexOf(subject)+1, preferred: cleaned as any, notes });
    setDone(true);
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>Solicitar clase de prueba</Typography>
      {done && <Alert severity="success">¡Solicitud enviada! Te contactaremos pronto.</Alert>}
      <Stack gap={3}>
        <TextField select label="Subject" value={subject} onChange={e=>setSubject(e.target.value)} sx={{maxWidth:360}}>
          {SUBJECTS.map(s=><MenuItem key={s} value={s}>{s}</MenuItem>)}
        </TextField>
        <Grid container spacing={2}>
          {slots.map((s,i)=>(
            <Grid item xs={12} md={4} key={i}>
              <Stack gap={1}>
                <TextField type="datetime-local" label={`Inicio #${i+1}`} value={s.startAt} onChange={e=>{
                  const v=e.target.value; setSlots(arr=>{ const n=[...arr]; n[i]={...n[i], startAt:new Date(v).toISOString()}; return n;});
                }}/>
                <TextField type="datetime-local" label={`Fin #${i+1}`} value={s.endAt} onChange={e=>{
                  const v=e.target.value; setSlots(arr=>{ const n=[...arr]; n[i]={...n[i], endAt:new Date(v).toISOString()}; return n;});
                }}/>
              </Stack>
            </Grid>
          ))}
        </Grid>
        <TextField label="Notas" multiline minRows={3} value={notes} onChange={e=>setNotes(e.target.value)} />
        <Button variant="contained" onClick={submit}>Enviar solicitud</Button>
      </Stack>
    </Container>
  );
}
