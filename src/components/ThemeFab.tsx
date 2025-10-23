import { Fab, Tooltip } from '@mui/material'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { useColorMode } from '../theme/ColorModeProvider'

export default function ThemeFab() {
  const { mode, toggle } = useColorMode()
  const nextMode = mode === 'dark' ? 'light' : 'dark'

  return (
    <Tooltip title={`Cambiar a modo ${nextMode === 'dark' ? 'oscuro' : 'claro'}`}>
      <Fab
        size="small"
        color="primary"
        aria-label="Cambiar tema"
        onClick={toggle}
        sx={{ position: 'fixed', right: 16, bottom: 16, zIndex: 1500 }}
      >
        {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
      </Fab>
    </Tooltip>
  )
}
