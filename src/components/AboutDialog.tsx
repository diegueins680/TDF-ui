import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Stack,
  Typography,
} from '@mui/material'

type Props = {
  open: boolean
  onClose: () => void
}

type VersionInfo = {
  version: string
  git?: string
}

export default function AboutDialog({ open, onClose }: Props) {
  const [apiVersion, setApiVersion] = useState<VersionInfo | null>(null)
  const apiBase = useMemo(() => import.meta.env.VITE_API_BASE ?? 'http://localhost:8080', [])
  const timezone = useMemo(() => import.meta.env.VITE_TZ ?? 'UTC', [])

  useEffect(() => {
    if (!open) return
    const controller = new AbortController()
    let cancelled = false

    fetch(`${apiBase}/version`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return
        try {
          const data = await response.json()
          if (!cancelled) setApiVersion(data)
        } catch {
          if (!cancelled) setApiVersion(null)
        }
      })
      .catch(() => {
        if (!cancelled) setApiVersion(null)
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [open, apiBase])

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>TDF HQ UI · Acerca de</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5}>
          <Typography variant="body2">
            API Base:{' '}
            <Link href={apiBase} target="_blank" rel="noreferrer">
              {apiBase}
            </Link>
          </Typography>
          <Typography variant="body2">
            Zona horaria: <Chip label={timezone} size="small" />
          </Typography>
          <Typography variant="body2">
            Versión del API:{' '}
            {apiVersion ? (
              <>
                <Chip label={apiVersion.version} size="small" />
                {apiVersion.git && (
                  <>
                    {' '}
                    <Chip label={apiVersion.git} size="small" variant="outlined" />
                  </>
                )}
              </>
            ) : (
              'n/d'
            )}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  )
}
