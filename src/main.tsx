
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider } from '@mui/material'
import App from './App'
import theme from './theme'
import { AuthProvider } from './auth/AuthProvider'

const root = document.documentElement
if (!root.classList.contains('theme-dark') && !root.classList.contains('theme-light')) {
  let stored: string | null = null
  try {
    stored = localStorage.getItem('tdf-theme')
  } catch {}
  const isLight = stored === 'light'
  root.classList.toggle('theme-light', isLight)
  root.classList.toggle('theme-dark', !isLight)
}

const qc = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
