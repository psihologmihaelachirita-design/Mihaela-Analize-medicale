'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IconUser, IconCreditCard, IconDownload, IconLock } from '@tabler/icons-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Profil() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [salvare, setSalvare] = useState(false)
  const [mesaj, setMesaj] = useState('')
  const [sectiuni, setSectiuni] = useState({ baza: true, abonament: true, export: true, confidentialitate: true })
  const router = useRouter()

  const [nume, setNume] = useState('')
  const [prenume, setPrenume] = useState('')
  const [sex, setSex] = useState('')
  const [cetatenie, setCetatenie] = useState('Română')
  const [email, setEmail] = useState('')

  function toggleSectiune(key: keyof typeof sectiuni) {
    setSectiuni(prev => ({ ...prev, [key]: !prev[key] }))
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      setEmail(session.user.email || '')
      const { data: profil } = await supabase.from('profiluri').select('*').eq('id', session.user.id).single()
      if (profil) {
        const numeParts = (profil.nume || '').split(' ')
        setNume(numeParts[0] || '')
        setPrenume(numeParts.slice(1).join(' ') || '')
        setSex(profil.sex || '')
        setCetatenie(profil.cetatenie || 'Română')
      }
      setLoading(false)
    })
  }, [])

  async function handleSalvare() {
    setSalvare(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { error } = await supabase.from('profiluri').upsert({
      id: session.user.id,
      nume: `${nume} ${prenume}`.trim(),
      sex: sex || null,
      cetatenie: cetatenie || null,
    })
    if (error) setMesaj('Eroare: ' + error.message)
    else setMesaj('Salvat!')
    setSalvare(false)
    setTimeout(() => setMesaj(''), 3000)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  async function handleSchimbaParola() {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) setMesaj('Eroare: ' + error.message)
    else setMesaj('Email de resetare trimis!')
    setTimeout(() => setMesaj(''), 4000)
  }

  async function handleStergeContConfirm() {
    const confirm = window.confirm('Ești sigură? Toate datele tale vor fi șterse permanent.')
    if (!confirm) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    await supabase.from('analize').delete().eq('user_id', session.user.id)
    await supabase.from('profiluri').delete().eq('id', session.user.id)
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <p style={{ fontFamily:'system-ui', padding:'2rem', color:'#888' }}>Se încarcă...</p>

  const inp: React.CSSProperties = { width:'100%', padding:'9px 13px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', outline:'none', background:'white', color:'#111', fontFamily:'system-ui' }
  const lbl: React.CSSProperties = { display:'block', fontSize:'12px', fontWeight:500, color:'#555', marginBottom:'5px' }
  const g2: React.CSSProperties = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'14px' }

  const navItems = [
    { key:'baza' as keyof typeof sectiuni, Icon: IconUser, label:'Date de bază' },
    { key:'abonament' as keyof typeof sectiuni, Icon: IconCreditCard, label:'Abonament' },
    { key:'export' as keyof typeof sectiuni, Icon: IconDownload, label:'Export date' },
    { key:'confidentialitate' as keyof typeof sectiuni, Icon: IconLock, label:'Confidențialitate' },
  ]

  function Banner({ icon, title, sub, skey }: { icon: string, title: string, sub: string, skey: keyof typeof sectiuni }) {
    return (
      <div onClick={() => toggleSectiune(skey)} style={{ background:'#16705a', padding:'15px 22px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ width:'32px', height:'32px', background:'rgba(255,255,255,0.15)', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', filter:'brightness(0) invert(1)' }}>{icon}</div>
          <div>
            <div style={{ fontSize:'14px', fontWeight:500, color:'white' }}>{title}</div>
            <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.72)', marginTop:'2px' }}>{sub}</div>
          </div>
        </div>
        <span style={{ color:'rgba(255,255,255,0.8)', fontSize:'14px' }}>{sectiuni[skey] ? '▲' : '▼'}</span>
      </div>
    )
  }

  return (
    <div style={{ fontFamily:'system-ui,-apple-system,sans-serif', background:'#f8f9fa', minHeight:'100vh', display:'flex', flexDirection:'column' }}>

      <div style={{ background:'white', borderBottom:'0.5px solid #e5e7eb', padding:'0 32px', height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'20px' }}>
          <Link href="/dashboard" style={{ display:'flex', alignItems:'center', gap:'8px', textDecoration:'none' }}>
            <div style={{ width:'32px', height:'32px', background:'#E1F5EE', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', color:'#0F6E56', fontSize:'16px', fontWeight:600 }}>✚</div>
            <span style={{ fontSize:'18px', fontWeight:600, color:'#111' }}>MedFile</span>
          </Link>
          <div style={{ width:'0.5px', height:'20px', background:'#e5e7eb' }}></div>
          <span style={{ fontSize:'15px', fontWeight:500, color:'#111' }}>Profilul meu</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <span style={{ fontSize:'14px', color:'#111', fontWeight:500 }}>{nume || user?.email?.split('@')[0]}</span>
          <button onClick={handleLogout} style={{ padding:'6px 14px', background:'transparent', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#111', cursor:'pointer', fontWeight:500 }}>Ieșire</button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'230px 1fr', flex:1 }}>

        <div style={{ background:'white', borderRight:'0.5px solid #e5e7eb', padding:'32px 0 24px', display:'flex', flexDirection:'column' }}>
          <div style={{ padding:'0 20px 28px', borderBottom:'0.5px solid #e5e7eb', marginBottom:'24px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <div style={{ width:'36px', height:'36px', background:'#E1F5EE', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', color:'#16705a', fontSize:'20px', fontWeight:500 }}>✚</div>
              <span style={{ fontSize:'16px', fontWeight:500, color:'#111' }}>MedFile</span>
            </div>
          </div>
          <div style={{ padding:'0 16px', flex:1 }}>
            <div style={{ fontSize:'11px', fontWeight:500, color:'#aaa', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:'10px', padding:'0 8px' }}>Secțiuni profil</div>
            {navItems.map(item => (
              <div key={item.key} onClick={() => toggleSectiune(item.key)}
                style={{ display:'flex', alignItems:'center', gap:'10px', padding:'9px 12px', borderRadius:'8px', fontSize:'13px', color: sectiuni[item.key] ? '#085041' : '#555', background: sectiuni[item.key] ? '#E1F5EE' : 'transparent', cursor:'pointer', marginBottom:'3px', fontWeight: sectiuni[item.key] ? 500 : 400 }}>
                <item.Icon size={16} stroke={1.5} />
                {item.label}
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding:'28px', overflowY:'auto' }}>

          {mesaj && (
            <div style={{ padding:'12px 16px', borderRadius:'8px', marginBottom:'16px', background: mesaj.includes('Eroare') ? '#FCEBEB' : '#E1F5EE', color: mesaj.includes('Eroare') ? '#A32D2D' : '#0F6E56', fontSize:'13px' }}>
              {mesaj}
            </div>
          )}

          <div style={{ background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', marginBottom:'14px', overflow:'hidden' }}>
            <Banner icon="👤" title="Date de bază" sub="Preluate automat în cardul de urgență" skey="baza" />
            {sectiuni.baza && (
              <div style={{ padding:'20px 22px' }}>
                <div style={g2}>
                  <div><label style={lbl}>Nume</label><input value={nume} onChange={e => setNume(e.target.value)} placeholder="ex: Chirita" style={inp} /></div>
                  <div><label style={lbl}>Prenume</label><input value={prenume} onChange={e => setPrenume(e.target.value)} placeholder="ex: Mihaela" style={inp} /></div>
                </div>
                <div style={g2}>
                  <div>
                    <label style={lbl}>Sex</label>
                    <div style={{ display:'flex', gap:'16px', marginTop:'6px' }}>
                      {['F','M'].map(s => (
                        <label key={s} style={{ display:'flex', alignItems:'center', gap:'7px', fontSize:'13px', cursor:'pointer', color:'#111' }}>
                          <div onClick={() => setSex(s)} style={{ width:'16px', height:'16px', borderRadius:'50%', border:'0.5px solid #e5e7eb', background: sex===s?'#16705a':'white', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                            {sex===s && <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'white' }}></div>}
                          </div>
                          {s==='F'?'Feminin':'Masculin'}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={lbl}>Cetățenie</label>
                    <select value={cetatenie} onChange={e => setCetatenie(e.target.value)} style={{ ...inp, cursor:'pointer' }}>
                      <option>Română</option>
                      <option>Alta</option>
                    </select>
                  </div>
                </div>
                <div style={{ height:'0.5px', background:'#e5e7eb', margin:'16px 0' }}></div>
                <div style={g2}>
                  <div>
                    <label style={lbl}>Email</label>
                    <input value={email} disabled style={{ ...inp, background:'#f8f9fa', color:'#aaa' }} />
                  </div>
                  <div>
                    <label style={lbl}>Parolă</label>
                    <input value="••••••••" disabled style={{ ...inp, background:'#f8f9fa', color:'#aaa' }} />
                  </div>
                </div>
                <button onClick={handleSchimbaParola} style={{ padding:'8px 16px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#111', cursor:'pointer', fontWeight:500, marginBottom:'16px' }}>Schimbă parola</button>
                <div style={{ display:'flex', justifyContent:'flex-end' }}>
                  <button onClick={handleSalvare} disabled={salvare} style={{ padding:'10px 26px', background:'#16705a', color:'white', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:500, cursor:'pointer' }}>
                    {salvare ? 'Se salvează...' : 'Salvează'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={{ background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', marginBottom:'14px', overflow:'hidden' }}>
            <Banner icon="💳" title="Abonament" sub="Planul tău curent" skey="abonament" />
            {sectiuni.abonament && (
              <div style={{ padding:'20px 22px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div>
                    <div style={{ fontSize:'13px', fontWeight:500, color:'#111' }}>Plan curent</div>
                    <div style={{ fontSize:'12px', color:'#555', marginTop:'2px' }}>MedFile Basic</div>
                  </div>
                  <button style={{ padding:'8px 18px', background:'#16705a', color:'white', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:500, cursor:'pointer' }}>Upgrade</button>
                </div>
              </div>
            )}
          </div>

          <div style={{ background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', marginBottom:'14px', overflow:'hidden' }}>
            <Banner icon="⬇" title="Export date" sub="Descarcă toate datele tale din MedFile" skey="export" />
            {sectiuni.export && (
              <div style={{ padding:'20px 22px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div>
                    <div style={{ fontSize:'13px', fontWeight:500, color:'#111' }}>Export complet dosar</div>
                    <div style={{ fontSize:'12px', color:'#555', marginTop:'2px' }}>Analize + Card urgență în format PDF</div>
                  </div>
                  <button style={{ padding:'8px 16px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#111', cursor:'pointer', fontWeight:500 }}>⬇ Descarcă</button>
                </div>
              </div>
            )}
          </div>

          <div style={{ background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', marginBottom:'14px', overflow:'hidden' }}>
            <Banner icon="🔒" title="Confidențialitate" sub="Drepturile tale conform GDPR" skey="confidentialitate" />
            {sectiuni.confidentialitate && (
              <div style={{ padding:'20px 22px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
                  <div>
                    <div style={{ fontSize:'13px', fontWeight:500, color:'#111' }}>Politica de confidențialitate</div>
                    <div style={{ fontSize:'12px', color:'#555', marginTop:'2px' }}>Vezi cum procesăm datele tale</div>
                  </div>
                  <button style={{ padding:'8px 16px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#111', cursor:'pointer', fontWeight:500 }}>Vezi →</button>
                </div>
                <div style={{ height:'0.5px', background:'#e5e7eb', margin:'14px 0' }}></div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div>
                    <div style={{ fontSize:'13px', fontWeight:500, color:'#E24B4A' }}>Ștergere cont</div>
                    <div style={{ fontSize:'12px', color:'#555', marginTop:'2px' }}>Toate datele tale vor fi șterse permanent</div>
                  </div>
                  <button onClick={handleStergeContConfirm} style={{ padding:'8px 16px', background:'white', border:'0.5px solid #E24B4A', borderRadius:'8px', fontSize:'13px', color:'#E24B4A', cursor:'pointer', fontWeight:500 }}>Șterge cont</button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}