import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MedFile — Dosarul meu medical',
  description: 'Agregator independent de date medicale',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body style={{margin:0, padding:0, fontFamily:'system-ui, -apple-system, sans-serif', background:'#f8f9fa'}}>
        {children}
      </body>
    </html>
  )
}