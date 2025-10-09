import { useState } from 'react';
import { Box, Button, Checkbox, Container, FormControlLabel, Stack, TextField, Typography } from '@mui/material';
import { client } from '../../api/client';

export default function SignupPage() {
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', phone:'', password:'', marketing:false });
  const [ok, setOk] = useState(false);

  const onSubmit = async () => {
    await client.post('/v1/signup', { ...form, marketingOptIn: form.marketing });
    setOk(true);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>Crear cuenta</Typography>
      {ok ? <Typography>Revisa tu email para verificar tu cuenta.</Typography> : (
      <Stack gap={2}>
        <Stack direction="row" gap={2}>
          <TextField label="Nombre" fullWidth value={form.firstName} onChange={e=>setForm(f=>({...f, firstName:e.target.value}))}/>
          <TextField label="Apellido" fullWidth value={form.lastName} onChange={e=>setForm(f=>({...f, lastName:e.target.value}))}/>
        </Stack>
        <TextField label="Email" fullWidth value={form.email} onChange={e=>setForm(f=>({...f, email:e.target.value}))}/>
        <TextField label="WhatsApp/Teléfono" fullWidth value={form.phone} onChange={e=>setForm(f=>({...f, phone:e.target.value}))}/>
        <TextField label="Contraseña" type="password" fullWidth value={form.password} onChange={e=>setForm(f=>({...f, password:e.target.value}))}/>
        <FormControlLabel control={
          <Checkbox checked={form.marketing} onChange={e=>setForm(f=>({...f, marketing:e.target.checked}))}/>
        } label="Quiero recibir novedades por WhatsApp/email"/>
        <Button onClick={onSubmit} variant="contained">Crear cuenta</Button>
      </Stack>)}
    </Container>
  );
}
