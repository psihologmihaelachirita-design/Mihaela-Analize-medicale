'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Apartinator {
  id: string
  nume: string
  prenume: string
  relatie: string
}

interface TopbarProps {
  username: string
  activePage?: 'home' | 'panoramic' | 'urgenta' | 'dosar' | 'profil'
  onLogout: () => void
}

export default function Topbar({ username, activePage, onLogout }: TopbarProps) {
  const [dropdown, setDropdown] = useState(false)
  const [dropdownAdd, setDropdownAdd] = useState(false)
  const [apartinatori, setApartinatori] = useState<Apartinator[]>([])
  const [modalApartinator, setModalApartinator] = useState(false)
  const [relatie, setRelatie] = useState('')
  const [acord, setAcord] = useState(false)
  const [fisierCI, setFisierCI] = useState<File | null>(null)
  const [salvare, setSalvare] = useState(false)
  const [eroare, setEroare] = useState('')
  const [profilActiv, setProfilActiv] = useState<{ tip: 'eu' | 'apartinator', id: string | null, prenume: string, nume: string }>({ tip: 'eu', id: null, prenume: '', nume: '' })
  const [menuMobile, setMenuMobile] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      const { data } = await supabase.from('apartinatori').select('id, nume, prenume, relatie').eq('user_id', session.user.id)
      const lista = data || []
      setApartinatori(lista)
      const saved = localStorage.getItem('profilActiv')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.tip === 'apartinator' && lista.find((a: Apartinator) => a.id === parsed.id)) {
          setProfilActiv(parsed)
        } else {
          localStorage.removeItem('profilActiv')
        }
      }
    })
  }, [])

  function switchProfil(tip: 'eu' | 'apartinator', id: string | null, prenume: string, nume: string) {
    const profil = { tip, id, prenume, nume }
    localStorage.setItem('profilActiv', JSON.stringify(profil))
    setProfilActiv(profil)
    setDropdown(false)
    window.location.reload()
  }

  async function handleSalvareApartinator() {
    setEroare('')
    if (!fisierCI) { setEroare('Te rugăm să încarci CI-ul aparținătorului.'); return }
    if (!relatie) { setEroare('Te rugăm să selectezi relația cu aparținătorul.'); return }
    if (!acord) { setEroare('Te rugăm să bifezi acordul.'); return }
    setSalvare(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setSalvare(false); return }

    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve((reader.result as string).split(',')[1])
      reader.onerror = reject
      reader.readAsDataURL(fisierCI)
    })

    let numeCI = '', prenumeCI = '', cnpCI = ''
    try {
      const resp = await fetch('/api/extrage-raport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdf: base64,
          prompt: 'Extrage din acest act de identitate: nume, prenume, CNP. Răspunde DOAR cu JSON fără text suplimentar: {"nume":"...","prenume":"...","cnp":"..."}'
        })
      })
      const respData = await resp.json()
      numeCI = respData.nume || ''
      prenumeCI = respData.prenume || ''
      cnpCI = respData.cnp || ''
    } catch {}

    const { error } = await supabase.from('apartinatori').insert({
      user_id: session.user.id,
      nume: numeCI, prenume: prenumeCI, cnp: cnpCI, relatie,
    })

    if (!error) {
      const { data } = await supabase.from('apartinatori').select('id, nume, prenume, relatie').eq('user_id', session.user.id)
      setApartinatori(data || [])
      setModalApartinator(false)
      setRelatie('')
      setAcord(false)
      setFisierCI(null)
    }
    setSalvare(false)
  }

  const linkStyle = (page: string): React.CSSProperties => ({
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '15px',
    color: activePage === page ? '#085041' : '#111',
    textDecoration: 'none',
    fontWeight: 500,
    background: activePage === page ? '#E1F5EE' : 'transparent',
  })

  const relatieLabel: Record<string, string> = { copil: 'Copil', parinte: 'Părinte', bunic: 'Bunic' }

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .topbar-nav-desktop { display: none !important; }
          .topbar-hamburger { display: flex !important; }
        }
        @media (min-width: 769px) {
          .topbar-hamburger { display: none !important; }
          .topbar-menu-mobile { display: none !important; }
        }
      `}</style>

      <div style={{ background:'white', borderBottom:'1px solid #e5e7eb', padding:'0 32px', height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:10 }}>
        <Link href="/dashboard" style={{ display:'flex', alignItems:'center', gap:'12px', textDecoration:'none' }}>
          <div style={{ width:'38px', height:'38px', background:'#E1F5EE', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', color:'#0F6E56', fontSize:'18px', fontWeight:600 }}>✚</div>
          <span style={{ fontSize:'20px', fontWeight:600, color:'#111' }}>Panoramic MedLog</span>
        </Link>

        {/* Nav desktop */}
        <div className="topbar-nav-desktop" style={{ display:'flex', alignItems:'center', gap:'6px' }}>
          <Link href="/dashboard" style={linkStyle('home')}>Home</Link>
          <Link href="/panoramic" style={linkStyle('panoramic')}>Panoramic</Link>
          <Link href="/urgenta" style={linkStyle('urgenta')}>Urgență</Link>
          <Link href="/dosar" style={linkStyle('dosar')}>Dosar</Link>

          <div style={{ position:'relative', marginLeft:'4px' }}>
            <button onClick={() => { setDropdownAdd(!dropdownAdd); setDropdown(false) }}
              style={{ padding:'8px 16px', background:'#16705a', color:'white', border:'none', borderRadius:'8px', fontSize:'15px', fontWeight:500, cursor:'pointer' }}>
              + Adaugă ▾
            </button>
            {dropdownAdd && (
              <div style={{ position:'absolute', right:0, top:'42px', background:'white', border:'1px solid #e5e7eb', borderRadius:'10px', padding:'6px', minWidth:'240px', boxShadow:'0 4px 16px rgba(0,0,0,0.08)', zIndex:100 }}>
                <Link href="/upload" onClick={() => setDropdownAdd(false)}
                  style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', fontSize:'14px', color:'#111', textDecoration:'none', borderRadius:'6px' }}
                  onMouseEnter={e => e.currentTarget.style.background='#f8f9fa'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <div style={{ width:'32px', height:'32px', background:'#16705a', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <svg viewBox="0 0 24 24" width="15" height="15" stroke="white" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><path d="M9 12h6M9 16h4"/></svg>
                  </div>
                  <div>
                    <div style={{ fontWeight:500 }}>Buletin de analize</div>
                    <div style={{ fontSize:'12px', color:'#888', marginTop:'1px' }}>Upload PDF și extragere AI</div>
                  </div>
                </Link>
                <div style={{ height:'0.5px', background:'#e5e7eb', margin:'4px 0' }}></div>
                <Link href="/raport" onClick={() => setDropdownAdd(false)}
                  style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', fontSize:'14px', color:'#111', textDecoration:'none', borderRadius:'6px' }}
                  onMouseEnter={e => e.currentTarget.style.background='#f8f9fa'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <div style={{ width:'32px', height:'32px', background:'#16705a', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <svg viewBox="0 0 24 24" width="15" height="15" stroke="white" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <div>
                    <div style={{ fontWeight:500 }}>Raport medical</div>
                    <div style={{ fontSize:'12px', color:'#888', marginTop:'1px' }}>Consultație, intervenție sau externare</div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          <div style={{ position:'relative', marginLeft:'12px' }}>
            <button onClick={() => { setDropdown(!dropdown); setDropdownAdd(false) }}
              style={{ padding:'8px 14px', border:'1px solid #e5e7eb', borderRadius:'8px', fontSize:'15px', color:'#111', background:'white', cursor:'pointer', fontWeight:500 }}>
              {profilActiv.tip === 'apartinator' ? `${profilActiv.prenume} ${profilActiv.nume}` : username} ▾
            </button>
            {dropdown && (
              <div style={{ position:'absolute', right:0, top:'42px', background:'white', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'6px', minWidth:'220px', boxShadow:'0 8px 24px rgba(0,0,0,0.08)', zIndex:100 }}>
                {apartinatori.length > 0 && (
                  <>
                    <div style={{ padding:'4px 12px 6px', fontSize:'11px', fontWeight:600, color:'#aaa', textTransform:'uppercase', letterSpacing:'0.5px' }}>Aparținători</div>
                    {apartinatori.map(a => (
                      <div key={a.id} onClick={() => switchProfil('apartinator', a.id, a.prenume, a.nume)}
                        style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'8px', cursor:'pointer', background: profilActiv.id === a.id ? '#E1F5EE' : 'transparent' }}
                        onMouseEnter={e => e.currentTarget.style.background='#f8f9fa'}
                        onMouseLeave={e => e.currentTarget.style.background= profilActiv.id === a.id ? '#E1F5EE' : 'transparent'}>
                        <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'#EEF2FF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:600, color:'#4338CA', flexShrink:0 }}>
                          {a.prenume?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:'14px', fontWeight:500, color:'#111' }}>{a.prenume} {a.nume}</div>
                          <div style={{ fontSize:'11px', color:'#888', marginTop:'1px' }}>{relatieLabel[a.relatie] || a.relatie}</div>
                        </div>
                        {profilActiv.id === a.id && <span style={{ color:'#085041' }}>✓</span>}
                      </div>
                    ))}
                    <div style={{ height:'0.5px', background:'#e5e7eb', margin:'4px 0' }}></div>
                  </>
                )}
                <div onClick={() => { setDropdown(false); setModalApartinator(true) }}
                  style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'8px', cursor:'pointer', color:'#16705a', fontWeight:500, fontSize:'14px' }}
                  onMouseEnter={e => e.currentTarget.style.background='#E1F5EE'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'#16705a', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'16px', flexShrink:0 }}>+</div>
                  Asociază aparținător
                </div>
                <div style={{ height:'0.5px', background:'#e5e7eb', margin:'4px 0' }}></div>
                <Link href="/profil" onClick={() => setDropdown(false)}
                  style={{ display:'block', padding:'10px 14px', fontSize:'14px', color:'#111', textDecoration:'none', borderRadius:'6px' }}
                  onMouseEnter={e => e.currentTarget.style.background='#f8f9fa'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  Profil
                </Link>
                <div onClick={() => { setDropdown(false); onLogout() }}
                  style={{ padding:'10px 14px', fontSize:'14px', color:'#E24B4A', cursor:'pointer', borderRadius:'6px' }}
                  onMouseEnter={e => e.currentTarget.style.background='#f8f9fa'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  Ieșire
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hamburger mobile */}
        <button className="topbar-hamburger" onClick={() => setMenuMobile(!menuMobile)}
          style={{ display:'none', background:'transparent', border:'none', cursor:'pointer', padding:'8px', flexDirection:'column', gap:'5px', alignItems:'center', justifyContent:'center' }}>
          <div style={{ width:'22px', height:'2px', background:'#111', borderRadius:'2px' }}></div>
          <div style={{ width:'22px', height:'2px', background:'#111', borderRadius:'2px' }}></div>
          <div style={{ width:'22px', height:'2px', background:'#111', borderRadius:'2px' }}></div>
        </button>
      </div>

      {/* Meniu mobile */}
      {menuMobile && (
        <div className="topbar-menu-mobile" style={{ background:'white', borderBottom:'1px solid #e5e7eb', padding:'12px 16px', display:'flex', flexDirection:'column', gap:'4px', position:'sticky', top:'64px', zIndex:9 }}>
          <Link href="/dashboard" onClick={() => setMenuMobile(false)} style={{ ...linkStyle('home'), display:'block', padding:'12px 14px' }}>Home</Link>
          <Link href="/panoramic" onClick={() => setMenuMobile(false)} style={{ ...linkStyle('panoramic'), display:'block', padding:'12px 14px' }}>Panoramic</Link>
          <Link href="/urgenta" onClick={() => setMenuMobile(false)} style={{ ...linkStyle('urgenta'), display:'block', padding:'12px 14px' }}>Urgență</Link>
          <Link href="/dosar" onClick={() => setMenuMobile(false)} style={{ ...linkStyle('dosar'), display:'block', padding:'12px 14px' }}>Dosar</Link>
          <div style={{ height:'0.5px', background:'#e5e7eb', margin:'4px 0' }}></div>
          <Link href="/upload" onClick={() => setMenuMobile(false)} style={{ display:'block', padding:'12px 14px', background:'#16705a', color:'white', borderRadius:'8px', fontSize:'15px', fontWeight:500, textDecoration:'none', textAlign:'center' as const }}>+ Adaugă buletin</Link>
          <Link href="/raport" onClick={() => setMenuMobile(false)} style={{ display:'block', padding:'12px 14px', background:'#16705a', color:'white', borderRadius:'8px', fontSize:'15px', fontWeight:500, textDecoration:'none', textAlign:'center' as const, marginTop:'4px' }}>+ Adaugă raport</Link>
          <div style={{ height:'0.5px', background:'#e5e7eb', margin:'4px 0' }}></div>
          <Link href="/profil" onClick={() => setMenuMobile(false)} style={{ display:'block', padding:'12px 14px', fontSize:'15px', color:'#111', textDecoration:'none' }}>Profil</Link>
          <div onClick={() => { setMenuMobile(false); onLogout() }} style={{ padding:'12px 14px', fontSize:'15px', color:'#E24B4A', cursor:'pointer' }}>Ieșire</div>
        </div>
      )}

      {/* Banner apartinator activ */}
      {profilActiv.tip === 'apartinator' && (
        <div style={{ background:'#E1F5EE', borderBottom:'1px solid #A7F3D0', padding:'10px 32px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontSize:'14px', color:'#111', fontWeight:700 }}>👤 Vizualizezi dosarul lui {profilActiv.prenume} {profilActiv.nume}</div>
          <div onClick={() => switchProfil('eu', null, '', '')} style={{ fontSize:'13px', color:'#16705a', fontWeight:500, cursor:'pointer' }}>← Înapoi la profilul meu</div>
        </div>
      )}

      {/* Modal Asociaza Apartinator */}
      {modalApartinator && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 }}
          onClick={e => { if (e.target === e.currentTarget) setModalApartinator(false) }}>
          <div style={{ background:'white', borderRadius:'16px', padding:'28px', width:'520px', maxWidth:'90vw', boxShadow:'0 4px 24px rgba(0,0,0,0.12)' }}>
            <div style={{ fontSize:'18px', fontWeight:600, color:'#111', marginBottom:'4px', textAlign:'center' }}>Asociază aparținător</div>
            <div style={{ fontSize:'13px', color:'#555', marginBottom:'24px', textAlign:'center' }}>Adaugă un membru al familiei pentru a-i gestiona dosarul medical.</div>

            <div style={{ marginBottom:'20px' }}>
              <div style={{ fontSize:'12px', fontWeight:600, color:'#555', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'8px' }}>1. Notă de informare</div>
              <div style={{ background:'#E1F5EE', borderRadius:'8px', padding:'12px 14px', display:'flex', alignItems:'center', gap:'10px' }}>
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="#085041" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <div style={{ fontSize:'13px', color:'#085041' }}>Înainte de a continua, citește <a href="/nota-informare" target="_blank" style={{ color:'#085041', fontWeight:600 }}>nota de informare privind prelucrarea datelor cu caracter personal</a> pentru acest proces.</div>
              </div>
            </div>

            <div style={{ marginBottom:'20px' }}>
              <div style={{ fontSize:'12px', fontWeight:600, color:'#555', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'8px' }}>2. Document identitate aparținător (CI) *</div>
              <div onClick={() => document.getElementById('ci-input')?.click()}
                style={{ border: fisierCI ? '1.5px solid #16705a' : '1.5px dashed #e5e7eb', borderRadius:'10px', padding:'24px', textAlign:'center', background: fisierCI ? '#f0fdf8' : '#f8f9fa', cursor:'pointer' }}>
                <input id="ci-input" type="file" accept="image/*,.pdf" style={{ display:'none' }} onChange={e => { setFisierCI(e.target.files?.[0] || null); setEroare('') }} />
                <div style={{ fontSize:'28px', marginBottom:'8px' }}>📄</div>
                <div style={{ fontSize:'14px', fontWeight:500, color:'#111', marginBottom:'4px' }}>
                  {fisierCI ? `✓ ${fisierCI.name}` : 'Trage fișierul CI aici sau apasă pentru a selecta'}
                </div>
                <div style={{ fontSize:'12px', color:'#888' }}>Imaginea nu se stochează — se extrag doar datele de identitate</div>
              </div>
            </div>

            <div style={{ marginBottom:'20px' }}>
              <div style={{ fontSize:'12px', fontWeight:600, color:'#555', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'8px' }}>3. Relație cu aparținătorul *</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px' }}>
                {['copil', 'parinte', 'bunic'].map(r => (
                  <button key={r} onClick={() => setRelatie(r)}
                    style={{ padding:'10px 14px', border: relatie === r ? '2px solid #16705a' : '0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color: relatie === r ? '#085041' : '#111', background: relatie === r ? '#E1F5EE' : 'white', cursor:'pointer', fontWeight: relatie === r ? 600 : 500 }}>
                    {relatieLabel[r]}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom:'0' }}>
              <div style={{ fontSize:'12px', fontWeight:600, color:'#555', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'8px' }}>4. Acord *</div>
              <div onClick={() => setAcord(!acord)}
                style={{ display:'flex', alignItems:'flex-start', gap:'10px', padding:'14px', background:'#f8f9fa', borderRadius:'8px', cursor:'pointer' }}>
                <div style={{ width:'18px', height:'18px', border:'1.5px solid #16705a', borderRadius:'4px', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', marginTop:'1px', background: acord ? '#16705a' : 'white' }}>
                  {acord && <svg viewBox="0 0 24 24" width="12" height="12" stroke="white" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <div style={{ fontSize:'12px', color:'#555', lineHeight:1.5 }}>Declar că am obținut acordul explicit al acestei persoane pentru prelucrarea datelor sale medicale în platforma Panoramic MedLog și că am dreptul legal de a gestiona dosarul său medical.</div>
              </div>
            </div>

            {eroare && (
              <div style={{ marginTop:'12px', padding:'10px 14px', background:'#FCEBEB', borderRadius:'8px', fontSize:'13px', color:'#A32D2D' }}>
                {eroare}
              </div>
            )}

            <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end', marginTop:'24px' }}>
              <button onClick={() => { setModalApartinator(false); setEroare(''); setRelatie(''); setAcord(false); setFisierCI(null) }}
                style={{ padding:'9px 18px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#111', cursor:'pointer', fontWeight:500 }}>
                Anulează
              </button>
              <button onClick={handleSalvareApartinator} disabled={salvare || !fisierCI || !relatie || !acord}
                style={{ padding:'9px 18px', background: fisierCI && relatie && acord ? '#16705a' : '#d1d5db', color:'white', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:500, cursor: fisierCI && relatie && acord ? 'pointer' : 'not-allowed' }}>
                {salvare ? 'Se extrag datele...' : 'Asociază aparținător'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}