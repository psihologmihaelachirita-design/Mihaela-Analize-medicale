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
      const { data } = await supabase.from('analize').select('*').eq('user_id', session.user.id).order('data_analiza', { ascending: false })
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
    autoTable(doc, {
      startY: 55,
      head: [['Analiza', 'Valoare', 'Unitate', 'Data', 'Status']],
      body: analize.map(a => {
        const status = a.observatii?.includes('peste') ? 'Peste limita' : a.observatii?.includes('sub') ? 'Sub limita' : 'Normal'
        return [a.nume_analiza, a.tip_rezultat === 'calitativ' ? a.rezultat_text : a.valoare?.toString(), a.unitate || '-', a.data_analiza, status]
      }),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [29, 158, 117] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    })
    doc.save('dosar-medical.pdf')
    setGenerating(false)
  }

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontFamily:'system-ui'}}>
      <p style={{color:'#888',fontSize:'14px'}}>Se încarcă...</p>
    </div>
  )

  const normale = analize.filter(a => a.observatii?.includes('normal')).length
  const peste = analize.filter(a => a.observatii?.includes('peste')).length
  const sub = analize.filter(a => a.observatii?.includes('sub')).length

  return (
    <div style={{fontFamily:'system-ui,-apple-system,sans-serif', background:'#f8f9fa', minHeight:'100vh'}}>

      {/* Topbar identic cu celelalte pagini */}
      <div style={{background:'white', borderBottom:'0.5px solid #e5e7eb', padding:'0 24px', height:'52px', display:'flex', alignItems:'center', gap:'16px', position:'sticky', top:0, zIndex:10}}>
        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
          <div style={{width:'26px', height:'26px', background:'#E1F5EE', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color:'#0F6E56', fontSize:'14px', fontWeight:500}}>✚</div>
          <span style={{fontSize:'18px', fontWeight:500, color:'#111'}}>MedFile</span>
        </div>
        <span style={{color:'#e5e7eb'}}>|</span>
        <Link href="/dashboard" style={{color:'#0F6E56', textDecoration:'none', fontSize:'14px', fontWeight:500}}>← Dosar</Link>
      </div>

      <div style={{maxWidth:'600px', margin:'0 auto', padding:'2rem 1.5rem'}}>
        <h1 style={{fontSize:'20px', fontWeight:500, color:'#111', marginBottom:'6px'}}>Export dosar medical</h1>
        <p style={{color:'#888', marginBottom:'2rem', fontSize:'13px'}}>Descarcă toate analizele într-un document PDF structurat</p>

        <div style={{background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', padding:'1.5rem', marginBottom:'1.5rem'}}>
          <div style={{fontSize:'13px', color:'#888', marginBottom:'8px'}}>Dosarul tău conține</div>
          <div style={{fontSize:'28px', fontWeight:500, color:'#1D9E75', marginBottom:'8px'}}>{analize.length} analize</div>
          <div style={{fontSize:'13px', color:'#555'}}>
            ✓ Normale: {normale} · ↑ Peste: {peste} · ↓ Sub: {sub}
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={generating || analize.length === 0}
          style={{width:'100%', padding:'12px', background:'#1D9E75', color:'white', border:'none', borderRadius:'8px', fontSize:'15px', fontWeight:500, cursor:'pointer'}}>
          {generating ? '⏳ Se generează PDF-ul...' : '↓ Descarcă PDF dosar complet'}
        </button>
      </div>
    </div>
  )
}