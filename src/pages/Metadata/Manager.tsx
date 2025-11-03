import React, { useEffect, useMemo, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Button } from '@mui/material';

export default function MetadataManager() {
  const [rows, setRows] = useState<any[]>([]);
  const cols: GridColDef[] = useMemo(() => ([
    { field: 'catalog_id', headerName: 'Catalog ID', flex: 1 },
    { field: 'artist_name', headerName: 'Artist', flex: 1 },
    { field: 'project_title', headerName: 'Project', flex: 1 },
    { field: 'session_type', headerName: 'Type', width: 140 },
    { field: 'bpm', headerName: 'BPM', width: 100 },
    { field: 'key', headerName: 'Key', width: 100 },
    { field: 'genre', headerName: 'Genre', width: 140 },
  ]), []);

  useEffect(() => {
    fetch('/api/metadata').then(r => r.json()).then(setRows).catch(() => setRows([]));
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Metadata Manager</h1>
      <div style={{ height: 560, width: '100%', background: 'white' }}>
        <DataGrid rows={rows} columns={cols} getRowId={(r) => r.catalog_id} />
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        <Button variant="contained">Import CSV/JSON</Button>
        <Button variant="outlined">Export CSV</Button>
        <Button variant="outlined">Export JSON</Button>
      </div>
    </div>
  );
}
