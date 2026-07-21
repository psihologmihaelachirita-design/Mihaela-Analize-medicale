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
  const [dropdown, setDropdown] = useState(false)
  const [cautare, setCautare] = useState('')
  const [filtruCategorie, setFiltruCategorie] = useState('toate')
  const [filtruPerioda, setFiltruPerioda] = useState('30')
  const router = useRouter()

  const [rapoarte, setRapoarte] = useState<any[]>([])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      const { data } = await supabase.from('profiluri').select('prenume, nume').eq('id', session.user.id).single()
      setProfil(data)
      const profilActiv = JSON.parse(localStorage.getItem('profilActiv') || '{}')
      const eApartinator = profilActiv?.tip === 'apartinator' && profilActiv?.id
      const { data: rapoarteData } = eApartinator
        ? await supabase.from('rapoarte').select('*').eq('apartinator_id', profilActiv.id).order('data_raport', { ascending: false })
        : await supabase.from('rapoarte').select('*').eq('user_id', session.user.id).order('data_raport', { ascending: false })
      setRapoarte(rapoarteData || [])
      setLoading(false)
    })
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}><p style={{ color:'#111', fontSize:'18px' }}>Se încarcă...</p></div>

  const username = profil?.prenume || user?.email?.split('@')[0]
  const navStyle: React.CSSProperties = { padding:'8px 14px', borderRadius:'8px', fontSize:'15px', color:'#111', textDecoration:'none', fontWeight:500 }

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
      r.medic.toLowerCase().includes(cautare.toLowerCase()) ||
      r.unitate.toLowerCase().includes(cautare.toLowerCase()) ||
      r.diagnostic.toLowerCase().includes(cautare.toLowerCase()) ||
      r.specialitate.toLowerCase().includes(cautare.toLowerCase())
    return matchCategorie && matchCautare
  })

  const counts = {
    familie: rapoarte.filter(r => r.tip === 'familie').length,
    specialist: rapoarte.filter(r => r.categorie === 'specialist').length,
    interventie: rapoarte.filter(r => r.tip === 'interventie').length,
    externare: rapoarte.filter(r => r.tip === 'externare').length,
  }

  // ICONIȚE ALBE PE FUNDAL VERDE
  const casete = [
    { key:'familie', label:'Medic de familie', sub:'Consultații, rețete și trimiteri', icon: IconUserHeart, bg:'#E1F5EE' },
    { key:'specialist', label:'Medic specialist', sub:'Consultații și rapoarte specialiști', icon: IconStethoscope, bg:'#EEF2FF' },
    { key:'interventie', label:'Raport intervenție medicală', sub:'Intervenții chirurgicale și proceduri', icon: IconScissors, bg:'#FEF3C7' },
    { key:'externare', label:'Scrisoare de externare', sub:'Scrisori cu analize, concluzii și investigații', icon: IconFileText, bg:'#FCE7F3' },
  ]

  // Stiluri îmbunătățite
  const thStyle: React.CSSProperties = { 
    padding:'14px 18px', 
    textAlign:'left' as const, 
    fontSize:'13px', 
    fontWeight:600, 
    color:'#475569', 
    textTransform:'uppercase' as const, 
    letterSpacing:'0.5px', 
    borderBottom:'1px solid #e5e7eb', 
    background:'#f8fafc', 
    cursor:'pointer', 
    whiteSpace:'nowrap' as const 
  }
  
  const tdStyle: React.CSSProperties = { 
    padding:'16px 18px', 
    fontSize:'14px', 
    color:'#1e293b', 
    borderBottom:'1px solid #f0f0f0', 
    verticalAlign:'middle' as const,
    lineHeight: '1.5'
  }

  return (
    <div style={{ fontFamily:'system-ui,-apple-system,sans-serif', background:'#f8fafc', minHeight:'100vh' }}>

      <Topbar username={username} activePage="dosar" onLogout={handleLogout} />

      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'36px 28px' }}>

        {/* Header */}
        <div style={{ fontSize:'28px', fontWeight:600, color:'#0f172a', marginBottom:'6px' }}>Dosarul meu medical</div>
        <div style={{ fontSize:'16px', color:'#64748b', marginBottom:'32px' }}>Toate rapoartele, consultațiile și documentele tale medicale.</div>

        {/* 4 CASETE - ICONIȚE ALBE PE FUNDAL VERDE */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'36px' }}>
          {casete.map(c => {
            const isActive = filtruCategorie === c.key
            const IconComponent = c.icon
            return (
              <div 
                key={c.key} 
                onClick={() => setFiltruCategorie(c.key === filtruCategorie ? 'toate' : c.key)}
                style={{ 
                  background:'white', 
                  border: isActive ? '2px solid #16705a' : '1px solid #e5e7eb', 
                  borderRadius:'16px', 
                  padding:'24px 22px', 
                  cursor:'pointer', 
                  display:'flex', 
                  flexDirection:'column', 
                  alignItems:'center',
                  textAlign:'center',
                  gap:'8px',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 4px 16px rgba(22, 112, 90, 0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ 
                  width:'52px', 
                  height:'52px', 
                  background:'#16705a', 
                  borderRadius:'14px', 
                  display:'flex', 
                  alignItems:'center', 
                  justifyContent:'center',
                  color:'white'
                }}>
                  <IconComponent size={24} stroke={1.5} color="white" />
                </div>
                <div style={{ fontSize:'18px', fontWeight:700, color:'#0f172a', marginTop:'4px' }}>{c.label}</div>
                <div style={{ fontSize:'14px', color:'#64748b', lineHeight:1.5, maxWidth:'280px' }}>{c.sub}</div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'12px', marginTop:'6px' }}>
                  <span style={{ display:'inline-flex', padding:'4px 14px', background:'#E1F5EE', color:'#085041', borderRadius:'20px', fontSize:'13px', fontWeight:600 }}>{counts[c.key as keyof typeof counts]} rapoarte</span>
                  <span style={{ fontSize:'14px', color:'#16705a', fontWeight:600 }}>Vezi toate →</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* FILTRE */}
        <div style={{ fontSize:'18px', fontWeight:600, color:'#0f172a', marginBottom:'16px' }}>Rapoarte recente</div>
        <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', alignItems:'center', marginBottom:'16px' }}>
          <input 
            value={cautare} 
            onChange={e => setCautare(e.target.value)} 
            placeholder="🔍 Caută medic, clinică, diagnostic..."
            style={{ padding:'12px 16px', border:'1px solid #e5e7eb', borderRadius:'10px', fontSize:'15px', background:'white', color:'#111', width:'280px', outline:'none', flex: '1 1 200px' }} 
          />
          <select 
            value={filtruCategorie} 
            onChange={e => setFiltruCategorie(e.target.value)}
            style={{ padding:'12px 16px', border:'1px solid #e5e7eb', borderRadius:'10px', fontSize:'15px', background:'white', color:'#111', cursor:'pointer' }}>
            <option value="toate">Toate categoriile</option>
            <option value="familie">Medic familie</option>
            <option value="specialist">Specialist</option>
            <option value="interventie">Intervenție</option>
            <option value="externare">Externare</option>
          </select>
          <select 
            value={filtruPerioda} 
            onChange={e => setFiltruPerioda(e.target.value)}
            style={{ padding:'12px 16px', border:'1px solid #e5e7eb', borderRadius:'10px', fontSize:'15px', background:'white', color:'#111', cursor:'pointer' }}>
            <option value="30">Ultimele 30 zile</option>
            <option value="90">Ultimele 3 luni</option>
            <option value="365">Ultimul an</option>
            <option value="toate">Toate</option>
          </select>
        </div>

        {/* TABEL - ÎMBUNĂTĂȚIT */}
        <div style={{ background:'white', border:'1px solid #e5e7eb', borderRadius:'16px', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
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
                <tr><td colSpan={7} style={{ textAlign:'center', padding:'48px 20px', color:'#94a3b8', fontSize:'15px' }}>Niciun raport găsit.</td></tr>
              ) : rapoarteFiltrate.map((r, i) => (
                <tr key={r.id}
                  style={{ background:'white' }}
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
                    <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                      <button onClick={async () => {
                        if (!confirm('Ștergi acest raport?')) return
                        await supabase.from('rapoarte').delete().eq('id', r.id)
                        setRapoarte(prev => prev.filter(x => x.id !== r.id))
                      }} style={{ padding:'4px 8px', background:'transparent', color:'#000', border:'none', fontSize:'16px', cursor:'pointer', filter:'brightness(0)' }}>
                        🗑
                      </button>
                      {r.pdf_url ? (
                        <span onClick={async () => {
                          const { data } = await supabase.storage.from('documente').createSignedUrl(r.pdf_url, 60)
                          if (data?.signedUrl) window.open(data.signedUrl, '_blank')
                        }} style={{ fontSize:'14px', color:'#16705a', fontWeight:600, cursor:'pointer', padding:'6px 12px', borderRadius:'8px', background:'#f1f5f9', display:'inline-block' }}>
                          📄 PDF
                        </span>
                      ) : <span style={{ fontSize:'13px', color:'#aaa' }}>—</span>}
                    </div>
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