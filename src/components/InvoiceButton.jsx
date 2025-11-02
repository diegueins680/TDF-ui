import React from 'react'
import { Button } from '@mui/material'
import { API_URL } from '../lib/config'

export default function InvoiceButton({ session, invoiceData }) {
  const handleClick = async () => {
    const res = await fetch(`${API_URL}/invoices/${session.id}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoiceData)
    })
    const filePath = await res.json()
    window.open(`${API_URL}/${filePath}`, '_blank')
  }

  return (
    <Button variant="contained" color="secondary" onClick={handleClick}>
      Generar factura PDF
    </Button>
  )
}
