import { useEffect, useState } from 'react';
import {
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
} from '@mui/material';

interface MetadataRow {
  catalog_id: string;
  artist_name: string;
  project_title: string;
  session_type: string;
  bpm: number;
  key: string;
  genre: string;
}

const EMPTY_ROWS: MetadataRow[] = [];

type ColumnDefinition = {
  field: keyof MetadataRow;
  header: string;
};

const COLUMN_DEFINITIONS: readonly ColumnDefinition[] = [
  { field: 'catalog_id', header: 'Catalog ID' },
  { field: 'artist_name', header: 'Artist' },
  { field: 'project_title', header: 'Project' },
  { field: 'session_type', header: 'Type' },
  { field: 'bpm', header: 'BPM' },
  { field: 'key', header: 'Key' },
  { field: 'genre', header: 'Genre' },
];

export default function MetadataManager() {
  const [rows, setRows] = useState<MetadataRow[]>(EMPTY_ROWS);

  useEffect(() => {
    let isMounted = true;

    fetch('/api/metadata')
      .then((response) => (response.ok ? response.json() : EMPTY_ROWS))
      .then((data: MetadataRow[]) => {
        if (isMounted && Array.isArray(data)) {
          setRows(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setRows(EMPTY_ROWS);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Stack spacing={3} sx={{ p: 3 }}>
      <Typography component="h1" variant="h4">
        Metadata Manager
      </Typography>

      <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 560 }}>
        <Table stickyHeader aria-label="metadata table">
          <TableHead>
            <TableRow>
              {COLUMN_DEFINITIONS.map((column) => (
                <TableCell key={column.field}>{column.header}</TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={COLUMN_DEFINITIONS.length} align="center">
                  No metadata available
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.catalog_id} hover>
                  {COLUMN_DEFINITIONS.map((column) => (
                    <TableCell key={column.field}>{row[column.field]}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack direction="row" spacing={1.5}>
        <Button variant="contained">Import CSV/JSON</Button>
        <Button variant="outlined">Export CSV</Button>
        <Button variant="outlined">Export JSON</Button>
      </Stack>
    </Stack>
  );
}
