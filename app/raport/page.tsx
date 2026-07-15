'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Raport() {
  const [user, setUser] = useState<any>(null)
  const [profil, setProfil] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [salvare, setSalvare] = useState(false)
  const [mesaj, setMesaj] = useState('')
  const [dropdown, setDropdown] = useState(false)
  const router = useRouter()

  const [fisier, setFisier] = useState<File | null>(null)
  const [categorie, setCategorie] = useState('')
  const [dataRaport, setDataRaport] = useState('')
  const [medic, setMedic] = useState('')
  const [specialitate, setSpecialitate] = useState('')
  const [unitate, setUnitate] = useState('')
  const [diagnostic, setDiagnostic] = useState('')
  const [extragere, setExtragere] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      const { data } = await supabase.from('profiluri').select('prenume, nume').eq('id', session.user.id).single()
      setProfil(data)
      setLoading(false)
    })
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  async function handleExtragere() {
    if (!fisier) return
    setExtragere(true)
    setMesaj('Se extrag datele din PDF...')
    // TODO: extragere AI
    setTimeout(() => {
      setMedic('Dr. Ionescu Maria')
      setSpecialitate('Endocrinologie')
      setUnitate('Medicover București')
      setDiagnostic('Hipotiroidism')
      setDataRaport('2026-07-12')
      setMesaj('Date extrase cu succes. Verifică și completează.')
      setExtragere(false)
    }, 1500)
  }

  async function handleSalvare() {
    if (!categorie) { setMesaj('Selectează categoria raportului.'); return }
    setSalvare(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    let pdfUrl = null
    let pdfNume = null
    if (fisier) {
      const cale = `${session.user.id}/rapoarte/${Date.now()}_${fisier.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage.from('documente').upload(cale, fisier, { contentType: 'application/pdf' })
      if (!uploadError && uploadData) { pdfUrl = cale; pdfNume = fisier.name }
    }

    const { error } = await supabase.from('rapoarte').insert({
      user_id: session.user.id,
      categorie,
      data_raport: dataRaport || null,
      medic: medic || null,
      specialitate: specialitate || null,
      unitate: unitate || null,
      diagnostic: diagnostic || null,
      pdf_url: pdfUrl,
      pdf_nume: pdfNume,
    })

    if (error) { setMesaj('Eroare: ' + error.message); setSalvare(false); return }
    router.push('/dosar')
  }

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}><p>Se încarcă...</p></div>

  const username = profil?.prenume || user?.email?.split('@')[0]
  const navStyle: React.CSSProperties = { padding:'6px 10px', borderRadius:'8px', fontSize:'13px', color:'#111', textDecoration:'none', fontWeight:500 }
  const inp: React.CSSProperties = { width:'100%', padding:'9px 13px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#111', background:'white', outline:'none', fontFamily:'system-ui', boxSizing:'border-box' as const }
  const lbl: React.CSSProperties = { display:'block', fontSize:'12px', fontWeight:500, color:'#555', marginBottom:'5px' }
  const g2: React.CSSProperties = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'14px' }

  const categorii = [
    { key:'familie', label:'Medic de familie' },
    { key:'specialist', label:'Medic specialist' },
    { key:'interventie', label:'Raport intervenție medicală' },
    { key:'externare', label:'Scrisoare de externare' },
  ]

  return (
    <div style={{ fontFamily:'system-ui,-apple-system,sans-serif', background:'#f8f9fa', minHeight:'100vh' }}>

      {/* Topbar */}
      <div style={{ background:'white', borderBottom:'0.5px solid #e5e7eb', padding:'0 24px', height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:10 }}>
        <Link href="/dashboard" style={{ display:'flex', alignItems:'center', gap:'10px', textDecoration:'none' }}>
          <div style={{ width:'32px', height:'32px', background:'#E1F5EE', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', color:'#0F6E56', fontSize:'16px', fontWeight:600 }}>✚</div>
          <span style={{ fontSize:'18px', fontWeight:600, color:'#111' }}>MediPanel</span>
        </Link>
        <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
          <Link href="/dashboard" style={navStyle}>Home</Link>
          <Link href="/panoramic" style={navStyle}>Panoramic</Link>
          <Link href="/urgenta" style={navStyle}>Urgență</Link>
          <Link href="/dosar" style={navStyle}>Dosar</Link>
          <div style={{ position:'relative', marginLeft:'8px' }}>
            <button onClick={() => setDropdown(!dropdown)} style={{ padding:'6px 12px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#111', background:'white', cursor:'pointer', fontWeight:500 }}>{username} ▾</button>
            {dropdown && (
              <div style={{ position:'absolute', right:0, top:'36px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', padding:'4px', minWidth:'140px', boxShadow:'0 4px 12px rgba(0,0,0,0.08)', zIndex:100 }}>
                <Link href="/profil" style={{ display:'block', padding:'8px 12px', fontSize:'13px', color:'#111', textDecoration:'none', borderRadius:'6px' }}>Profil</Link>
                <div onClick={handleLogout} style={{ padding:'8px 12px', fontSize:'13px', color:'#E24B4A', cursor:'pointer', borderRadius:'6px' }}>Ieșire</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:'680px', margin:'0 auto', padding:'32px 24px' }}>

        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'24px' }}>
          <Link href="/dosar" style={{ fontSize:'13px', color:'#16705a', textDecoration:'none', fontWeight:500 }}>← Dosar</Link>
          <div style={{ fontSize:'20px', fontWeight:500, color:'#111' }}>Adaugă raport medical</div>
        </div>

        {mesaj && (
          <div style={{ padding:'12px 16px', borderRadius:'8px', marginBottom:'16px', background: mesaj.includes('Eroare') ? '#FCEBEB' : '#E1F5EE', color: mesaj.includes('Eroare') ? '#A32D2D' : '#0F6E56', fontSize:'13px' }}>
            {mesaj}
          </div>
        )}

        {/* Upload PDF */}
        <div style={{ background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', overflow:'hidden', marginBottom:'14px' }}>
          <div style={{ background:'#16705a', padding:'14px 20px' }}>
            <div style={{ fontSize:'14px', fontWeight:500, color:'white' }}>1. Upload PDF (opțional)</div>
            <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.75)', marginTop:'1px' }}>AI va extrage automat datele din raport</div>
          </div>
          <div style={{ padding:'20px' }}>
            <div onClick={() => document.getElementById('pdf-raport')?.click()}
              style={{ border:'1.5px dashed #e5e7eb', borderRadius:'10px', padding:'24px', textAlign:'center', cursor:'pointer', background:'#f8f9fa' }}>
              <input id="pdf-raport" type="file" accept=".pdf" style={{ display:'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) { setFisier(f); handleExtragere() } }} />
              {fisier ? (
                <div style={{ fontSize:'13px', color:'#16705a', fontWeight:500 }}>✓ {fisier.name}</div>
              ) : (
                <>
                  <div style={{ fontSize:'14px', fontWeight:500, color:'#111', marginBottom:'4px' }}>Trage PDF-ul aici sau apasă pentru a selecta</div>
                  <div style={{ fontSize:'12px', color:'#888' }}>PDF, max 10 MB</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Categorie */}
        <div style={{ background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', overflow:'hidden', marginBottom:'14px' }}>
          <div style={{ background:'#16705a', padding:'14px 20px' }}>
            <div style={{ fontSize:'14px', fontWeight:500, color:'white' }}>2. Selectează categoria</div>
            <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.75)', marginTop:'1px' }}>Alege tipul raportului medical</div>
          </div>
          <div style={{ padding:'20px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
              {categorii.map(c => (
                <div key={c.key} onClick={() => setCategorie(c.key)}
                  style={{ padding:'12px 14px', border: categorie === c.key ? '2px solid #16705a' : '0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color: categorie === c.key ? '#085041' : '#111', background: categorie === c.key ? '#E1F5EE' : 'white', cursor:'pointer', fontWeight: categorie === c.key ? 500 : 400 }}>
                  {c.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Date raport */}
        <div style={{ background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', overflow:'hidden', marginBottom:'14px' }}>
          <div style={{ background:'#16705a', padding:'14px 20px' }}>
            <div style={{ fontSize:'14px', fontWeight:500, color:'white' }}>3. Date raport</div>
            <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.75)', marginTop:'1px' }}>Completează sau verifică datele extrase</div>
          </div>
          <div style={{ padding:'20px' }}>
            <div style={g2}>
              <div><label style={lbl}>Data raportului</label><input type="date" value={dataRaport} onChange={e => setDataRaport(e.target.value)} style={inp} /></div>
              <div><label style={lbl}>Medic</label><input value={medic} onChange={e => setMedic(e.target.value)} placeholder="ex: Dr. Ionescu Maria" style={inp} /></div>
            </div>
            <div style={g2}>
              <div><label style={lbl}>Specialitate</label><input value={specialitate} onChange={e => setSpecialitate(e.target.value)} placeholder="ex: Endocrinologie" style={inp} /></div>
              <div><label style={lbl}>Clinică / Spital</label><input value={unitate} onChange={e => setUnitate(e.target.value)} placeholder="ex: Medicover București" style={inp} /></div>
            </div>
            <div><label style={lbl}>Diagnostic</label><input value={diagnostic} onChange={e => setDiagnostic(e.target.value)} placeholder="ex: Hipotiroidism" style={inp} /></div>
          </div>
        </div>

        <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
          <Link href="/dosar" style={{ padding:'10px 18px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#111', textDecoration:'none', fontWeight:500 }}>Anulează</Link>
          <button onClick={handleSalvare} disabled={salvare}
            style={{ padding:'10px 24px', background:'#16705a', color:'white', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:500, cursor:'pointer' }}>
            {salvare ? 'Se salvează...' : 'Salvează raport'}
          </button>
        </div>

      </div>
    </div>
  )
}