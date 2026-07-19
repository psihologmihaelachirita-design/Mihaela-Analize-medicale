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
  const [profilActiv, setProfilActiv] = useState<{ tip: 'eu' | 'apartinator', id: string | null, nume: string }>({ tip: 'eu', id: null, nume: username })

  useEffect(() => {
    const saved = localStorage.getItem('profilActiv')
    if (saved) setProfilActiv(JSON.parse(saved))
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      const { data } = await supabase.from('apartinatori').select('id, nume, prenume, relatie').eq('user_id', session.user.id)
      setApartinatori(data || [])
    })
  }, [])

  function switchProfil(tip: 'eu' | 'apartinator', id: string | null, nume: string) {
    const profil = { tip, id, nume }
    localStorage.setItem('profilActiv', JSON.stringify(profil))
    setProfilActiv(profil)
    setDropdown(false)
    window.location.reload()
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
      <div style={{ background:'white', borderBottom:'1px solid #e5e7eb', padding:'0 32px', height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:10 }}>
        <Link href="/dashboard" style={{ display:'flex', alignItems:'center', gap:'12px', textDecoration:'none' }}>
          <div style={{ width:'38px', height:'38px', background:'#E1F5EE', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', color:'#0F6E56', fontSize:'18px', fontWeight:600 }}>✚</div>
          <span style={{ fontSize:'20px', fontWeight:600, color:'#111' }}>MediPanel</span>
        </Link>

        <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
          <Link href="/dashboard" style={linkStyle('home')}>Home</Link>
          <Link href="/panoramic" style={linkStyle('panoramic')}>Panoramic</Link>
          <Link href="/urgenta" style={linkStyle('urgenta')}>Urgență</Link>
          <Link href="/dosar" style={linkStyle('dosar')}>Dosar</Link>

          {/* Dropdown Adaugă */}
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

          {/* Dropdown username + apartinatori */}
          <div style={{ position:'relative', marginLeft:'12px' }}>
            <button onClick={() => { setDropdown(!dropdown); setDropdownAdd(false) }}
              style={{ padding:'8px 14px', border:'1px solid #e5e7eb', borderRadius:'8px', fontSize:'15px', color:'#111', background:'white', cursor:'pointer', fontWeight:500 }}>
              {profilActiv.tip === 'eu' ? username : profilActiv.nume} ▾
            </button>
            {dropdown && (
              <div style={{ position:'absolute', right:0, top:'42px', background:'white', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'6px', minWidth:'220px', boxShadow:'0 8px 24px rgba(0,0,0,0.08)', zIndex:100 }}>
                
                {apartinatori.length > 0 && (
                  <>
                    <div style={{ height:'0.5px', background:'#e5e7eb', margin:'4px 0' }}></div>
                    <div style={{ padding:'4px 12px 6px', fontSize:'11px', fontWeight:600, color:'#aaa', textTransform:'uppercase', letterSpacing:'0.5px' }}>Aparținători</div>
                    {apartinatori.map(a => (
                      <div key={a.id} onClick={() => switchProfil('apartinator', a.id, `${a.prenume} ${a.nume}`)}
                        style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'8px', cursor:'pointer', background: profilActiv.id === a.id ? '#E1F5EE' : 'transparent' }}
                        onMouseEnter={e => e.currentTarget.style.background='#f8f9fa'}
                        onMouseLeave={e => e.currentTarget.style.background= profilActiv.id === a.id ? '#E1F5EE' : 'transparent'}>
                        <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'#EEF2FF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:600, color:'#4338CA', flexShrink:0 }}>
                          {a.prenume.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:'14px', fontWeight:500, color:'#111' }}>{a.prenume} {a.nume}</div>
                          <div style={{ fontSize:'11px', color:'#888', marginTop:'1px' }}>{relatieLabel[a.relatie] || a.relatie}</div>
                        </div>
                        {profilActiv.id === a.id && <span style={{ color:'#085041', fontSize:'14px' }}>✓</span>}
                      </div>
                    ))}
                  </>
                )}

                <div style={{ height:'0.5px', background:'#e5e7eb', margin:'4px 0' }}></div>
                <div onClick={() => { setDropdown(false) }}
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
      </div>

      {/* Banner apartinator activ */}
      {profilActiv.tip === 'apartinator' && (
        <div style={{ background:'#FEF3C7', borderBottom:'1px solid #FCD34D', padding:'10px 32px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontSize:'14px', color:'#92400E', fontWeight:500 }}>👤 Vizualizezi dosarul lui {profilActiv.nume}</div>
          <div onClick={() => switchProfil('eu', null, username)} style={{ fontSize:'13px', color:'#16705a', fontWeight:500, cursor:'pointer' }}>← Înapoi la profilul meu</div>
        </div>
      )}
    </>
  )
}