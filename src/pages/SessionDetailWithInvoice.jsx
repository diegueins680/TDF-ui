import React, { useMemo } from 'react'
import InvoiceButton from '../components/InvoiceButton'

export default function SessionDetailWithInvoice({ session }) {
  const invoiceData = useMemo(() => ({
    sessionId: session.id,
    client: { name: session.client?.name || 'Cliente', taxId: session.client?.taxId || '' },
    items: (session.items || []).map(i => ({ desc: i.desc, qty: i.qty, unit_price: i.unit_price, total: i.total })),
    summary: session.summary || { subtotal: 0, tax_rate: '12%', tax: 0, total: 0 },
    payment: { terms: '50% anticipo / 50% previo a entrega', instructions: 'Transferencia a TDF Records S.A.S.' }
  }), [session])

  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <InvoiceButton session={session} invoiceData={invoiceData} />
    </div>
  )
}
