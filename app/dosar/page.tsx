'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Dosar() {
  const [user, setUser] = useState<any>(null)
  const [profil, setProfil] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dropdown, setDropdown] = useState(false)
  const [cautare, setCautare] = useState('')
  const [filtruCategorie, setFiltruCategorie] = useState('toate')
  const [filtruPerioda, setFiltruPerioda] = useState('30')
  const router = useRouter()

  const rapoarte = [
    { id:1, data:'2026-07-12', tip:'specialist', medic:'Dr. Ionescu Maria', specialitate:'Endocrinologie', unitate:'Medicover București', diagnostic:'Hipotiroidism', pdf:null },
    { id:2, data:'2026-07-08', tip:'familie', medic:'Dr. Popescu Ion', specialitate:'Medicina generală', unitate:'Cabinet Dr. Popescu', diagnostic:'Infecție respiratorie', pdf:null },
    { id:3, data:'2026-07-02', tip:'externare', medic:'Dr. Dumitrescu Andrei', specialitate:'Chirurgie', unitate:'Spitalul Fundeni', diagnostic:'Colecistită acută', pdf:null },
    { id:4, data:'2026-07-01', tip:'interventie', medic:'Dr. Constantin Mihai', specialitate:'Chirurgie', unitate:'Spitalul Colentina', diagnostic:'Colecistectomie laparoscopică', pdf:null },
  ]

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

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}><p style={{ color:'#888', fontSize:'14px' }}>Se încarcă...</p></div>

  const username = profil?.prenume || user?.email?.split('@')[0]
  const navStyle: React.CSSProperties = { padding:'6px 10px', borderRadius:'8px', fontSize:'13px', color:'#111', textDecoration:'none', fontWeight:500 }

  const tipLabel: Record<string, string> = { familie:'Familie', specialist:'Specialist', interventie:'Intervenție', externare:'Externare' }
  const tipColor: Record<string, { bg: string, color: string }> = {
    familie: { bg:'#E1F5EE', color:'#085041' },
    specialist: { bg:'#EEF2FF', color:'#4338CA' },
    interventie: { bg:'#FEF3C7', color:'#B45309' },
    externare: { bg:'#FCE7F3', color:'#9D174D' },
  }

  const rapoarteFiltrate = rapoarte.filter(r => {
    const matchCategorie = filtruCategorie === 'toate' || r.tip === filtruCategorie
    const matchCautare = cautare === '' ||
      r.medic.toLowerCase().includes(cautare.toLowerCase()) ||
      r.unitate.toLowerCase().includes(cautare.toLowerCase()) ||
      r.diagnostic.toLowerCase().includes(cautare.toLowerCase()) ||
      r.specialitate.toLowerCase().includes(cautare.toLowerCase())
    return matchCategorie && matchCautare
  })

  const counts = {
    familie: rapoarte.filter(r => r.tip === 'familie').length,
    specialist: rapoarte.filter(r => r.tip === 'specialist').length,
    interventie: rapoarte.filter(r => r.tip === 'interventie').length,
    externare: rapoarte.filter(r => r.tip === 'externare').length,
  }

  // Iconițe minimaliste (emoji-uri) – exact ca în dashboard
  const casete = [
    { key:'familie', label:'Medic de familie', sub:'Consultații, rețete și trimiteri', icon:'❤️', bg:'#E1F5EE' },
    { key:'specialist', label:'Medic specialist', sub:'Consultații și rapoarte specialiști', icon:'🩺', bg:'#EEF2FF' },
    { key:'interventie', label:'Raport intervenție medicală', sub:'Intervenții chirurgicale și proceduri', icon:'🔬', bg:'#FEF3C7' },
    { key:'externare', label:'Scrisoare de externare', sub:'Scrisori cu analize, concluzii și investigații', icon:'📄', bg:'#FCE7F3' },
  ]

  // Stiluri tabel – identice cu dashboard
  const thStyle: React.CSSProperties = { padding:'8px 12px', textAlign:'left' as const, fontSize:'11px', fontWeight:500, color:'#555', textTransform:'uppercase' as const, letterSpacing:'0.5px', borderBottom:'0.5px solid #e5e7eb', background:'#f8f9fa', cursor:'pointer', whiteSpace:'nowrap' as const }
  const tdStyle: React.CSSProperties = { padding:'10px 12px', fontSize:'13px', color:'#111', borderBottom:'0.5px solid #f5f5f5', verticalAlign:'middle' as const }

  return (
    <div style={{ fontFamily:'system-ui,-apple-system,sans-serif', background:'#f8f9fa', minHeight:'100vh' }}>

      {/* Topbar – identic cu dashboard */}
      <div style={{ background:'white', borderBottom:'0.5px solid #e5e7eb', padding:'0 24px', height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:10 }}>
        <Link href="/dashboard" style={{ display:'flex', alignItems:'center', gap:'10px', textDecoration:'none' }}>
          <div style={{ width:'32px', height:'32px', background:'#E1F5EE', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', color:'#0F6E56', fontSize:'16px', fontWeight:600 }}>✚</div>
          <span style={{ fontSize:'18px', fontWeight:600, color:'#111' }}>MediPanel</span>
        </Link>
        <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
          <Link href="/dashboard" style={navStyle}>Home</Link>
          <Link href="/panoramic" style={navStyle}>Panoramic</Link>
          <Link href="/urgenta" style={navStyle}>Urgență</Link>
          <Link href="/dosar" style={{ ...navStyle, background:'#E1F5EE', color:'#085041' }}>Dosar</Link>
          <Link href="/upload" style={{ ...navStyle, background:'#16705a', color:'white', padding:'6px 14px', marginLeft:'4px' }}>+ Adaugă</Link>
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

      <div style={{ maxWidth:'960px', margin:'0 auto', padding:'28px 24px' }}>

        {/* Header – ca în dashboard */}
        <div style={{ fontSize:'20px', fontWeight:500, color:'#111', marginBottom:'4px' }}>Dosarul meu medical</div>
        <div style={{ fontSize:'13px', color:'#888', marginBottom:'24px' }}>Toate rapoartele, consultațiile și documentele tale medicale.</div>

        {/* 4 CASETE – stil identic cu dashboard (iconiță stânga, text lângă) */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'28px' }}>
          {casete.map(c => {
            const isActive = filtruCategorie === c.key
            return (
              <div
                key={c.key}
                onClick={() => setFiltruCategorie(isActive ? 'toate' : c.key)}
                style={{
                  background:'white',
                  border: isActive ? '2px solid #16705a' : '0.5px solid #e5e7eb',
                  borderRadius:'12px',
                  padding:'16px 18px',
                  cursor:'pointer',
                  display:'flex',
                  alignItems:'center',
                  gap:'14px',
                  transition:'all 0.15s ease',
                  boxShadow: isActive ? '0 4px 16px rgba(22,112,90,0.10)' : '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{
                  width:'44px',
                  height:'44px',
                  borderRadius:'10px',
                  background: isActive ? '#16705a' : c.bg,
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  color: isActive ? 'white' : '#111',
                  fontSize:'22px',
                  flexShrink:0,
                  transition:'all 0.15s ease'
                }}>
                  {c.icon}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'14px', fontWeight:500, color:'#111' }}>{c.label}</div>
                  <div style={{ fontSize:'12px', color:'#555', lineHeight:1.5 }}>{c.sub}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginTop:'4px' }}>
                    <span style={{ display:'inline-flex', padding:'2px 10px', background:'#E1F5EE', color:'#085041', borderRadius:'12px', fontSize:'11px', fontWeight:500 }}>
                      {counts[c.key as keyof typeof counts]} rapoarte
                    </span>
                    <span style={{ fontSize:'12px', color:'#16705a', fontWeight:500 }}>Vezi toate →</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bara filtre – mai mică, ca în dashboard */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:'10px', alignItems:'center', marginBottom:'16px', background:'white', padding:'12px 16px', borderRadius:'12px', border:'0.5px solid #e5e7eb' }}>
          <input
            value={cautare}
            onChange={e => setCautare(e.target.value)}
            placeholder="🔍 Caută medic, clinică, diagnostic..."
            style={{ flex:1, minWidth:'180px', padding:'8px 12px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', background:'#f8f9fa', outline:'none', color:'#111' }}
          />
          <select
            value={filtruCategorie}
            onChange={e => setFiltruCategorie(e.target.value)}
            style={{ padding:'6px 12px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', background:'white', color:'#111', cursor:'pointer' }}
          >
            <option value="toate">Toate categoriile</option>
            <option value="familie">Medic familie</option>
            <option value="specialist">Specialist</option>
            <option value="interventie">Intervenție</option>
            <option value="externare">Externare</option>
          </select>
          <select
            value={filtruPerioda}
            onChange={e => setFiltruPerioda(e.target.value)}
            style={{ padding:'6px 12px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', background:'white', color:'#111', cursor:'pointer' }}
          >
            <option value="30">Ultimele 30 zile</option>
            <option value="90">Ultimele 3 luni</option>
            <option value="365">Ultimul an</option>
            <option value="toate">Toate</option>
          </select>
        </div>

        {/* TABEL – identic cu dashboard */}
        <div style={{ background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Data ↕</th>
                <th style={thStyle}>Tip</th>
                <th style={thStyle}>Medic ↕</th>
                <th style={thStyle}>Specialitate ↕</th>
                <th style={thStyle}>Unitate medicală ↕</th>
                <th style={thStyle}>Diagnostic</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {rapoarteFiltrate.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign:'center', padding:'32px', color:'#aaa', fontSize:'13px' }}>Niciun raport găsit.</td></tr>
              ) : rapoarteFiltrate.map((r, i) => (
                <tr
                  key={r.id}
                  style={{ background:'white' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f8f9fa')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                >
                  <td style={{ ...tdStyle, borderBottom: i < rapoarteFiltrate.length - 1 ? '0.5px solid #e5e7eb' : 'none' }}>
                    {new Date(r.data).toLocaleDateString('ro-RO', { day:'numeric', month:'short', year:'numeric' })}
                  </td>
                  <td style={{ ...tdStyle, borderBottom: i < rapoarteFiltrate.length - 1 ? '0.5px solid #e5e7eb' : 'none' }}>
                    <span style={{ padding:'3px 10px', borderRadius:'10px', fontSize:'11px', fontWeight:500, background:tipColor[r.tip].bg, color:tipColor[r.tip].color }}>
                      {tipLabel[r.tip]}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, borderBottom: i < rapoarteFiltrate.length - 1 ? '0.5px solid #e5e7eb' : 'none' }}>{r.medic}</td>
                  <td style={{ ...tdStyle, borderBottom: i < rapoarteFiltrate.length - 1 ? '0.5px solid #e5e7eb' : 'none' }}>{r.specialitate}</td>
                  <td style={{ ...tdStyle, borderBottom: i < rapoarteFiltrate.length - 1 ? '0.5px solid #e5e7eb' : 'none' }}>{r.unitate}</td>
                  <td style={{ ...tdStyle, borderBottom: i < rapoarteFiltrate.length - 1 ? '0.5px solid #e5e7eb' : 'none', color:'#555' }}>{r.diagnostic}</td>
                  <td style={{ ...tdStyle, borderBottom: i < rapoarteFiltrate.length - 1 ? '0.5px solid #e5e7eb' : 'none' }}>
                    <span style={{ fontSize:'12px', color:'#16705a', fontWeight:500, cursor:'pointer' }}>📄 PDF</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}