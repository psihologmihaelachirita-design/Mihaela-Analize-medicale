'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IconFileText, IconSearch, IconFilter, IconChevronDown, IconEye, IconDownload } from '@tabler/icons-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Raport = {
  id: string
  user_id: string
  cnp_pacient?: string
  tip: 'familie' | 'specialist' | 'interventie' | 'externare'
  data_raport: string
  nume_medic: string
  specialitate: string
  clinica: string
  diagnostic: string
  medicatie?: string
  pdf_url?: string
  created_at: string
}

type Filtre = {
  search: string
  tip: 'toate' | 'familie' | 'specialist' | 'interventie' | 'externare'
  perioada: '30zile' | '3luni' | '1an' | 'toate'
}

export default function Dosar() {
  const [user, setUser] = useState<any>(null)
  const [profil, setProfil] = useState<any>(null)
  const [rapoarte, setRapoarte] = useState<Raport[]>([])
  const [loading, setLoading] = useState(true)
  const [dropdown, setDropdown] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [modalPdf, setModalPdf] = useState<{ open: boolean; url?: string; nume?: string }>({ open: false })
  const router = useRouter()

  // Filtre
  const [filtre, setFiltre] = useState<Filtre>({
    search: '',
    tip: 'toate',
    perioada: '30zile'
  })

  // Sortare (opțional)
  const [sort, setSort] = useState<{ col: keyof Raport; dir: 'asc' | 'desc' }>({ col: 'data_raport', dir: 'desc' })

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      
      // Preluare profil
      const { data: profilData } = await supabase
        .from('profiluri')
        .select('nume, prenume')
        .eq('id', session.user.id)
        .single()
      setProfil(profilData)

      // Preluare rapoarte
      const { data: rapoarteData } = await supabase
        .from('rapoarte_medicale')
        .select('*')
        .eq('user_id', session.user.id)
        .order('data_raport', { ascending: false })
      setRapoarte(rapoarteData || [])
      setLoading(false)
    })
  }, [router])

  // Funcții de filtrare
  function getRapoarteFiltrate(): Raport[] {
    let rezultat = [...rapoarte]

    // Căutare text liber
    if (filtre.search.trim() !== '') {
      const q = filtre.search.toLowerCase()
      rezultat = rezultat.filter(r =>
        r.nume_medic.toLowerCase().includes(q) ||
        r.clinica.toLowerCase().includes(q) ||
        r.diagnostic.toLowerCase().includes(q) ||
        r.specialitate.toLowerCase().includes(q)
      )
    }

    // Filtru tip
    if (filtre.tip !== 'toate') {
      rezultat = rezultat.filter(r => r.tip === filtre.tip)
    }

    // Filtru perioadă
    if (filtre.perioada !== 'toate') {
      const acum = new Date()
      let dataLimita = new Date()
      if (filtre.perioada === '30zile') dataLimita.setDate(acum.getDate() - 30)
      else if (filtre.perioada === '3luni') dataLimita.setMonth(acum.getMonth() - 3)
      else if (filtre.perioada === '1an') dataLimita.setFullYear(acum.getFullYear() - 1)
      rezultat = rezultat.filter(r => new Date(r.data_raport) >= dataLimita)
    }

    // Sortare
    rezultat.sort((a, b) => {
      const valA = a[sort.col] || ''
      const valB = b[sort.col] || ''
      if (valA < valB) return sort.dir === 'asc' ? -1 : 1
      if (valA > valB) return sort.dir === 'asc' ? 1 : -1
      return 0
    })

    return rezultat
  }

  const rapoarteFiltrate = getRapoarteFiltrate()

  // Statistici pentru casete
  const stats = {
    familie: rapoarte.filter(r => r.tip === 'familie').length,
    specialist: rapoarte.filter(r => r.tip === 'specialist').length,
    interventie: rapoarte.filter(r => r.tip === 'interventie').length,
    externare: rapoarte.filter(r => r.tip === 'externare').length,
  }
  const total = rapoarte.length

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'system-ui'}}>
      <p style={{color:'#111', fontSize:'14px'}}>Se încarcă...</p>
    </div>
  )

  const username = profil?.prenume || user?.email?.split('@')[0] || 'Utilizator'

  const navStyle: React.CSSProperties = { padding:'6px 10px', borderRadius:'8px', fontSize:'13px', color:'#111', textDecoration:'none', fontWeight:500 }

  return (
    <div style={{ fontFamily:'system-ui,-apple-system,sans-serif', background:'#f8f9fa', minHeight:'100vh' }} onClick={() => { setDropdown(false); setMobileMenu(false) }}>

      {/* Topbar */}
      <div style={{ background:'white', borderBottom:'0.5px solid #e5e7eb', padding:'0 24px', height:'60px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:10 }}>
        <Link href="/dashboard" style={{ display:'flex', alignItems:'center', gap:'10px', textDecoration:'none' }}>
          <div style={{ width:'36px', height:'36px', background:'#E1F5EE', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', color:'#0F6E56', fontSize:'18px', fontWeight:600 }}>✚</div>
          <span style={{ fontSize:'20px', fontWeight:600, color:'#111' }}>MedFile</span>
        </Link>

        <div style={{ display:'flex', alignItems:'center', gap:'4px' }} className="desktop-nav">
          <Link href="/dashboard" style={navStyle}>Home</Link>
          <Link href="/panoramic" style={navStyle}>Panoramic</Link>
          <Link href="/urgenta" style={navStyle}>Urgență</Link>
          <Link href="/dosar" style={{ ...navStyle, background:'#E1F5EE', color:'#085041' }}>Dosar</Link>
          <Link href="/upload" style={{ ...navStyle, background:'#16705a', color:'white', padding:'6px 14px', marginLeft:'4px' }}>+ Adaugă</Link>
          <div style={{ position:'relative', marginLeft:'8px' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setDropdown(!dropdown)} style={{ padding:'6px 12px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#111', background:'white', cursor:'pointer', fontWeight:500 }}>
              {username} ▾
            </button>
            {dropdown && (
              <div style={{ position:'absolute', right:0, top:'36px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', padding:'4px', minWidth:'140px', boxShadow:'0 4px 12px rgba(0,0,0,0.08)', zIndex:100 }}>
                <Link href="/profil" style={{ display:'block', padding:'8px 12px', fontSize:'13px', color:'#111', textDecoration:'none', borderRadius:'6px' }}>Profil</Link>
                <div onClick={handleLogout} style={{ padding:'8px 12px', fontSize:'13px', color:'#ed1f37', cursor:'pointer', borderRadius:'6px' }}>Ieșire</div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile hamburger */}
        <button onClick={e => { e.stopPropagation(); setMobileMenu(!mobileMenu) }} style={{ display:'none', border:'none', background:'none', cursor:'pointer', padding:'4px' }} className="mobile-menu-btn" aria-label="Meniu">
          <div style={{ width:'22px', height:'2px', background:'#111', borderRadius:'2px', marginBottom:'5px' }}></div>
          <div style={{ width:'22px', height:'2px', background:'#111', borderRadius:'2px', marginBottom:'5px' }}></div>
          <div style={{ width:'22px', height:'2px', background:'#111', borderRadius:'2px' }}></div>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenu && (
        <div onClick={e => e.stopPropagation()} style={{ background:'white', borderBottom:'0.5px solid #e5e7eb', padding:'12px 16px', display:'flex', flexDirection:'column', gap:'2px', position:'sticky', top:'60px', zIndex:9 }}>
          <Link href="/dashboard" style={{ padding:'10px 12px', fontSize:'14px', color:'#111', textDecoration:'none', fontWeight:500, borderRadius:'8px' }}>Home</Link>
          <Link href="/panoramic" style={{ padding:'10px 12px', fontSize:'14px', color:'#111', textDecoration:'none', fontWeight:500, borderRadius:'8px' }}>Panoramic</Link>
          <Link href="/urgenta" style={{ padding:'10px 12px', fontSize:'14px', color:'#111', textDecoration:'none', fontWeight:500, borderRadius:'8px' }}>Urgență</Link>
          <Link href="/dosar" style={{ padding:'10px 12px', fontSize:'14px', color:'#111', textDecoration:'none', fontWeight:500, borderRadius:'8px', background:'#E1F5EE' }}>Dosar</Link>
          <Link href="/upload" style={{ padding:'10px 12px', fontSize:'14px', color:'white', textDecoration:'none', fontWeight:500, borderRadius:'8px', background:'#16705a', textAlign:'center', marginTop:'4px' }}>+ Adaugă</Link>
          <Link href="/profil" style={{ padding:'10px 12px', fontSize:'14px', color:'#111', textDecoration:'none', fontWeight:500, borderRadius:'8px' }}>Cont</Link>
          <div onClick={handleLogout} style={{ padding:'10px 12px', fontSize:'14px', color:'#aa1426', cursor:'pointer', fontWeight:500, borderRadius:'8px' }}>Ieșire</div>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; flex-direction: column; }
        }
      `}</style>

      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'24px' }}>

        {/* 4 casete clickabile */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'14px', marginBottom:'24px' }}>
          {[
            { key: 'familie', label: 'Medic de familie', count: stats.familie, icon: '👨‍⚕️', color: '#085041', bg: '#E1F5EE' },
            { key: 'specialist', label: 'Medic specialist', count: stats.specialist, icon: '🩺', color: '#2563eb', bg: '#EFF6FF' },
            { key: 'interventie', label: 'Intervenții', count: stats.interventie, icon: '🔬', color: '#7c3aed', bg: '#F5F3FF' },
            { key: 'externare', label: 'Externări', count: stats.externare, icon: '🏥', color: '#b45309', bg: '#FFFBEB' },
          ].map((card) => (
            <div
              key={card.key}
              onClick={() => setFiltre(prev => ({ ...prev, tip: card.key as any }))}
              style={{
                background: 'white',
                border: filtre.tip === card.key ? `2px solid ${card.color}` : '0.5px solid #e5e7eb',
                borderRadius: '12px',
                padding: '16px 18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
                boxShadow: filtre.tip === card.key ? `0 0 0 3px ${card.bg}` : 'none'
              }}
            >
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <div style={{ width:'40px', height:'40px', borderRadius:'10px', background: card.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px' }}>
                  {card.icon}
                </div>
                <div>
                  <div style={{ fontSize:'13px', color:'#555', fontWeight:500 }}>{card.label}</div>
                  <div style={{ fontSize:'24px', fontWeight:600, color:'#111' }}>{card.count}</div>
                </div>
              </div>
              <div style={{ fontSize:'12px', color: card.color, fontWeight:500 }}>
                {filtre.tip === card.key ? '✓' : '→'}
              </div>
            </div>
          ))}
        </div>

        {/* Bara de filtre + căutare */}
        <div style={{ background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', padding:'16px 20px', marginBottom:'16px' }}>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'12px', alignItems:'center' }}>
            {/* Căutare */}
            <div style={{ flex:1, minWidth:'180px', display:'flex', alignItems:'center', background:'#f8f9fa', borderRadius:'8px', padding:'0 12px', border:'0.5px solid #e5e7eb' }}>
              <IconSearch size={16} color="#888" />
              <input
                type="text"
                placeholder="Caută medic, clinică, diagnostic..."
                value={filtre.search}
                onChange={e => setFiltre(prev => ({ ...prev, search: e.target.value }))}
                style={{ width:'100%', padding:'10px 10px', border:'none', background:'transparent', fontSize:'14px', outline:'none', color:'#111' }}
              />
            </div>

            {/* Filtru tip (dropdown) */}
            <div style={{ position:'relative' }}>
              <select
                value={filtre.tip}
                onChange={e => setFiltre(prev => ({ ...prev, tip: e.target.value as any }))}
                style={{ padding:'10px 32px 10px 14px', borderRadius:'8px', border:'0.5px solid #e5e7eb', background:'#f8f9fa', fontSize:'13px', appearance:'none', cursor:'pointer', color:'#111' }}
              >
                <option value="toate">Toate categoriile</option>
                <option value="familie">Medic de familie</option>
                <option value="specialist">Medic specialist</option>
                <option value="interventie">Intervenții</option>
                <option value="externare">Externări</option>
              </select>
              <IconChevronDown size={14} color="#888" style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
            </div>

            {/* Filtru perioadă */}
            <div style={{ position:'relative' }}>
              <select
                value={filtre.perioada}
                onChange={e => setFiltre(prev => ({ ...prev, perioada: e.target.value as any }))}
                style={{ padding:'10px 32px 10px 14px', borderRadius:'8px', border:'0.5px solid #e5e7eb', background:'#f8f9fa', fontSize:'13px', appearance:'none', cursor:'pointer', color:'#111' }}
              >
                <option value="30zile">Ultimele 30 zile</option>
                <option value="3luni">Ultimele 3 luni</option>
                <option value="1an">Ultimul an</option>
                <option value="toate">Toate</option>
              </select>
              <IconChevronDown size={14} color="#888" style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
            </div>

            {/* Reset filtru */}
            <button
              onClick={() => setFiltre({ search: '', tip: 'toate', perioada: '30zile' })}
              style={{ padding:'8px 16px', border:'0.5px solid #e5e7eb', borderRadius:'8px', background:'white', fontSize:'13px', cursor:'pointer', color:'#555' }}
            >
              Resetează
            </button>

            <div style={{ marginLeft:'auto', fontSize:'13px', color:'#888' }}>
              {rapoarteFiltrate.length} rapoarte
            </div>
          </div>
        </div>

        {/* Tabel */}
        <div style={{ background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', overflow:'hidden' }}>
          {rapoarteFiltrate.length === 0 ? (
            <div style={{ padding:'40px 20px', textAlign:'center', color:'#888', fontSize:'14px' }}>
              Nu există rapoarte în această categorie sau perioadă.
              <br />
              <Link href="/upload" style={{ color:'#16705a', fontWeight:500, textDecoration:'none' }}>Adaugă primul raport →</Link>
            </div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
                <thead>
                  <tr style={{ background:'#f8f9fa', borderBottom:'0.5px solid #e5e7eb' }}>
                    {['Data', 'Tip', 'Medic', 'Specialitate', 'Unitate medicală', 'Diagnostic', ''].map((label, idx) => (
                      <th key={idx} style={{ padding:'12px 16px', textAlign:'left', fontWeight:500, color:'#555', whiteSpace:'nowrap', cursor:'pointer' }}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rapoarteFiltrate.map((r, idx) => (
                    <tr
                      key={r.id}
                      onClick={() => r.pdf_url && setModalPdf({ open: true, url: r.pdf_url, nume: r.nume_medic })}
                      style={{
                        borderBottom: idx < rapoarteFiltrate.length - 1 ? '0.5px solid #f0f0f0' : 'none',
                        cursor: r.pdf_url ? 'pointer' : 'default',
                        transition: 'background 0.1s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <td style={{ padding:'12px 16px', color:'#111' }}>{new Date(r.data_raport).toLocaleDateString('ro-RO')}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <span style={{
                          display:'inline-block',
                          padding:'2px 10px',
                          borderRadius:'12px',
                          fontSize:'11px',
                          fontWeight:500,
                          background: r.tip === 'familie' ? '#E1F5EE' : r.tip === 'specialist' ? '#EFF6FF' : r.tip === 'interventie' ? '#F5F3FF' : '#FFFBEB',
                          color: r.tip === 'familie' ? '#085041' : r.tip === 'specialist' ? '#2563eb' : r.tip === 'interventie' ? '#7c3aed' : '#b45309'
                        }}>
                          {r.tip === 'familie' ? 'Familie' : r.tip === 'specialist' ? 'Specialist' : r.tip === 'interventie' ? 'Intervenție' : 'Externare'}
                        </span>
                      </td>
                      <td style={{ padding:'12px 16px', color:'#111', fontWeight:500 }}>{r.nume_medic}</td>
                      <td style={{ padding:'12px 16px', color:'#555' }}>{r.specialitate}</td>
                      <td style={{ padding:'12px 16px', color:'#555' }}>{r.clinica}</td>
                      <td style={{ padding:'12px 16px', color:'#111' }}>{r.diagnostic}</td>
                      <td style={{ padding:'12px 16px', textAlign:'center' }}>
                        {r.pdf_url ? (
                          <div style={{ display:'flex', gap:'6px', justifyContent:'center' }}>
                            <IconEye size={16} color="#16705a" style={{ cursor:'pointer' }} title="Vizualizează PDF" />
                            <IconDownload size={16} color="#555" style={{ cursor:'pointer' }} title="Descarcă PDF" onClick={(e) => { e.stopPropagation(); window.open(r.pdf_url, '_blank') }} />
                          </div>
                        ) : (
                          <span style={{ fontSize:'11px', color:'#aaa' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal PDF */}
      {modalPdf.open && modalPdf.url && (
        <div
          onClick={() => setModalPdf({ open: false })}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '800px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '0.5px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#111' }}>Raport - {modalPdf.nume || 'PDF'}</span>
              <button onClick={() => setModalPdf({ open: false })} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#111' }}>✕</button>
            </div>
            <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
              <iframe src={modalPdf.url} style={{ width: '100%', height: '600px', border: 'none', borderRadius: '8px' }} />
            </div>
          </div>
        </div>
      )}

    </div>
  )
}