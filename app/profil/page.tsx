'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Topbar from '@/components/Topbar'
import { IconUser, IconCreditCard, IconDownload, IconLock, IconId } from '@tabler/icons-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Profil() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [salvare, setSalvare] = useState(false)
  const [mesaj, setMesaj] = useState('')
  const [eroareCNP, setEroareCNP] = useState('')
  const [dropdown, setDropdown] = useState(false)
  const [sectiuni, setSectiuni] = useState({ 
    cont: true, 
    identitate: true, 
    abonament: true, 
    export: true, 
    confidentialitate: true 
  })
  const router = useRouter()

  const [nume, setNume] = useState('')
  const [prenume, setPrenume] = useState('')
  const [sex, setSex] = useState('')
  const [cetatenie, setCetatenie] = useState('Română')
  const [email, setEmail] = useState('')
  const [telefon, setTelefon] = useState('')
  const [cnp, setCnp] = useState('')
  const [dataNasterii, setDataNasterii] = useState('')
  const [adresa, setAdresa] = useState('')
  const [judet, setJudet] = useState('')
  const [identitateVerificata, setIdentitateVerificata] = useState(false)
  const [modManual, setModManual] = useState(false)

  function toggleSectiune(key: keyof typeof sectiuni) {
    setSectiuni(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function validCNP(cnp: string): boolean {
    if (!cnp || cnp.length !== 13) return false
    const weights = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9]
    const digits = cnp.split('').map(Number)
    if (digits.some(isNaN)) return false
    const sum = weights.reduce((acc, w, i) => acc + w * digits[i], 0)
    const control = sum % 11 === 10 ? 1 : sum % 11
    return control === digits[12]
  }

  function extrageSexDinCNP(cnp: string) {
    if (!cnp || cnp.length < 1) return ''
    const sexCifra = parseInt(cnp.charAt(0))
    if (sexCifra === 1 || sexCifra === 3 || sexCifra === 5 || sexCifra === 7) return 'M'
    if (sexCifra === 2 || sexCifra === 4 || sexCifra === 6 || sexCifra === 8) return 'F'
    return ''
  }

  function extrageDataNasteriiDinCNP(cnp: string) {
    if (!cnp || cnp.length < 7) return ''
    const an = parseInt(cnp.substring(1, 3))
    const luna = parseInt(cnp.substring(3, 5))
    const zi = parseInt(cnp.substring(5, 7))
    const secol = parseInt(cnp.charAt(0))
    
    let anComplet
    if (secol === 1 || secol === 2) anComplet = 1900 + an
    else if (secol === 3 || secol === 4) anComplet = 1800 + an
    else if (secol === 5 || secol === 6) anComplet = 2000 + an
    else anComplet = 1900 + an
    
    return `${zi.toString().padStart(2, '0')}.${luna.toString().padStart(2, '0')}.${anComplet}`
  }

  async function handleUploadCI(fisier: File) {
    setMesaj('Se procesează CI-ul...')
    try {
      const Tesseract = await import('tesseract.js')
      const { data: { text } } = await Tesseract.recognize(fisier, 'ron+eng')
      
      // Extrage CNP — 13 cifre consecutive
      const cnpMatch = text.match(/\b([1-9]\d{12})\b/)
      if (cnpMatch) {
        const cnpExtras = cnpMatch[1]
        setCnp(cnpExtras)
        const sexExtras = extrageSexDinCNP(cnpExtras)
        if (sexExtras) setSex(sexExtras)
        const dataExtrasa = extrageDataNasteriiDinCNP(cnpExtras)
        if (dataExtrasa) setDataNasterii(dataExtrasa)
      }

      // Extrage nume și prenume — linii cu majuscule
      const linii = text.split('\n').map(l => l.trim()).filter(Boolean)
      const liniiMajuscule = linii.filter(l => /^[A-ZĂÎȘȚÂ\s\-]+$/.test(l) && l.length > 2 && l.length < 40)
      if (liniiMajuscule.length >= 2) {
        setNume(liniiMajuscule[0].trim())
        setPrenume(liniiMajuscule[1].trim())
      } else if (liniiMajuscule.length === 1) {
        setNume(liniiMajuscule[0].trim())
      }

      setIdentitateVerificata(true)
      setMesaj('CI procesată cu succes! Verifică datele extrase.')
    } catch (e) {
      setMesaj('Eroare la procesarea CI. Completează manual.')
    }
    setTimeout(() => setMesaj(''), 5000)
  }

  function handleReincarcaCI() {
    setIdentitateVerificata(false)
    setSex('')
    setDataNasterii('')
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      setEmail(session.user.email || '')
      const { data: profil } = await supabase.from('profiluri').select('*').eq('id', session.user.id).single()
      if (profil) {
        setNume(profil.nume || '')
        setPrenume(profil.prenume || '')
        setSex(profil.sex || '')
        setCetatenie(profil.cetatenie || 'Română')
        setTelefon(profil.telefon || '')
        setCnp(profil.cnp || '')
        setDataNasterii(profil.data_nasterii || '')
        setAdresa(profil.adresa || '')
        setJudet(profil.judet || '')
        setIdentitateVerificata(profil.identitate_verificata || false)
      }
      setLoading(false)
    })
  }, [])

  async function handleSalvare() {
    setEroareCNP('')
    setMesaj('')
    
    if (cnp && cnp.length > 0 && cnp.length !== 13) {
      setEroareCNP('CNP-ul trebuie să aibă 13 cifre.')
      return
    }
    if (cnp && cnp.length === 13 && !validCNP(cnp)) {
      setEroareCNP('CNP invalid — verifică numărul introdus.')
      return
    }
    
    setSalvare(true)
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setMesaj('Eroare: Nu ești autentificat!')
      setSalvare(false)
      return
    }
    
    const { error } = await supabase.from('profiluri').upsert({
      id: session.user.id,
      nume: nume,
      prenume: prenume,
      sex: sex || null,
      cetatenie: cetatenie || null,
      telefon: telefon || null,
      cnp: cnp || null,
      data_nasterii: dataNasterii || null,
      adresa: adresa || null,
      judet: judet || null,
      identitate_verificata: identitateVerificata,
    })
    
    if (error) {
      setMesaj('Eroare: ' + error.message)
    } else {
      setMesaj('Date salvate cu succes!')
    }
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

  function handleVeziPolitica() {
    window.open('/politica-confidentialitate', '_blank')
  }

  if (loading) return <p style={{ fontFamily:'system-ui', padding:'2rem', color:'#888' }}>Se încarcă...</p>

  const username = prenume || user?.email?.split('@')[0]
  const inp: React.CSSProperties = { 
    width:'100%', 
    padding:'11px 15px', 
    border:'0.5px solid #e5e7eb', 
    borderRadius:'8px', 
    fontSize:'15px', 
    outline:'none', 
    background:'white', 
    color:'#111', 
    fontFamily:'system-ui' 
  }
  const lbl: React.CSSProperties = { 
    display:'block', 
    fontSize:'14px', 
    fontWeight:500, 
    color:'#555', 
    marginBottom:'6px' 
  }
  const g2: React.CSSProperties = { 
    display:'grid', 
    gridTemplateColumns:'1fr 1fr', 
    gap:'16px', 
    marginBottom:'16px' 
  }
  const navStyle: React.CSSProperties = { 
    padding:'6px 10px', 
    borderRadius:'8px', 
    fontSize:'14px', 
    color:'#111', 
    textDecoration:'none', 
    fontWeight:500 
  }

  const navItems = [
    { key:'cont' as keyof typeof sectiuni, Icon: IconUser, label:'Contul meu' },
    { key:'identitate' as keyof typeof sectiuni, Icon: IconId, label:'Identitate' },
    { key:'abonament' as keyof typeof sectiuni, Icon: IconCreditCard, label:'Abonament' },
    { key:'export' as keyof typeof sectiuni, Icon: IconDownload, label:'Export date' },
    { key:'confidentialitate' as keyof typeof sectiuni, Icon: IconLock, label:'Confidențialitate' },
  ]

  function Banner({ icon: BannerIcon, title, sub, skey }: { icon: any, title: string, sub: string, skey: keyof typeof sectiuni }) {
    return (
      <div onClick={() => toggleSectiune(skey)} style={{ background:'#16705a', padding:'18px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
          <div style={{ width:'36px', height:'36px', background:'rgba(255,255,255,0.15)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <BannerIcon size={20} color="white" stroke={1.5} />
          </div>
          <div>
            <div style={{ fontSize:'17px', fontWeight:600, color:'white' }}>{title}</div>
            <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.72)', marginTop:'3px' }}>{sub}</div>
          </div>
        </div>
        <span style={{ color:'rgba(255,255,255,0.8)', fontSize:'16px' }}>{sectiuni[skey] ? '▲' : '▼'}</span>
      </div>
    )
  }

  return (
    <div style={{ fontFamily:'system-ui,-apple-system,sans-serif', background:'#f8f9fa', minHeight:'100vh', display:'flex', flexDirection:'column' }}>

      <Topbar username={username} activePage="profil" onLogout={handleLogout} />
      <div style={{ display:'grid', gridTemplateColumns:'230px 1fr', flex:1 }}>

        <div style={{ background:'white', borderRight:'0.5px solid #e5e7eb', padding:'32px 0 24px', display:'flex', flexDirection:'column' }}>
          <div style={{ padding:'0 16px', flex:1 }}>
            <div style={{ fontSize:'20px', fontWeight:600, color:'#111', marginBottom:'32px', padding:'0 8px', textAlign:'center' as const }}>{prenume} {nume}</div>
            {navItems.map(item => (
              <div key={item.key} onClick={() => toggleSectiune(item.key)}
                style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px', borderRadius:'8px', fontSize:'15px', color: sectiuni[item.key] ? '#085041' : '#555', background: sectiuni[item.key] ? '#E1F5EE' : 'transparent', cursor:'pointer', marginBottom:'3px', fontWeight: sectiuni[item.key] ? 500 : 400 }}>
                <item.Icon size={18} stroke={1.5} color={sectiuni[item.key] ? '#085041' : '#555'} />
                {item.label}
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding:'32px', overflowY:'auto' }}>

          {mesaj && (
            <div style={{ padding:'14px 18px', borderRadius:'8px', marginBottom:'18px', background: mesaj.includes('Eroare') ? '#FCEBEB' : '#E1F5EE', color: mesaj.includes('Eroare') ? '#A32D2D' : '#0F6E56', fontSize:'14px' }}>
              {mesaj}
            </div>
          )}
          {eroareCNP && (
            <div style={{ padding:'14px 18px', borderRadius:'8px', marginBottom:'18px', background:'#FCEBEB', color:'#A32D2D', fontSize:'14px' }}>
              {eroareCNP}
            </div>
          )}

          {/* SECȚIUNEA 1: CONTUL MEU */}
          <div style={{ background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', marginBottom:'16px', overflow:'hidden' }}>
            <Banner icon={IconUser} title="Contul meu" sub="Email, telefon, parolă și securitate" skey="cont" />
            {sectiuni.cont && (
              <div style={{ padding:'22px 24px' }}>
                <div style={g2}>
                  <div>
                    <label style={lbl}>Email</label>
                    <input value={email} onChange={e => setEmail(e.target.value)} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Telefon</label>
                    <input value={telefon} onChange={e => setTelefon(e.target.value)} placeholder="ex: 0721 000 000" style={inp} />
                  </div>
                </div>
                <div style={g2}>
                  <div>
                    <label style={lbl}>Parolă</label>
                    <input value="********" disabled style={{ ...inp, background:'#f8f9fa', color:'#111' }} />
                  </div>
                  <div>
                    <label style={lbl}>Ultima modificare</label>
                    <input value="15 Ian 2025" disabled style={{ ...inp, background:'#f8f9fa', color:'#111' }} />
                  </div>
                </div>
                <button onClick={handleSchimbaParola} style={{ padding:'10px 18px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'14px', color:'#111', cursor:'pointer', fontWeight:500, marginBottom:'18px' }}>Schimbă parola</button>

                <div style={{ height:'0.5px', background:'#e5e7eb', margin:'18px 0' }}></div>
                
                <div style={{ fontSize:'16px', fontWeight:600, color:'#111', marginBottom:'12px' }}>Autentificare în 2 pași</div>
                <div style={{ fontSize:'14px', color:'#555', marginBottom:'18px' }}>Activează una sau ambele metode pentru securitate sporită</div>
                
                <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', background:'#f8f9fa', borderRadius:'8px' }}>
                    <div>
                      <div style={{ fontSize:'15px', fontWeight:500, color:'#111' }}>SMS</div>
                      <div style={{ fontSize:'13px', color:'#555' }}>Cod trimis pe numărul de telefon înregistrat</div>
                    </div>
                    <button style={{ padding:'8px 18px', background:'#16705a', color:'white', border:'none', borderRadius:'6px', fontSize:'13px', cursor:'pointer' }}>Activează</button>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', background:'#f8f9fa', borderRadius:'8px' }}>
                    <div>
                      <div style={{ fontSize:'15px', fontWeight:500, color:'#111' }}>Google Authenticator</div>
                      <div style={{ fontSize:'13px', color:'#555' }}>Cod generat de aplicația Google Authenticator</div>
                    </div>
                    <button style={{ padding:'8px 18px', background:'#16705a', color:'white', border:'none', borderRadius:'6px', fontSize:'13px', cursor:'pointer' }}>Activează</button>
                  </div>
                </div>

                <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'22px' }}>
                  <button onClick={handleSalvare} disabled={salvare} style={{ padding:'12px 30px', background:'#16705a', color:'white', border:'none', borderRadius:'8px', fontSize:'16px', fontWeight:600, cursor:'pointer' }}>
                    {salvare ? 'Se salvează...' : 'Salvează'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SECȚIUNEA 2: IDENTITATE */}
          <div style={{ background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', marginBottom:'16px', overflow:'hidden' }}>
            <Banner icon={IconId} title="Identitate" sub="Date extrase din actul de identitate" skey="identitate" />
            {sectiuni.identitate && (
              <div style={{ padding:'22px 24px' }}>
                <div style={{ fontSize:'16px', fontWeight:600, color:'#111', marginBottom:'12px' }}>Verifică-ți identitatea</div>
                <div style={{ fontSize:'14px', color:'#555', marginBottom:'18px' }}>Uploadează o fotografie a actului tău de identitate. Imaginea nu va fi stocată.</div>
                
                <div style={{ display:'flex', gap:'14px', marginBottom:'18px', flexWrap:'wrap', alignItems:'center' }}>
                  <label style={{ padding:'12px 24px', background:'#16705a', color:'white', border:'none', borderRadius:'8px', fontSize:'15px', fontWeight:500, cursor:'pointer', display:'inline-block' }}>
                    📷 Uploadează CI
                    <input type="file" accept="image/*" style={{ display:'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleUploadCI(f) }} />
                  </label>
                  {identitateVerificata && (
                    <>
                      <span style={{ padding:'10px 18px', background:'#E1F5EE', color:'#0F6E56', borderRadius:'8px', fontSize:'14px', fontWeight:500 }}>
                        ✔ Identitate verificată
                      </span>
                      <button onClick={handleReincarcaCI} style={{ padding:'8px 16px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#111', cursor:'pointer' }}>
                        Reîncarcă CI
                      </button>
                    </>
                  )}
                </div>

                <div style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'18px', padding:'12px 16px', background:'#f8f9fa', borderRadius:'8px' }}>
                  <label style={{ fontSize:'14px', color:'#555', display:'flex', alignItems:'center', gap:'8px', cursor:'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={modManual} 
                      onChange={() => setModManual(!modManual)} 
                      style={{ width:'18px', height:'18px', cursor:'pointer' }}
                    />
                    Introducere manuală (nu am CI disponibil)
                  </label>
                </div>

                <div style={{ padding:'14px 18px', background:'#FFF8E6', borderRadius:'8px', marginBottom:'18px', fontSize:'13px', color:'#8A6D00' }}>
                  ⚠️ Prin uploadarea actului de identitate confirmi că datele sunt ale tale și sunt corecte. Imaginea CI nu va fi stocată — doar datele extrase.
                  {modManual && (
                    <div style={{ marginTop:'8px' }}>
                      ⚠️ Ai ales introducerea manuală. Te rugăm să completezi toate datele corect.
                    </div>
                  )}
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
                  <div>
                    <label style={lbl}>Nume</label>
                    <input value={nume} onChange={e => setNume(e.target.value)} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Prenume</label>
                    <input value={prenume} onChange={e => setPrenume(e.target.value)} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>CNP</label>
                    <input 
                      value={cnp} 
                      onChange={e => {
                        const val = e.target.value
                        if (!/^\d*$/.test(val)) return
                        setCnp(val)
                        if (val.length === 13) {
                          if (validCNP(val)) {
                            const sexExtras = extrageSexDinCNP(val)
                            if (sexExtras) setSex(sexExtras)
                            const dataExtrasa = extrageDataNasteriiDinCNP(val)
                            if (dataExtrasa) setDataNasterii(dataExtrasa)
                            setEroareCNP('')
                          } else {
                            setEroareCNP('CNP invalid — verifică numărul introdus.')
                          }
                        } else if (val.length > 0 && val.length < 13) {
                          setEroareCNP('CNP-ul trebuie să aibă 13 cifre.')
                        } else {
                          setEroareCNP('')
                        }
                      }} 
                      placeholder="2780315••••••" 
                      style={inp} 
                      disabled={!modManual && identitateVerificata}
                    />
                    {!modManual && identitateVerificata && (
                      <div style={{ fontSize:'12px', color:'#16705a', marginTop:'4px' }}>
                        CNP extras automat din CI
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={lbl}>Sex</label>
                    <div style={{ display:'flex', gap:'16px', marginTop:'6px' }}>
                      {['F','M'].map(s => (
                        <label key={s} style={{ display:'flex', alignItems:'center', gap:'7px', fontSize:'14px', cursor:'pointer', color:'#111' }}>
                          <div onClick={() => setSex(s)} style={{ width:'18px', height:'18px', borderRadius:'50%', border:'1.5px solid #16705a', background: sex===s?'#16705a':'white', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                            {sex===s && <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'white' }}></div>}
                          </div>
                          {s==='F'?'Feminin':'Masculin'}
                        </label>
                      ))}
                    </div>
                    {!modManual && identitateVerificata && (
                      <div style={{ fontSize:'12px', color:'#16705a', marginTop:'4px' }}>
                        Sex extras automat din CI
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={lbl}>Data nașterii</label>
                    <input 
                      value={dataNasterii} 
                      onChange={e => setDataNasterii(e.target.value)} 
                      placeholder="15.03.1978" 
                      style={inp} 
                      disabled={!modManual && identitateVerificata}
                    />
                    {!modManual && identitateVerificata && (
                      <div style={{ fontSize:'12px', color:'#16705a', marginTop:'4px' }}>
                        Data extrasă automat din CI
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={lbl}>Cetățenie</label>
                    <select value={cetatenie} onChange={e => setCetatenie(e.target.value)} style={{ ...inp, cursor:'pointer' }}>
                      <option>Română</option>
                      <option>Alta</option>
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Adresă</label>
                    <input value={adresa} onChange={e => setAdresa(e.target.value)} placeholder="Completează manual" style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Județ</label>
                    <input value={judet} onChange={e => setJudet(e.target.value)} placeholder="București" style={inp} />
                  </div>
                </div>

                <div style={{ padding:'14px 18px', background:'#FFF8E6', borderRadius:'8px', marginTop:'18px', fontSize:'13px', color:'#8A6D00' }}>
                  ⚠️ Nu am putut extrage adresa din CI. Te rugăm să o completezi manual.
                </div>

                <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'22px' }}>
                  <button onClick={handleSalvare} disabled={salvare} style={{ padding:'12px 30px', background:'#16705a', color:'white', border:'none', borderRadius:'8px', fontSize:'16px', fontWeight:600, cursor:'pointer' }}>
                    {salvare ? 'Se salvează...' : 'Salvează'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SECȚIUNEA 3: ABONAMENT */}
          <div style={{ background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', marginBottom:'16px', overflow:'hidden' }}>
            <Banner icon={IconCreditCard} title="Abonament" sub="Planul tău curent" skey="abonament" />
            {sectiuni.abonament && (
              <div style={{ padding:'22px 24px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div>
                    <div style={{ fontSize:'15px', fontWeight:500, color:'#111' }}>Plan curent</div>
                    <div style={{ fontSize:'14px', color:'#555', marginTop:'3px' }}>Panoramic MedLog Basic</div>
                  </div>
                  <Link href="/pricing" style={{ padding:'10px 20px', background:'#16705a', color:'white', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:500, cursor:'pointer', textDecoration:'none', display:'inline-block' }}>Upgrade</Link>
                </div>
              </div>
            )}
          </div>

          {/* SECȚIUNEA 4: EXPORT DATE */}
          <div style={{ background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', marginBottom:'16px', overflow:'hidden' }}>
            <Banner icon={IconDownload} title="Export date" sub="Descarcă toate datele tale din Panoramic MedLog" skey="export" />
            {sectiuni.export && (
              <div style={{ padding:'22px 24px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div>
                    <div style={{ fontSize:'15px', fontWeight:500, color:'#111' }}>Export complet dosar</div>
                    <div style={{ fontSize:'14px', color:'#555', marginTop:'3px' }}>Analize + Card urgență în format PDF</div>
                  </div>
                  <button style={{ padding:'10px 18px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'14px', color:'#111', cursor:'pointer', fontWeight:500 }}>⬇ Descarcă</button>
                </div>
              </div>
            )}
          </div>

          {/* SECȚIUNEA 5: CONFIDENTIALITATE */}
          <div style={{ background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', marginBottom:'16px', overflow:'hidden' }}>
            <Banner icon={IconLock} title="Confidențialitate" sub="Drepturile tale conform GDPR" skey="confidentialitate" />
            {sectiuni.confidentialitate && (
              <div style={{ padding:'22px 24px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
                  <div>
                    <div style={{ fontSize:'15px', fontWeight:500, color:'#111' }}>Politica de confidențialitate</div>
                    <div style={{ fontSize:'14px', color:'#555', marginTop:'3px' }}>Vezi cum procesăm datele tale</div>
                  </div>
                  <button onClick={handleVeziPolitica} style={{ padding:'10px 18px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'14px', color:'#111', cursor:'pointer', fontWeight:500 }}>Vezi →</button>
                </div>
                <div style={{ height:'0.5px', background:'#e5e7eb', margin:'16px 0' }}></div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div>
                    <div style={{ fontSize:'15px', fontWeight:500, color:'#E24B4A' }}>Ștergere cont</div>
                    <div style={{ fontSize:'14px', color:'#555', marginTop:'3px' }}>Toate datele tale vor fi șterse permanent</div>
                  </div>
                  <button onClick={handleStergeContConfirm} style={{ padding:'10px 18px', background:'white', border:'0.5px solid #E24B4A', borderRadius:'8px', fontSize:'14px', color:'#E24B4A', cursor:'pointer', fontWeight:500 }}>Șterge cont</button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}