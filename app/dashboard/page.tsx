'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IconChartBar, IconHeartRateMonitor } from '@tabler/icons-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [analize, setAnalize] = useState<any[]>([])
  const [profil, setProfil] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tabPeste, setTabPeste] = useState<'3luni' | '1an'>('3luni')
  const [tabSub, setTabSub] = useState<'3luni' | '1an'>('3luni')
  const [modalPeste, setModalPeste] = useState(false)
  const [modalSub, setModalSub] = useState(false)
  const [modalBuletin, setModalBuletin] = useState(false)
  const [modalBuletinFiltru, setModalBuletinFiltru] = useState<'toate' | 'normal' | 'peste' | 'sub'>('toate')
  const [modalTabPeste, setModalTabPeste] = useState<'3luni' | '1an'>('3luni')
  const [modalTabSub, setModalTabSub] = useState<'3luni' | '1an'>('3luni')
  const [dropdown, setDropdown] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      const { data: analizeData } = await supabase
        .from('analize').select('*').eq('user_id', session.user.id).order('data_analiza', { ascending: false })
      setAnalize(analizeData || [])
      const { data: profilData } = await supabase
        .from('profiluri').select('*').eq('id', session.user.id).single()
      setProfil(profilData)
      setLoading(false)
    })
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'system-ui'}}>
      <p style={{color:'#111', fontSize:'14px'}}>Se încarcă...</p>
    </div>
  )

  const username = profil?.nume || user?.email?.split('@')[0]

  const acum = new Date()
  const acum3luni = new Date(acum); acum3luni.setMonth(acum.getMonth() - 3)
  const acum1an = new Date(acum); acum1an.setFullYear(acum.getFullYear() - 1)

  function filtreazaData(a: any, tab: '3luni' | '1an') {
    const data = new Date(a.data_analiza)
    return tab === '3luni' ? data >= acum3luni : data >= acum1an
  }

  function getLaborator(observatii: string) {
    if (!observatii) return ''
    const match = observatii.match(/Laborator: ([^|]+)/)
    return match ? match[1].trim() : ''
  }

  function getStatus(a: any): string {
    if (a.tip_rezultat === 'calitativ') {
      const txt = (a.rezultat_text || '').toLowerCase()
      if (txt.includes('pozitiv') || txt.includes('prezent') || txt.includes('reactiv')) return 'peste'
      return 'normal'
    }
    const obs = (a.observatii || '').toLowerCase()
    if (obs.includes('status: peste')) return 'peste'
    if (obs.includes('status: sub')) return 'sub'
    if (a.referinta_min !== null && a.referinta_max !== null && a.valoare !== null) {
      const val = parseFloat(a.valoare)
      if (val > a.referinta_max) return 'peste'
      if (val < a.referinta_min) return 'sub'
      return 'normal'
    }
    return 'normal'
  }

  const pesteTot = analize.filter(a => getStatus(a) === 'peste')
  const subTot = analize.filter(a => getStatus(a) === 'sub')
  const pesteLista = pesteTot.filter(a => filtreazaData(a, tabPeste))
  const subLista = subTot.filter(a => filtreazaData(a, tabSub))
  const modalPesteLista = pesteTot.filter(a => filtreazaData(a, modalTabPeste))
  const modalSubLista = subTot.filter(a => filtreazaData(a, modalTabSub))
  const ultimulBuletin = analize[0]
  const ultimaData = ultimulBuletin?.data_analiza
  const buletinAnalize = analize.filter(a => a.data_analiza === ultimaData)
  const buletinNormale = buletinAnalize.filter(a => getStatus(a) === 'normal').length
  const buletinPeste = buletinAnalize.filter(a => getStatus(a) === 'peste').length
  const buletinSub = buletinAnalize.filter(a => getStatus(a) === 'sub').length

  const campuriUrgenta = [
    profil?.grup_sanguin, profil?.alergii_medicamente, profil?.alergii_alimentare,
    profil?.tratamente_cronice, profil?.boli_cronice, profil?.contact_urgenta_nume, profil?.contact_urgenta_telefon,
  ]
  const progres = Math.round((campuriUrgenta.filter(Boolean).length / campuriUrgenta.length) * 100)

  function Badge({ status }: { status: string }) {
    const cfg = status === 'normal'
      ? { bg: '#E1F5EE', color: '#085041', label: '✓ Normal' }
      : status === 'peste'
      ? { bg: '#FCEBEB', color: '#A32D2D', label: '↑ Peste' }
      : { bg: '#FEF3C7', color: '#B45309', label: '↓ Sub' }
    return <span style={{ display:'inline-flex', padding:'3px 10px', background:cfg.bg, color:cfg.color, borderRadius:'12px', fontSize:'11px', fontWeight:500 }}>{cfg.label}</span>
  }

  function ListaAnalize({ lista }: { lista: any[] }) {
    return (
      <div>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:'4px', padding:'8px 12px', borderBottom:'0.5px solid #e5e7eb', background:'#f8f9fa' }}>
          {['Analiză','Valoare','Unitate','Status'].map(h => (
            <div key={h} style={{ fontSize:'11px', fontWeight:500, color:'#111', textTransform:'uppercase', letterSpacing:'0.5px', textAlign: h !== 'Analiză' ? 'right' : 'left' }}>{h}</div>
          ))}
        </div>
        {lista.map((a, i) => (
          <div key={i} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:'4px', padding:'8px 12px', borderBottom:'0.5px solid #f5f5f5', alignItems:'center' }}>
            <div style={{ fontSize:'13px', color:'#111', fontWeight:500 }}>{a.nume_analiza}</div>
            <div style={{ fontSize:'13px', fontWeight:500, color: getStatus(a) === 'peste' ? 'ed1f37' : getStatus(a) === 'sub' ? '#B45309' : '#1D9E75', textAlign:'right' }}>
              {a.tip_rezultat === 'calitativ' ? a.rezultat_text : a.valoare}
            </div>
            <div style={{ fontSize:'12px', color:'#111', textAlign:'right' }}>{a.unitate || '—'}</div>
            <div style={{ textAlign:'right' }}><Badge status={getStatus(a)} /></div>
          </div>
        ))}
      </div>
    )
  }

  function Modal({ title, sub, onClose, tabs, activeTab, setActiveTab, lista }: any) {
    return (
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
        <div onClick={e => e.stopPropagation()} style={{ background:'white', borderRadius:'12px', width:'100%', maxWidth:'640px', maxHeight:'80vh', overflow:'hidden', display:'flex', flexDirection:'column' }}>
          <div style={{ padding:'16px 20px', borderBottom:'0.5px solid #e5e7eb', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
            <div>
              <div style={{ fontSize:'15px', fontWeight:600, color:'#111' }}>{title}</div>
              <div style={{ fontSize:'12px', color:'#111', marginTop:'2px' }}>{sub}</div>
            </div>
            <button onClick={onClose} style={{ border:'none', background:'none', fontSize:'18px', cursor:'pointer', color:'#111' }}>✕</button>
          </div>
          {tabs && (
            <div style={{ display:'flex', borderBottom:'0.5px solid #e5e7eb', flexShrink:0 }}>
              {(['3luni', '1an'] as const).map(t => (
                <div key={t} onClick={() => setActiveTab(t)} style={{ flex:1, padding:'10px', fontSize:'13px', textAlign:'center', cursor:'pointer', color: activeTab===t ? '#16705a' : '#111', fontWeight: activeTab===t ? 500 : 400, borderBottom: activeTab===t ? '2px solid #16705a' : '2px solid transparent' }}>
                  {t === '3luni' ? 'Ultimele 3 luni' : 'Ultimul an'}
                </div>
              ))}
            </div>
          )}
          <div style={{ overflowY:'auto' }}>
            {lista.length === 0 ? (
              <div style={{ padding:'2rem', textAlign:'center', fontSize:'13px', color:'#111' }}>Nicio analiză în această perioadă</div>
            ) : (
              <ListaAnalize lista={lista} />
            )}
          </div>
        </div>
      </div>
    )
  }

  const navStyle: React.CSSProperties = { padding:'6px 10px', borderRadius:'8px', fontSize:'13px', color:'#111', textDecoration:'none', fontWeight:500 }

  return (
    <div style={{ fontFamily:'system-ui,-apple-system,sans-serif', background:'#f8f9fa', minHeight:'100vh' }} onClick={() => { setDropdown(false); setMobileMenu(false) }}>

      {/* Topbar Desktop */}
      <div style={{ background:'white', borderBottom:'0.5px solid #e5e7eb', padding:'0 24px', height:'60px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'36px', height:'36px', background:'#E1F5EE', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', color:'#0F6E56', fontSize:'18px', fontWeight:600 }}>✚</div>
          <span style={{ fontSize:'20px', fontWeight:600, color:'#111' }}>MedFile</span>
        </div>

        {/* Desktop nav */}
        <div style={{ display:'flex', alignItems:'center', gap:'4px' }} className="desktop-nav">
          <Link href="/panoramic" style={navStyle}>Panoramic</Link>
          <Link href="/urgenta" style={navStyle}>Urgență</Link>
          <Link href="/dosar" style={navStyle}>Dosar</Link>
          <Link href="/upload" style={{ ...navStyle, background:'#16705a', color:'white', padding:'6px 14px', marginLeft:'4px' }}>+ Adaugă</Link>
          <div style={{ position:'relative', marginLeft:'8px' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setDropdown(!dropdown)} style={{ padding:'6px 12px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#111', background:'white', cursor:'pointer', fontWeight:500 }}>
              {username} ▾
            </button>
            {dropdown && (
              <div style={{ position:'absolute', right:0, top:'36px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', padding:'4px', minWidth:'140px', boxShadow:'0 4px 12px rgba(0,0,0,0.08)', zIndex:100 }}>
                <Link href="/cont" style={{ display:'block', padding:'8px 12px', fontSize:'13px', color:'#111', textDecoration:'none', borderRadius:'6px' }}>Cont</Link>
                <div onClick={handleLogout} style={{ padding:'8px 12px', fontSize:'13px', color:'#E24B4A', cursor:'pointer', borderRadius:'6px' }}>Ieșire</div>
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
          <Link href="/panoramic" style={{ padding:'10px 12px', fontSize:'14px', color:'#111', textDecoration:'none', fontWeight:500, borderRadius:'8px' }}>Panoramic</Link>
          <Link href="/urgenta" style={{ padding:'10px 12px', fontSize:'14px', color:'#111', textDecoration:'none', fontWeight:500, borderRadius:'8px' }}>Urgență</Link>
          <Link href="/dosar" style={{ padding:'10px 12px', fontSize:'14px', color:'#111', textDecoration:'none', fontWeight:500, borderRadius:'8px' }}>Dosar</Link>
          <Link href="/upload" style={{ padding:'10px 12px', fontSize:'14px', color:'white', textDecoration:'none', fontWeight:500, borderRadius:'8px', background:'#16705a', textAlign:'center', marginTop:'4px' }}>+ Adaugă</Link>
          <Link href="/cont" style={{ padding:'10px 12px', fontSize:'14px', color:'#111', textDecoration:'none', fontWeight:500, borderRadius:'8px' }}>Cont</Link>
          <div onClick={handleLogout} style={{ padding:'10px 12px', fontSize:'14px', color:'#E24B4A', cursor:'pointer', fontWeight:500, borderRadius:'8px' }}>Ieșire</div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; flex-direction: column; }
        }
      `}</style>

      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'24px' }}>

        {/* 2 butoane mari */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'20px' }}>

          {/* Panoramic + actiuni */}
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            <Link href="/panoramic" style={{ textDecoration:'none', background:'#16705a', border:'0.5px solid #111', borderRadius:'12px', padding:'20px', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center' }}>
              <div style={{ width:'44px', height:'44px', borderRadius:'10px', background:'white', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginBottom:'12px' }}>
                <IconChartBar size={22} color="#0F6E56" stroke={1.5} />
              </div>
              <div style={{ fontSize:'15px', fontWeight:700, color:'white', height:'40px', display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1.3 }}>Vizualizare panoramică</div>
              <div style={{ height:'8px' }}></div>
              <div style={{ fontSize:'12px', color:'white', lineHeight:1.4 }}>Toate analizele cross-laborator vizualizate în timp</div>
            </Link>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
              <Link href="/export" style={{ padding:'10px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#111', textDecoration:'none', textAlign:'center', fontWeight:500 }}>↓ Export PDF</Link>
              <Link href="/upload" style={{ padding:'10px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#111', textDecoration:'none', textAlign:'center', fontWeight:500 }}>↑ Adaugă buletin</Link>
            </div>
          </div>

          {/* Urgenta + progres */}
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            <Link href="/urgenta" style={{ textDecoration:'none', background:'#16705a', border:'0.5px solid #111', borderRadius:'12px', padding:'20px', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center' }}>
              <div style={{ width:'44px', height:'44px', borderRadius:'10px', background:'white', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginBottom:'12px' }}>
                <IconHeartRateMonitor size={22} color="#0F6E56" stroke={1.5} />
              </div>
              <div style={{ fontSize:'15px', fontWeight:700, color:'white', height:'40px', display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1.3 }}>Profil de urgență</div>
              <div style={{ height:'8px' }}></div>
              <div style={{ fontSize:'12px', color:'white', lineHeight:1.4 }}>Datele tale critice disponibile instant oricui te tratează</div>
            </Link>
            <Link href="/dosar" style={{ textDecoration:'none', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', padding:'12px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
                <span style={{ fontSize:'12px', fontWeight:500, color:'#111' }}>Dosar urgență</span>
                <span style={{ fontSize:'14px', fontWeight:600, color:'#16705a' }}>{progres}%</span>
              </div>
              <div style={{ height:'4px', background:'#e5e7eb', borderRadius:'2px', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${progres}%`, background:'#16705a', borderRadius:'2px' }}></div>
              </div>
              <div style={{ fontSize:'11px', color:'#111', marginTop:'6px' }}>{progres < 100 ? 'Apasă pentru a completa' : 'Complet ✓'}</div>
            </Link>
          </div>
        </div>

        {/* Analize anormale */}
        <div style={{ fontSize:'11px', fontWeight:500, color:'#111', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:'10px' }}>Analize în afara limitelor normale</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'16px' }}>

          {/* Peste */}
          <div style={{ background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', overflow:'hidden' }}>
            <div style={{ padding:'12px 16px', borderBottom:'0.5px solid #e5e7eb', borderLeft:'3px solid ed1f37', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontSize:'13px', fontWeight:500, color:'#E24B4A' }}>↑ Peste limită</span>
              <span style={{ fontSize:'20px', fontWeight:500, color:'#E24B4A' }}>{pesteTot.length}</span>
            </div>
            <div style={{ display:'flex', borderBottom:'0.5px solid #e5e7eb' }}>
              {(['3luni', '1an'] as const).map(t => (
                <div key={t} onClick={() => { setTabPeste(t); setModalTabPeste(t); setModalPeste(true) }} style={{ flex:1, padding:'8px', fontSize:'12px', textAlign:'center', cursor:'pointer', color: tabPeste===t ? '#16705a' : '#111', fontWeight: tabPeste===t ? 500 : 400, borderBottom: tabPeste===t ? '2px solid #16705a' : '2px solid transparent' }}>
                  {t === '3luni' ? 'Ultimele 3 luni' : 'Ultimul an'}
                </div>
              ))}
            </div>
            <div style={{ maxHeight:'180px', overflowY:'auto' }}>
              {pesteLista.length === 0 ? (
                <div style={{ padding:'16px', textAlign:'center', fontSize:'12px', color:'#111' }}>Nicio analiză în această perioadă</div>
              ) : pesteLista.slice(0, 4).map((a, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 16px', borderBottom:'0.5px solid #f5f5f5' }}>
                  <div>
                    <div style={{ fontSize:'12px', color:'#111' }}>{a.nume_analiza}</div>
                    <div style={{ fontSize:'11px', color:'#111' }}>{a.data_analiza}{getLaborator(a.observatii) ? ` · ${getLaborator(a.observatii)}` : ''}</div>
                  </div>
                  <div style={{ fontSize:'12px', fontWeight:500, color:'#E24B4A' }}>{a.tip_rezultat === 'calitativ' ? a.rezultat_text : `${a.valoare} ${a.unitate || ''}`}</div>
                </div>
              ))}
              {pesteLista.length > 4 && (
                <div onClick={() => setModalPeste(true)} style={{ padding:'8px 16px', fontSize:'12px', color:'#16705a', cursor:'pointer', fontWeight:500, textAlign:'center' }}>
                  + {pesteLista.length - 4} mai multe
                </div>
              )}
            </div>
          </div>

          {/* Sub */}
          <div style={{ background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', overflow:'hidden' }}>
            <div style={{ padding:'12px 16px', borderBottom:'0.5px solid #e5e7eb', borderLeft:'3px solid #B45309', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontSize:'13px', fontWeight:500, color:'#B45309' }}>↓ Sub limită</span>
              <span style={{ fontSize:'20px', fontWeight:500, color:'#B45309' }}>{subTot.length}</span>
            </div>
            <div style={{ display:'flex', borderBottom:'0.5px solid #e5e7eb' }}>
              {(['3luni', '1an'] as const).map(t => (
                <div key={t} onClick={() => { setTabSub(t); setModalTabSub(t); setModalSub(true) }} style={{ flex:1, padding:'8px', fontSize:'12px', textAlign:'center', cursor:'pointer', color: tabSub===t ? '#16705a' : '#111', fontWeight: tabSub===t ? 500 : 400, borderBottom: tabSub===t ? '2px solid #16705a' : '2px solid transparent' }}>
                  {t === '3luni' ? 'Ultimele 3 luni' : 'Ultimul an'}
                </div>
              ))}
            </div>
            <div style={{ maxHeight:'180px', overflowY:'auto' }}>
              {subLista.length === 0 ? (
                <div style={{ padding:'16px', textAlign:'center', fontSize:'12px', color:'#111' }}>Nicio analiză în această perioadă</div>
              ) : subLista.slice(0, 4).map((a, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 16px', borderBottom:'0.5px solid #f5f5f5' }}>
                  <div>
                    <div style={{ fontSize:'12px', color:'#111' }}>{a.nume_analiza}</div>
                    <div style={{ fontSize:'11px', color:'#111' }}>{a.data_analiza}{getLaborator(a.observatii) ? ` · ${getLaborator(a.observatii)}` : ''}</div>
                  </div>
                  <div style={{ fontSize:'12px', fontWeight:500, color:'#B45309' }}>{a.tip_rezultat === 'calitativ' ? a.rezultat_text : `${a.valoare} ${a.unitate || ''}`}</div>
                </div>
              ))}
              {subLista.length > 4 && (
                <div onClick={() => setModalSub(true)} style={{ padding:'8px 16px', fontSize:'12px', color:'#16705a', cursor:'pointer', fontWeight:500, textAlign:'center' }}>
                  + {subLista.length - 4} mai multe
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ultimul buletin */}
        <div onClick={() => { setModalBuletinFiltru('toate'); setModalBuletin(true) }} style={{ background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', padding:'16px', cursor:'pointer' }}>
          <div style={{ fontSize:'11px', color:'#111', textTransform:'uppercase', letterSpacing:'0.5px', fontWeight:500, marginBottom:'8px' }}>Ultimul buletin uploadat</div>
          {ultimulBuletin ? (
            <>
              <div style={{ fontSize:'18px', fontWeight:600, color:'#111', marginBottom:'4px' }}>{getLaborator(ultimulBuletin.observatii) || 'Necunoscut'}</div>
              <div style={{ fontSize:'13px', color:'#111', marginBottom:'4px' }}>{ultimulBuletin.data_analiza}</div>
              <div style={{ fontSize:'12px', color:'#111', marginBottom:'14px' }}>{buletinAnalize.length} analize extrase</div>
              <div style={{ height:'0.5px', background:'#e5e7eb', marginBottom:'12px' }}></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px', marginBottom:'12px' }}>
                {[
                  { val: buletinNormale, label: 'Normale', color: '#0F6E56', bg: '#E1F5EE', filtru: 'normal' as const },
                  { val: buletinPeste, label: 'Peste limită', color: '#ed1f37', bg: '#FFF0F0', filtru: 'peste' as const },
                  { val: buletinSub, label: 'Sub limită', color: '#92400E', bg: '#FFF8E7', filtru: 'sub' as const },
                ].map((s, i) => (
                  <div key={i} onClick={e => { e.stopPropagation(); const f = s.filtru as 'toate' | 'normal' | 'peste' | 'sub'; setTimeout(() => { setModalBuletinFiltru(f); setModalBuletin(true) }, 0) }} style={{ background: s.bg, borderRadius:'8px', padding:'10px', textAlign:'center', cursor:'pointer' }}>
                    <div style={{ fontSize:'20px', fontWeight:600, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize:'11px', color: s.color, marginTop:'2px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize:'12px', color:'#16705a', fontWeight:500 }}>→ Apasă pentru lista completă</div>
            </>
          ) : (
            <div style={{ fontSize:'13px', color:'#111' }}>Niciun buletin încă</div>
          )}
        </div>

      </div>

      {/* Modal Peste */}
      {modalPeste && (
        <div onClick={() => setModalPeste(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'white', borderRadius:'12px', width:'100%', maxWidth:'640px', maxHeight:'80vh', overflow:'hidden', display:'flex', flexDirection:'column' }}>
            <div style={{ padding:'16px 20px', borderBottom:'0.5px solid #e5e7eb', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
              <div>
                <div style={{ fontSize:'15px', fontWeight:600, color:'#111' }}>Analize peste limită</div>
                <div style={{ fontSize:'12px', color:'#111', marginTop:'2px' }}>{modalPesteLista.length} analize</div>
              </div>
              <button onClick={() => setModalPeste(false)} style={{ border:'none', background:'none', fontSize:'18px', cursor:'pointer', color:'#111' }}>✕</button>
            </div>
            <div style={{ display:'flex', borderBottom:'0.5px solid #e5e7eb', flexShrink:0 }}>
              {(['3luni', '1an'] as const).map(t => (
                <div key={t} onClick={() => setModalTabPeste(t)} style={{ flex:1, padding:'10px', fontSize:'13px', textAlign:'center', cursor:'pointer', color: modalTabPeste===t ? '#16705a' : '#111', fontWeight: modalTabPeste===t ? 500 : 400, borderBottom: modalTabPeste===t ? '2px solid #16705a' : '2px solid transparent' }}>
                  {t === '3luni' ? 'Ultimele 3 luni' : 'Ultimul an'}
                </div>
              ))}
            </div>
            <div style={{ overflowY:'auto' }}>
              {modalPesteLista.length === 0 ? (
                <div style={{ padding:'2rem', textAlign:'center', fontSize:'13px', color:'#111' }}>Nicio analiză în această perioadă</div>
              ) : (
                <>
                  <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:'4px', padding:'8px 12px', borderBottom:'0.5px solid #e5e7eb', background:'#f8f9fa' }}>
                    {['Analiză','Valoare','Unitate','Status'].map(h => (
                      <div key={h} style={{ fontSize:'11px', fontWeight:500, color:'#111', textTransform:'uppercase', letterSpacing:'0.5px', textAlign: h !== 'Analiză' ? 'right' : 'left' }}>{h}</div>
                    ))}
                  </div>
                  {pesteTot.filter(a => filtreazaData(a, modalTabPeste)).map((a, i) => (
                    <div key={i} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:'4px', padding:'8px 12px', borderBottom:'0.5px solid #f5f5f5', alignItems:'center' }}>
                      <div style={{ fontSize:'13px', color:'#111', fontWeight:500 }}>{a.nume_analiza}</div>
                      <div style={{ fontSize:'13px', fontWeight:500, color:'#E24B4A', textAlign:'right' }}>{a.tip_rezultat === 'calitativ' ? a.rezultat_text : a.valoare}</div>
                      <div style={{ fontSize:'12px', color:'#111', textAlign:'right' }}>{a.unitate || '—'}</div>
                      <div style={{ textAlign:'right' }}><span style={{ display:'inline-flex', padding:'3px 10px', background:'#FCEBEB', color:'#A32D2D', borderRadius:'12px', fontSize:'11px', fontWeight:500 }}>↑ Peste</span></div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Sub */}
      {modalSub && (
        <div onClick={() => setModalSub(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'white', borderRadius:'12px', width:'100%', maxWidth:'640px', maxHeight:'80vh', overflow:'hidden', display:'flex', flexDirection:'column' }}>
            <div style={{ padding:'16px 20px', borderBottom:'0.5px solid #e5e7eb', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
              <div>
                <div style={{ fontSize:'15px', fontWeight:600, color:'#111' }}>Analize sub limită</div>
                <div style={{ fontSize:'12px', color:'#111', marginTop:'2px' }}>{modalSubLista.length} analize</div>
              </div>
              <button onClick={() => setModalSub(false)} style={{ border:'none', background:'none', fontSize:'18px', cursor:'pointer', color:'#111' }}>✕</button>
            </div>
            <div style={{ display:'flex', borderBottom:'0.5px solid #e5e7eb', flexShrink:0 }}>
              {(['3luni', '1an'] as const).map(t => (
                <div key={t} onClick={() => setModalTabSub(t)} style={{ flex:1, padding:'10px', fontSize:'13px', textAlign:'center', cursor:'pointer', color: modalTabSub===t ? '#16705a' : '#111', fontWeight: modalTabSub===t ? 500 : 400, borderBottom: modalTabSub===t ? '2px solid #16705a' : '2px solid transparent' }}>
                  {t === '3luni' ? 'Ultimele 3 luni' : 'Ultimul an'}
                </div>
              ))}
            </div>
            <div style={{ overflowY:'auto' }}>
              {modalSubLista.length === 0 ? (
                <div style={{ padding:'2rem', textAlign:'center', fontSize:'13px', color:'#111' }}>Nicio analiză în această perioadă</div>
              ) : (
                <>
                  <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:'4px', padding:'8px 12px', borderBottom:'0.5px solid #e5e7eb', background:'#f8f9fa' }}>
                    {['Analiză','Valoare','Unitate','Status'].map(h => (
                      <div key={h} style={{ fontSize:'11px', fontWeight:500, color:'#111', textTransform:'uppercase', letterSpacing:'0.5px', textAlign: h !== 'Analiză' ? 'right' : 'left' }}>{h}</div>
                    ))}
                  </div>
                  {subTot.filter(a => filtreazaData(a, modalTabSub)).map((a, i) => (
                    <div key={i} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:'4px', padding:'8px 12px', borderBottom:'0.5px solid #f5f5f5', alignItems:'center' }}>
                      <div style={{ fontSize:'13px', color:'#111', fontWeight:500 }}>{a.nume_analiza}</div>
                      <div style={{ fontSize:'13px', fontWeight:500, color:'#B45309', textAlign:'right' }}>{a.tip_rezultat === 'calitativ' ? a.rezultat_text : a.valoare}</div>
                      <div style={{ fontSize:'12px', color:'#111', textAlign:'right' }}>{a.unitate || '—'}</div>
                      <div style={{ textAlign:'right' }}><span style={{ display:'inline-flex', padding:'3px 10px', background:'#FEF3C7', color:'#B45309', borderRadius:'12px', fontSize:'11px', fontWeight:500 }}>↓ Sub</span></div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Buletin */}
      {modalBuletin && ultimulBuletin && (
        <div onClick={() => setModalBuletin(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'white', borderRadius:'12px', width:'100%', maxWidth:'640px', maxHeight:'80vh', overflow:'hidden', display:'flex', flexDirection:'column' }}>
            <div style={{ padding:'16px 20px', borderBottom:'0.5px solid #e5e7eb', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
              <div>
                <div style={{ fontSize:'15px', fontWeight:600, color:'#111' }}>{getLaborator(ultimulBuletin.observatii) || 'Buletin'} — {ultimulBuletin.data_analiza}</div>
                <div style={{ fontSize:'12px', color:'#111', marginTop:'2px' }}>{buletinAnalize.length} analize · {buletinPeste} peste limită · {buletinSub} sub limită</div>
              </div>
              <button onClick={() => setModalBuletin(false)} style={{ border:'none', background:'none', fontSize:'18px', cursor:'pointer', color:'#111' }}>✕</button>
            </div>
            <div style={{ overflowY:'auto' }}>
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:'4px', padding:'8px 12px', borderBottom:'0.5px solid #e5e7eb', background:'#f8f9fa' }}>
                {['Analiză','Valoare','Unitate','Status'].map(h => (
                  <div key={h} style={{ fontSize:'11px', fontWeight:500, color:'#111', textTransform:'uppercase', letterSpacing:'0.5px', textAlign: h !== 'Analiză' ? 'right' : 'left' }}>{h}</div>
                ))}
              </div>
              {buletinAnalize.filter(a => modalBuletinFiltru === 'toate' || getStatus(a) === modalBuletinFiltru).map((a, i) => {
                const s = getStatus(a)
                const valColor = s === 'peste' ? 'ed1f37' : s === 'sub' ? '#B45309' : '#1D9E75'
                const badgeBg = s === 'peste' ? '#FCEBEB' : s === 'sub' ? '#FEF3C7' : '#E1F5EE'
                const badgeColor = s === 'peste' ? '#A32D2D' : s === 'sub' ? '#B45309' : '#085041'
                const badgeLabel = s === 'peste' ? '↑ Peste' : s === 'sub' ? '↓ Sub' : '✓ Normal'
                return (
                  <div key={i} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:'4px', padding:'8px 12px', borderBottom:'0.5px solid #f5f5f5', alignItems:'center' }}>
                    <div style={{ fontSize:'13px', color:'#111', fontWeight:500 }}>{a.nume_analiza}</div>
                    <div style={{ fontSize:'13px', fontWeight:500, color: valColor, textAlign:'right' }}>{a.tip_rezultat === 'calitativ' ? a.rezultat_text : a.valoare}</div>
                    <div style={{ fontSize:'12px', color:'#111', textAlign:'right' }}>{a.unitate || '—'}</div>
                    <div style={{ textAlign:'right' }}><span style={{ display:'inline-flex', padding:'3px 10px', background: badgeBg, color: badgeColor, borderRadius:'12px', fontSize:'11px', fontWeight:500 }}>{badgeLabel}</span></div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}