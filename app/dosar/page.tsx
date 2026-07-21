'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Topbar from '@/components/Topbar'
import { IconStethoscope, IconUserHeart, IconScissors, IconFileText } from '@tabler/icons-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Dosar() {
  const [user, setUser] = useState<any>(null)
  const [profil, setProfil] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [cautare, setCautare] = useState('')
  const [filtruCategorie, setFiltruCategorie] = useState('toate')
  const [modalExport, setModalExport] = useState(false)
  const [exportAnalize, setExportAnalize] = useState(true)
  const [exportRapoarte, setExportRapoarte] = useState(true)
  const [exportPerioadaAnalize, setExportPerioadaAnalize] = useState('toate')
  const [exportPerioadaRapoarte, setExportPerioadaRapoarte] = useState('toate')
  const [filtruPerioda, setFiltruPerioda] = useState('30')
  const [rapoarte, setRapoarte] = useState<any[]>([])
  const [analize, setAnalize] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      const { data } = await supabase.from('profiluri').select('prenume, nume, grup_sanguin, alergii_medicamente, alergii_alimentare, boli_cronice, fumator, greutate, inaltime').eq('id', session.user.id).single()
      setProfil(data)
      const profilActiv = JSON.parse(localStorage.getItem('profilActiv') || '{}')
      const eApartinator = profilActiv?.tip === 'apartinator' && profilActiv?.id
      const { data: rapoarteData } = eApartinator
        ? await supabase.from('rapoarte').select('*').eq('apartinator_id', profilActiv.id).order('data_raport', { ascending: false })
        : await supabase.from('rapoarte').select('*').eq('user_id', session.user.id).order('data_raport', { ascending: false })
      setRapoarte(rapoarteData || [])
      const { data: analizeData } = await supabase.from('analize').select('*').eq('user_id', session.user.id).order('data_analiza', { ascending: false })
      setAnalize(analizeData || [])
      setLoading(false)
    })
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}><p style={{ color:'#111', fontSize:'18px' }}>Se încarcă...</p></div>

  const username = profil?.prenume || user?.email?.split('@')[0]

  const tipLabel: Record<string, string> = { familie:'Familie', specialist:'Specialist', interventie:'Intervenție', externare:'Externare' }
  const tipColor: Record<string, { bg: string, color: string }> = {
    familie: { bg:'#E1F5EE', color:'#085041' },
    specialist: { bg:'#EEF2FF', color:'#4338CA' },
    interventie: { bg:'#FEF3C7', color:'#B45309' },
    externare: { bg:'#FCE7F3', color:'#9D174D' },
  }

  const rapoarteFiltrate = rapoarte.filter(r => {
    const matchCategorie = filtruCategorie === 'toate' || r.categorie === filtruCategorie
    const matchCautare = cautare === '' ||
      (r.medic || '').toLowerCase().includes(cautare.toLowerCase()) ||
      (r.unitate || '').toLowerCase().includes(cautare.toLowerCase()) ||
      (r.diagnostic || '').toLowerCase().includes(cautare.toLowerCase()) ||
      (r.specialitate || '').toLowerCase().includes(cautare.toLowerCase())
    return matchCategorie && matchCautare
  })

  const counts = {
    familie: rapoarte.filter(r => r.categorie === 'familie').length,
    specialist: rapoarte.filter(r => r.categorie === 'specialist').length,
    interventie: rapoarte.filter(r => r.categorie === 'interventie').length,
    externare: rapoarte.filter(r => r.categorie === 'externare').length,
  }

  const casete = [
    { key:'familie', label:'Medic de familie', sub:'Consultații, rețete și trimiteri', icon: IconUserHeart, bg:'#E1F5EE' },
    { key:'specialist', label:'Medic specialist', sub:'Consultații și rapoarte specialiști', icon: IconStethoscope, bg:'#EEF2FF' },
    { key:'interventie', label:'Raport intervenție medicală', sub:'Intervenții chirurgicale și proceduri', icon: IconScissors, bg:'#FEF3C7' },
    { key:'externare', label:'Scrisoare de externare', sub:'Scrisori cu analize, concluzii și investigații', icon: IconFileText, bg:'#FCE7F3' },
  ]

  const thStyle: React.CSSProperties = { padding:'14px 18px', textAlign:'left' as const, fontSize:'13px', fontWeight:600, color:'#475569', textTransform:'uppercase' as const, letterSpacing:'0.5px', borderBottom:'1px solid #e5e7eb', background:'#f8fafc', whiteSpace:'nowrap' as const }
  const tdStyle: React.CSSProperties = { padding:'16px 18px', fontSize:'14px', color:'#1e293b', borderBottom:'1px solid #f0f0f0', verticalAlign:'middle' as const, textAlign:'center' as const }

  return (
    <div style={{ fontFamily:'system-ui,-apple-system,sans-serif', background:'#f8fafc', minHeight:'100vh' }}>
      <Topbar username={username} activePage="dosar" onLogout={handleLogout} />
      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'36px 28px' }}>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'6px' }}>
          <div style={{ fontSize:'28px', fontWeight:600, color:'#0f172a' }}>Dosarul meu medical</div>
          <button onClick={() => setModalExport(true)} style={{ padding:'9px 18px', background:'#16705a', color:'white', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:500, cursor:'pointer' }}>
            📄 Exportă dosar medical
          </button>
        </div>
        <div style={{ fontSize:'16px', color:'#64748b', marginBottom:'32px' }}>Toate rapoartele, consultațiile și documentele tale medicale.</div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'36px' }}>
          {casete.map(c => {
            const isActive = filtruCategorie === c.key
            const IconComponent = c.icon
            return (
              <div key={c.key} onClick={() => setFiltruCategorie(c.key === filtruCategorie ? 'toate' : c.key)}
                style={{ background:'white', border: isActive ? '2px solid #16705a' : '1px solid #e5e7eb', borderRadius:'16px', padding:'24px 22px', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', gap:'8px', boxShadow: isActive ? '0 4px 16px rgba(22, 112, 90, 0.12)' : '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ width:'52px', height:'52px', background:'#16705a', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <IconComponent size={24} stroke={1.5} color="white" />
                </div>
                <div style={{ fontSize:'18px', fontWeight:700, color:'#0f172a', marginTop:'4px' }}>{c.label}</div>
                <div style={{ fontSize:'14px', color:'#64748b', lineHeight:1.5 }}>{c.sub}</div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'12px', marginTop:'6px' }}>
                  <span style={{ display:'inline-flex', padding:'4px 14px', background:'#E1F5EE', color:'#085041', borderRadius:'20px', fontSize:'13px', fontWeight:600 }}>{counts[c.key as keyof typeof counts]} rapoarte</span>
                  <span style={{ fontSize:'14px', color:'#16705a', fontWeight:600 }}>Vezi toate →</span>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ fontSize:'18px', fontWeight:600, color:'#0f172a', marginBottom:'16px' }}>Rapoarte recente</div>
        <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', alignItems:'center', marginBottom:'16px' }}>
          <input value={cautare} onChange={e => setCautare(e.target.value)} placeholder="🔍 Caută medic, clinică, diagnostic..."
            style={{ padding:'12px 16px', border:'1px solid #e5e7eb', borderRadius:'10px', fontSize:'15px', background:'white', color:'#111', width:'280px', outline:'none', flex:'1 1 200px' }} />
          <select value={filtruCategorie} onChange={e => setFiltruCategorie(e.target.value)}
            style={{ padding:'12px 16px', border:'1px solid #e5e7eb', borderRadius:'10px', fontSize:'15px', background:'white', color:'#111', cursor:'pointer' }}>
            <option value="toate">Toate categoriile</option>
            <option value="familie">Medic familie</option>
            <option value="specialist">Specialist</option>
            <option value="interventie">Intervenție</option>
            <option value="externare">Externare</option>
          </select>
          <select value={filtruPerioda} onChange={e => setFiltruPerioda(e.target.value)}
            style={{ padding:'12px 16px', border:'1px solid #e5e7eb', borderRadius:'10px', fontSize:'15px', background:'white', color:'#111', cursor:'pointer' }}>
            <option value="30">Ultimele 30 zile</option>
            <option value="90">Ultimele 3 luni</option>
            <option value="365">Ultimul an</option>
            <option value="toate">Toate</option>
          </select>
        </div>

        <div style={{ background:'white', border:'1px solid #e5e7eb', borderRadius:'16px', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Data</th>
                <th style={thStyle}>Tip</th>
                <th style={thStyle}>Medic</th>
                <th style={thStyle}>Specialitate</th>
                <th style={thStyle}>Unitate medicală</th>
                <th style={thStyle}>Diagnostic</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {rapoarteFiltrate.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign:'center', padding:'48px 20px', color:'#94a3b8', fontSize:'15px' }}>Niciun raport găsit.</td></tr>
              ) : rapoarteFiltrate.map((r, i) => (
                <tr key={r.id} style={{ background:'white' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                  <td style={{ ...tdStyle, borderBottom: i < rapoarteFiltrate.length - 1 ? '1px solid #f0f0f0' : 'none', fontWeight:500 }}>
                    {r.data_raport ? new Date(r.data_raport).toLocaleDateString('ro-RO', { day:'numeric', month:'short', year:'numeric' }) : '—'}
                  </td>
                  <td style={{ ...tdStyle, borderBottom: i < rapoarteFiltrate.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <span style={{ padding:'5px 14px', borderRadius:'20px', fontSize:'13px', fontWeight:600, background:tipColor[r.categorie]?.bg || '#f0f0f0', color:tipColor[r.categorie]?.color || '#555' }}>
                      {tipLabel[r.categorie] || r.categorie || '-'}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, borderBottom: i < rapoarteFiltrate.length - 1 ? '1px solid #f0f0f0' : 'none', fontWeight:500 }}>{r.medic}</td>
                  <td style={{ ...tdStyle, borderBottom: i < rapoarteFiltrate.length - 1 ? '1px solid #f0f0f0' : 'none' }}>{r.specialitate}</td>
                  <td style={{ ...tdStyle, borderBottom: i < rapoarteFiltrate.length - 1 ? '1px solid #f0f0f0' : 'none' }}>{r.unitate}</td>
                  <td style={{ ...tdStyle, borderBottom: i < rapoarteFiltrate.length - 1 ? '1px solid #f0f0f0' : 'none', color:'#475569' }}>{r.diagnostic}</td>
                  <td style={{ ...tdStyle, borderBottom: i < rapoarteFiltrate.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <div style={{ display:'flex', flexDirection:'column', gap:'4px', alignItems:'center' }}>
                      <button onClick={async () => {
                        if (!confirm('Ștergi acest raport?')) return
                        await supabase.from('rapoarte').delete().eq('id', r.id)
                        setRapoarte(prev => prev.filter((x: any) => x.id !== r.id))
                      }} style={{ padding:'4px 8px', background:'transparent', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="#000" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      </button>
                      {r.pdf_url
                        ? <span onClick={async () => {
                            const { data } = await supabase.storage.from('documente').createSignedUrl(r.pdf_url, 60)
                            if (data?.signedUrl) window.open(data.signedUrl, '_blank')
                          }} style={{ fontSize:'12px', color:'#16705a', fontWeight:600, cursor:'pointer', padding:'4px 10px', borderRadius:'6px', background:'#E1F5EE', whiteSpace:'nowrap' as const }}>
                            📄 PDF
                          </span>
                        : <span style={{ fontSize:'13px', color:'#aaa' }}>—</span>
                      }
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Export Dosar Medical */}
      {modalExport && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 }}
          onClick={e => { if (e.target === e.currentTarget) setModalExport(false) }}>
          <div style={{ background:'white', borderRadius:'16px', padding:'28px', width:'520px', maxWidth:'90vw', boxShadow:'0 4px 24px rgba(0,0,0,0.12)' }}>
            <div style={{ fontSize:'18px', fontWeight:600, color:'#111', marginBottom:'4px', textAlign:'center' }}>Exportă dosar medical</div>
            <div style={{ fontSize:'13px', color:'#555', marginBottom:'24px', textAlign:'center' }}>Alege ce vrei să incluzi în documentul PDF</div>

            <div style={{ marginBottom:'16px' }}>
              <div style={{ fontSize:'11px', fontWeight:600, color:'#888', textTransform:'uppercase' as const, letterSpacing:'0.5px', marginBottom:'8px' }}>1. Profil medical</div>
              <div style={{ padding:'10px 12px', border:'0.5px solid #e5e7eb', borderRadius:'8px', background:'#f8f9fa', fontSize:'13px', color:'#555' }}>
                Grup sanguin, alergii, diagnostice, medic familie
              </div>
            </div>

            <div style={{ marginBottom:'16px' }}>
              <div style={{ fontSize:'11px', fontWeight:600, color:'#888', textTransform:'uppercase' as const, letterSpacing:'0.5px', marginBottom:'8px' }}>2. Analize medicale</div>
              <div onClick={() => setExportAnalize(!exportAnalize)}
                style={{ padding:'10px 12px', border: exportAnalize ? '1.5px solid #16705a' : '0.5px solid #e5e7eb', borderRadius:'8px', background: exportAnalize ? '#E1F5EE' : 'white', cursor:'pointer', display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
                <div style={{ width:'18px', height:'18px', border:'1.5px solid #16705a', borderRadius:'4px', background: exportAnalize ? '#16705a' : 'white', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {exportAnalize && <svg viewBox="0 0 24 24" width="12" height="12" stroke="white" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <div style={{ fontSize:'13px', fontWeight:500, color:'#111' }}>Include analize</div>
              </div>
              {exportAnalize && (
                <div style={{ display:'flex', gap:'6px' }}>
                  {['toate', '6luni', '1an'].map(p => (
                    <div key={p} onClick={() => setExportPerioadaAnalize(p)}
                      style={{ padding:'6px 12px', border: exportPerioadaAnalize === p ? '1.5px solid #16705a' : '0.5px solid #e5e7eb', borderRadius:'6px', fontSize:'12px', cursor:'pointer', color: exportPerioadaAnalize === p ? '#085041' : '#111', background: exportPerioadaAnalize === p ? '#E1F5EE' : 'white', fontWeight: exportPerioadaAnalize === p ? 600 : 400 }}>
                      {p === 'toate' ? 'Toate' : p === '6luni' ? 'Ultimele 6 luni' : 'Ultimul an'}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginBottom:'16px' }}>
              <div style={{ fontSize:'11px', fontWeight:600, color:'#888', textTransform:'uppercase' as const, letterSpacing:'0.5px', marginBottom:'8px' }}>3. Rapoarte medicale</div>
              <div onClick={() => setExportRapoarte(!exportRapoarte)}
                style={{ padding:'10px 12px', border: exportRapoarte ? '1.5px solid #16705a' : '0.5px solid #e5e7eb', borderRadius:'8px', background: exportRapoarte ? '#E1F5EE' : 'white', cursor:'pointer', display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
                <div style={{ width:'18px', height:'18px', border:'1.5px solid #16705a', borderRadius:'4px', background: exportRapoarte ? '#16705a' : 'white', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {exportRapoarte && <svg viewBox="0 0 24 24" width="12" height="12" stroke="white" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <div style={{ fontSize:'13px', fontWeight:500, color:'#111' }}>Include rapoarte</div>
              </div>
              {exportRapoarte && (
                <div style={{ display:'flex', gap:'6px' }}>
                  {['toate', '6luni', '1an'].map(p => (
                    <div key={p} onClick={() => setExportPerioadaRapoarte(p)}
                      style={{ padding:'6px 12px', border: exportPerioadaRapoarte === p ? '1.5px solid #16705a' : '0.5px solid #e5e7eb', borderRadius:'6px', fontSize:'12px', cursor:'pointer', color: exportPerioadaRapoarte === p ? '#085041' : '#111', background: exportPerioadaRapoarte === p ? '#E1F5EE' : 'white', fontWeight: exportPerioadaRapoarte === p ? 600 : 400 }}>
                      {p === 'toate' ? 'Toate' : p === '6luni' ? 'Ultimele 6 luni' : 'Ultimul an'}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end', marginTop:'24px', paddingTop:'20px', borderTop:'0.5px solid #e5e7eb' }}>
              <button onClick={() => setModalExport(false)}
                style={{ padding:'9px 18px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#111', cursor:'pointer', fontWeight:500 }}>
                Anulează
              </button>
              <button onClick={async () => {
                const { jsPDF } = await import('jspdf')
                const autoTable = (await import('jspdf-autotable')).default
                const doc = new jsPDF()
                doc.setFontSize(18)
                doc.text('Dosar Medical Personal', 14, 20)
                doc.setFontSize(11)
                doc.setTextColor(100)
                doc.text('Generat: ' + new Date().toLocaleDateString('ro-RO'), 14, 30)
                doc.setFontSize(14)
                doc.setTextColor(0)
                doc.text('Date de urgenta', 14, 42)
                autoTable(doc, {
                  startY: 47,
                  head: [['Camp', 'Valoare']],
                  body: [
                    ['Grup sanguin', profil?.grup_sanguin || '-'],
                    ['Alergii medicamente', profil?.alergii_medicamente || '-'],
                    ['Alergii alimentare', profil?.alergii_alimentare || '-'],
                    ['Boli cronice', profil?.boli_cronice || '-'],
                  ],
                  styles: { fontSize: 10 },
                  headStyles: { fillColor: [22, 112, 90] },
                })
                let y = (doc as any).lastAutoTable.finalY + 15
                if (exportRapoarte && rapoarte.length > 0) {
                  autoTable(doc, {
                    startY: y,
                    head: [['Data', 'Tip', 'Medic', 'Specialitate', 'Unitate', 'Diagnostic']],
                    body: rapoarte.map((r: any) => [r.data_raport || '-', r.categorie || '-', r.medic || '-', r.specialitate || '-', r.unitate || '-', r.diagnostic || '-']),
                    styles: { fontSize: 9 },
                    headStyles: { fillColor: [22, 112, 90] },
                  })
                }
                doc.save('dosar-medical.pdf')
                setModalExport(false)
              }} style={{ padding:'9px 20px', background:'#16705a', color:'white', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>
                📄 Exportă PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}