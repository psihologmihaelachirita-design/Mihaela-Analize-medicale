'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Export() {
  const [analize, setAnalize] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      const { data } = await supabase
        .from('analize')
        .select('*')
        .eq('user_id', session.user.id)
        .order('data_analiza', { ascending: false })
      setAnalize(data || [])
      setLoading(false)
    })
  }, [])

  async function handleExport() {
    setGenerating(true)
    const { jsPDF } = await import('jspdf')
    const autoTable = (await import('jspdf-autotable')).default

    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text('Dosar Medical Personal', 14, 20)
    doc.setFontSize(11)
    doc.setTextColor(100)
    doc.text(`Email: ${user?.email}`, 14, 30)
    doc.text(`Generat: ${new Date().toLocaleDateString('ro-RO')}`, 14, 37)
    doc.text(`Total analize: ${analize.length}`, 14, 44)

    const normale = analize.filter(a => a.observatii?.includes('normal')).length
    const peste = analize.filter(a => a.observatii?.includes('peste')).length
    const sub = analize.filter(a => a.observatii?.includes('sub')).length

    doc.text(`In limite normale: ${normale} | Peste limita: ${peste} | Sub limita: ${sub}`, 14, 51)

    doc.setDrawColor(200)
    doc.line(14, 55, 196, 55)

    autoTable(doc, {
      startY: 60,
      head: [['Analiza', 'Valoare', 'Unitate', 'Data', 'Status']],
      body: analize.map(a => {
        const status = a.observatii?.includes('peste') ? 'Peste limita' : 
                      a.observatii?.includes('sub') ? 'Sub limita' : 'Normal'
        return [a.nume_analiza, a.valoare?.toString(), a.unitate || '-', a.data_analiza, status]
      }),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [0, 112, 243] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: {
        4: { 
          fontStyle: 'bold',
        }
      },
      didParseCell: (data: any) => {
        if (data.column.index === 4 && data.section === 'body') {
          if (data.cell.text[0] === 'Peste limita') data.cell.styles.textColor = [242, 82, 45]
          else if (data.cell.text[0] === 'Sub limita') data.cell.styles.textColor = [250, 140, 22]
          else data.cell.styles.textColor = [0, 168, 84]
        }
      }
    })

    doc.save('dosar-medical.pdf')
    setGenerating(false)
  }

  if (loading) return <p style={{fontFamily:'Arial', padding:'2rem'}}>Se încarcă...</p>

  return (
    <main style={{fontFamily:'Arial', maxWidth:'600px', margin:'0 auto', padding:'2rem 1rem'}}>
      <div style={{marginBottom:'2rem'}}>
        <Link href="/dashboard" style={{color:'#0070f3', textDecoration:'none', fontSize:'14px'}}>← Înapoi la dosar</Link>
      </div>

      <h1 style={{fontSize:'1.8rem', marginBottom:'0.5rem'}}>Export dosar medical</h1>
      <p style={{color:'#666', marginBottom:'2rem', fontSize:'14px'}}>
        Descarcă toate analizele tale într-un document PDF structurat
      </p>

      <div style={{background:'#f0f7ff', borderRadius:'12px', padding:'1.5rem', marginBottom:'2rem'}}>
        <div style={{fontSize:'14px', color:'#333', marginBottom:'8px'}}>📋 Dosarul tău conține:</div>
        <div style={{fontSize:'24px', fontWeight:'bold', color:'#0070f3'}}>{analize.length} analize</div>
        <div style={{fontSize:'13px', color:'#666', marginTop:'4px'}}>
          ✓ Normal: {analize.filter(a => a.observatii?.includes('normal')).length} · 
          ↑ Peste: {analize.filter(a => a.observatii?.includes('peste')).length} · 
          ↓ Sub: {analize.filter(a => a.observatii?.includes('sub')).length}
        </div>
      </div>

      <button
        onClick={handleExport}
        disabled={generating || analize.length === 0}
        style={{width:'100%', padding:'14px', background:'#0070f3', color:'white', border:'none', borderRadius:'8px', fontSize:'16px', cursor:'pointer'}}>
        {generating ? '⏳ Se generează PDF-ul...' : '📄 Descarcă PDF dosar complet'}
      </button>
    </main>
  )
}