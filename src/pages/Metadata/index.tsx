import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
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
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

type MetadataRecord = {
  id: string;
  name: string;
  key: string;
  description: string;
  updatedAt: string;
};

type RecordDraft = {
  name: string;
  key: string;
  description: string;
};

const defaultDraft: RecordDraft = {
  name: '',
  key: '',
  description: '',
};

const createId = () => Math.random().toString(36).slice(2, 10);

function RecordDialog({
  open,
  onClose,
  initialValue,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  initialValue: RecordDraft | null;
  onSubmit: (value: RecordDraft) => void;
}) {
  const [draft, setDraft] = useState<RecordDraft>(initialValue ?? defaultDraft);
  const [errors, setErrors] = useState<{ name?: string; key?: string }>({});

  useEffect(() => {
    setDraft(initialValue ?? defaultDraft);
    setErrors({});
  }, [initialValue, open]);

  const handleChange = (field: keyof RecordDraft) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setDraft(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const nextErrors: { name?: string; key?: string } = {};
    if (!draft.name.trim()) {
      nextErrors.name = 'Name is required';
    }
    if (!draft.key.trim()) {
      nextErrors.key = 'Key is required';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      onSubmit({
        name: draft.name.trim(),
        key: draft.key.trim(),
        description: draft.description.trim(),
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialValue ? 'Edit metadata record' : 'Add metadata record'}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
        <TextField
          label="Display name"
          value={draft.name}
          onChange={handleChange('name')}
          error={!!errors.name}
          helperText={errors.name}
          autoFocus
        />
        <TextField
          label="Key"
          value={draft.key}
          onChange={handleChange('key')}
          error={!!errors.key}
          helperText={errors.key ?? 'Unique identifier for this metadata entry'}
        />
        <TextField
          label="Description"
          value={draft.description}
          onChange={handleChange('description')}
          multiline
          minRows={3}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function MetadataPage(): JSX.Element {
  const [records, setRecords] = useState<MetadataRecord[]>([
    {
      id: '1',
      name: 'Instructor bio',
      key: 'instructor_bio',
      description: 'Narrative information that appears in the booking experience.',
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Session capacity',
      key: 'session_capacity',
      description: 'Maximum number of students allowed per session.',
      updatedAt: new Date().toISOString(),
    },
  ]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MetadataRecord | null>(null);

  const filteredRecords = useMemo(() => {
    if (!search.trim()) {
      return records;
    }
    const term = search.trim().toLowerCase();
    return records.filter(record =>
      [record.name, record.key, record.description]
        .some(field => field.toLowerCase().includes(term)),
    );
  }, [records, search]);

  const handleCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const handleEdit = (record: MetadataRecord) => {
    setEditing(record);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setRecords(prev => prev.filter(record => record.id !== id));
    if (editing?.id === id) {
      setEditing(null);
      setDialogOpen(false);
    }
  };

  const handleSubmit = (draft: RecordDraft) => {
    setRecords(prev => {
      if (editing) {
        return prev.map(record =>
          record.id === editing.id
            ? { ...record, ...draft, updatedAt: new Date().toISOString() }
            : record,
        );
      }
      return [
        {
          id: createId(),
          ...draft,
          updatedAt: new Date().toISOString(),
        },
        ...prev,
      ];
    });
    setDialogOpen(false);
    setEditing(null);
  };

  return (
    <Stack spacing={3} sx={{ p: 3 }}>
      <Box>
        <Typography variant="h4" gutterBottom>
          TDF Metadata
        </Typography>
        <Typography color="text.secondary">
          Maintain descriptive records that enrich scheduling, booking and reporting experiences.
        </Typography>
      </Box>

      <Card variant="outlined">
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
            <TextField
              label="Search metadata"
              value={search}
              onChange={event => setSearch(event.target.value)}
              fullWidth
              size="small"
            />
            <Button variant="contained" onClick={handleCreate} sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}>
              New record
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Paper variant="outlined">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '20%' }}>Name</TableCell>
                <TableCell sx={{ width: '20%' }}>Key</TableCell>
                <TableCell>Description</TableCell>
                <TableCell sx={{ width: '15%' }}>Last updated</TableCell>
                <TableCell sx={{ width: '10%' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecords.map(record => (
                <TableRow key={record.id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{record.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontFamily="monospace">{record.key}</Typography>
                  </TableCell>
                  <TableCell>{record.description || '—'}</TableCell>
                  <TableCell>{new Date(record.updatedAt).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <IconButton aria-label={`Edit ${record.name}`} onClick={() => handleEdit(record)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton aria-label={`Delete ${record.name}`} onClick={() => handleDelete(record.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredRecords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography align="center" color="text.secondary" sx={{ py: 3 }}>
                      No metadata records match the current filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <RecordDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        initialValue={editing ? { name: editing.name, key: editing.key, description: editing.description } : null}
        onSubmit={handleSubmit}
      />
    </Stack>
  );
}
