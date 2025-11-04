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

function exportAs(format: 'csv' | 'json', records: MetadataRecord[]) {
  if (format === 'json') {
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `metadata-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    return;
  }

  const header: (keyof MetadataRecord)[] = ['name', 'key', 'description', 'updatedAt'];
  const rows = records.map(record => header.map(field => {
    const value = String(record[field] ?? '');
    return `"${value.replace(/"/g, '""')}"`;
  }).join(','));
  const blob = new Blob([[header.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `metadata-${new Date().toISOString()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

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

export default function MetadataManager(): JSX.Element {
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
  const [importError, setImportError] = useState<string | null>(null);

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

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as MetadataRecord[];
      if (!Array.isArray(parsed)) {
        throw new Error('File does not contain an array');
      }
      setRecords(parsed.map(item => ({
        ...item,
        id: item.id ?? createId(),
        updatedAt: item.updatedAt ?? new Date().toISOString(),
      })));
      setImportError(null);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Unable to import metadata');
    }
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

      {importError && (
        <Card variant="outlined" sx={{ borderColor: 'error.main' }}>
          <CardContent sx={{ color: 'error.main' }}>
            {importError}
          </CardContent>
        </Card>
      )}

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

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
        <Button variant="contained" component="label">
          Import JSON
          <input hidden type="file" accept="application/json" onChange={handleImport} />
        </Button>
        <Button variant="outlined" onClick={() => exportAs('csv', records)}>
          Export CSV
        </Button>
        <Button variant="outlined" onClick={() => exportAs('json', records)}>
          Export JSON
        </Button>
      </Stack>

      <RecordDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        initialValue={editing ? { name: editing.name, key: editing.key, description: editing.description } : null}
        onSubmit={handleSubmit}
      />
    </Stack>
  );
}
