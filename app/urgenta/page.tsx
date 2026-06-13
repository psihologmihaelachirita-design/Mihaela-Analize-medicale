'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IconId, IconStethoscope, IconDeviceHeartMonitor, IconScissors, IconPhone, IconQrcode } from '@tabler/icons-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function calculeazaVarsta(cnp: string): number | null {
  if (!cnp || cnp.length !== 13) return null
  const an2 = parseInt(cnp.slice(1, 3))
  const luna = parseInt(cnp.slice(3, 5))
  const zi = parseInt(cnp.slice(5, 7))
  const sex = parseInt(cnp[0])
  let an = sex <= 2 ? 1900 + an2 : sex <= 4 ? 1800 + an2 : sex <= 6 ? 2000 + an2 : 1900 + an2
  const azi = new Date()
  let varsta = azi.getFullYear() - an
  if (azi.getMonth() + 1 < luna || (azi.getMonth() + 1 === luna && azi.getDate() < zi)) varsta--
  return varsta
}

function calculeazaDataNasterii(cnp: string): string {
  if (!cnp || cnp.length !== 13) return ''
  const an2 = parseInt(cnp.slice(1, 3))
  const luna = cnp.slice(3, 5)
  const zi = cnp.slice(5, 7)
  const sex = parseInt(cnp[0])
  let an = sex <= 2 ? 1900 + an2 : sex <= 4 ? 1800 + an2 : sex <= 6 ? 2000 + an2 : 1900 + an2
  return `${zi}.${luna}.${an}`
}

function calculeazaSex(cnp: string): string {
  if (!cnp || cnp.length !== 13) return ''
  return parseInt(cnp[0]) % 2 === 1 ? 'Masculin' : 'Feminin'
}

function calculeazaIMC(greutate: number, inaltime: number) {
  const imc = greutate / ((inaltime / 100) ** 2)
  const val = imc.toFixed(1)
  const label = imc < 18.5 ? 'Subponderal' : imc < 25 ? 'Greutate normală' : imc < 30 ? 'Supraponderal' : 'Obezitate'
  return { valoare: val, label }
}

export default function Urgenta() {
  const [user, setUser] = useState<any>(null)
  const [profil, setProfil] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [salvare, setSalvare] = useState(false)
  const [mesaj, setMesaj] = useState('')
  const [dropdown, setDropdown] = useState(false)
  const router = useRouter()

  // Câmpuri editabile
  const [cnp, setCnp] = useState('')
  const [grupSanguin, setGrupSanguin] = useState('')
  const [alergiiMed, setAlergiiMed] = useState('')
  const [alergiiAl, setAlergiiAl] = useState('')
  const [boliCronice, setBoliCronice] = useState('')
  const [implante, setImplante] = useState('')
  const [contactNume, setContactNume] = useState('')
  const [contactTel, setContactTel] = useState('')
  const [medicNume, setMedicNume] = useState('')
  const [medicTel, setMedicTel] = useState('')
  const [asiguratCnas, setAsiguratCnas] = useState(false)
  const [greutate, setGreutate] = useState('')
  const [inaltime, setInaltime] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      const { data } = await supabase.from('profiluri').select('*').eq('id', session.user.id).single()
      if (data) {
        setProfil(data)
        setCnp(data.cnp || '')
        setGrupSanguin(data.grup_sanguin || '')
        setAlergiiMed(data.alergii_medicamente || '')
        setAlergiiAl(data.alergii_alimentare || '')
        setBoliCronice(data.boli_cronice || '')
        setImplante(data.implante || '')
        setContactNume(data.contact_urgenta_nume || '')
        setContactTel(data.contact_urgenta_telefon || '')
        setMedicNume(data.medic_familie_nume || '')
        setMedicTel(data.medic_familie_telefon || '')
        setAsiguratCnas(data.asigurat_cnas || false)
        setGreutate(data.greutate?.toString() || '')
        setInaltime(data.inaltime?.toString() || '')
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
      cnp: cnp || null,
      grup_sanguin: grupSanguin || null,
      alergii_medicamente: alergiiMed || null,
      alergii_alimentare: alergiiAl || null,
      boli_cronice: boliCronice || null,
      implante: implante || null,
      contact_urgenta_nume: contactNume || null,
      contact_urgenta_telefon: contactTel || null,
      medic_familie_nume: medicNume || null,
      medic_familie_telefon: medicTel || null,
      asigurat_cnas: asiguratCnas,
      greutate: parseFloat(greutate) || null,
      inaltime: parseFloat(inaltime) || null,
    })
    if (error) setMesaj('Eroare: ' + error.message)
    else { setMesaj('Salvat!'); setEditMode(false) }
    setSalvare(false)
    setTimeout(() => setMesaj(''), 3000)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'system-ui' }}><p style={{ color:'#111' }}>Se încarcă...</p></div>

  const username = profil?.nume || user?.email?.split('@')[0]
  const varsta = cnp.length === 13 ? calculeazaVarsta(cnp) : profil?.varsta
  const dataNasterii = cnp.length === 13 ? calculeazaDataNasterii(cnp) : ''
  const sex = cnp.length === 13 ? calculeazaSex(cnp) : profil?.sex
  const imcVal = greutate && inaltime ? calculeazaIMC(parseFloat(greutate), parseFloat(inaltime)) : null
  const diagnostice = boliCronice ? boliCronice.split(',').map((d: string) => d.trim()).filter(Boolean) : []
  const implanteList = implante ? implante.split(',').map((d: string) => d.trim()).filter(Boolean) : []

  const navStyle: React.CSSProperties = { padding:'6px 10px', borderRadius:'8px', fontSize:'13px', color:'#111', textDecoration:'none', fontWeight:500 }
  const card: React.CSSProperties = { background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', overflow:'hidden', marginBottom:'12px' }
  const body: React.CSSProperties = { padding:'18px 20px' }
  const inp: React.CSSProperties = { width:'100%', padding:'9px 13px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#111', background:'white', outline:'none', fontFamily:'system-ui' }
  const ta: React.CSSProperties = { ...inp, resize:'none', height:'72px', background:'#f8f9fa' }
  const lbl: React.CSSProperties = { fontSize:'11px', fontWeight:500, color:'#555', textTransform:'uppercase' as const, letterSpacing:'0.5px', marginBottom:'5px', display:'block' }
  const g2: React.CSSProperties = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }
  const g4: React.CSSProperties = { display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:'14px', marginBottom:'14px' }

  function BadgeDoc({ tip }: { tip: 'atestat' | 'declarat' | 'necunoscut' }) {
    const cfg = {
      atestat: { bg:'#E1F5EE', color:'#085041', label:'✓ Document care atestă' },
      declarat: { bg:'#f8f9fa', color:'#111', label:'⚠ Declarat de titular' },
      necunoscut: { bg:'#f8f9fa', color:'#aaa', label:'— Necunoscut' },
    }[tip]
    return <span style={{ display:'inline-flex', padding:'4px 10px', background:cfg.bg, color:cfg.color, borderRadius:'12px', fontSize:'11px', fontWeight:500 }}>{cfg.label}</span>
  }

  function Banner({ icon, title, sub, onAdd }: { icon: React.ReactNode, title: string, sub: string, onAdd?: () => void }) {
    return (
      <div style={{ background:'#16705a', padding:'14px 20px', display:'flex', alignItems:'center', gap:'10px' }}>
        <div style={{ width:'28px', height:'28px', background:'rgba(255,255,255,0.15)', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{icon}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:'14px', fontWeight:500, color:'white' }}>{title}</div>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.75)', marginTop:'1px' }}>{sub}</div>
        </div>
        {onAdd && <div onClick={onAdd} style={{ fontSize:'13px', color:'rgba(255,255,255,0.9)', fontWeight:500, cursor:'pointer' }}>+ Adaugă</div>}
      </div>
    )
  }

  function Val({ label, value }: { label: string, value: string }) {
    return (
      <div>
        <div style={lbl}>{label}</div>
        <div style={{ fontSize:'14px', fontWeight:500, color:'#111' }}>{value || '—'}</div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily:'system-ui,-apple-system,sans-serif', background:'#f8f9fa', minHeight:'100vh' }} onClick={() => setDropdown(false)}>

      {/* Topbar */}
      <div style={{ background:'white', borderBottom:'0.5px solid #e5e7eb', padding:'0 24px', height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'32px', height:'32px', background:'#E1F5EE', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', color:'#0F6E56', fontSize:'16px', fontWeight:600 }}>✚</div>
          <span style={{ fontSize:'18px', fontWeight:600, color:'#111' }}>MedFile</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
          <Link href="/panoramic" style={navStyle}>Panoramic</Link>
          <Link href="/urgenta" style={{ ...navStyle, background:'#E1F5EE', color:'#085041' }}>Urgență</Link>
          <Link href="/dosar" style={navStyle}>Dosar</Link>
          <Link href="/upload" style={{ ...navStyle, background:'#16705a', color:'white', padding:'6px 14px', marginLeft:'4px' }}>+ Adaugă</Link>
          <div style={{ position:'relative', marginLeft:'8px' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setDropdown(!dropdown)} style={{ padding:'6px 12px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#111', background:'white', cursor:'pointer', fontWeight:500 }}>{username} ▾</button>
            {dropdown && (
              <div style={{ position:'absolute', right:0, top:'36px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', padding:'4px', minWidth:'140px', boxShadow:'0 4px 12px rgba(0,0,0,0.08)', zIndex:100 }}>
                <Link href="/cont" style={{ display:'block', padding:'8px 12px', fontSize:'13px', color:'#111', textDecoration:'none', borderRadius:'6px' }}>Cont</Link>
                <div onClick={handleLogout} style={{ padding:'8px 12px', fontSize:'13px', color:'#E24B4A', cursor:'pointer', borderRadius:'6px' }}>Ieșire</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:'720px', margin:'0 auto', padding:'28px 24px' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'24px' }}>
          <div>
            <div style={{ fontSize:'20px', fontWeight:500, color:'#111' }}>Card de urgență MedFile</div>
            <div style={{ fontSize:'13px', color:'#111', marginTop:'4px' }}>Date extrase automat sau declarate de titular</div>
          </div>
          <div style={{ display:'flex', gap:'8px' }}>
            {!editMode ? (
              <>
                <button onClick={() => setEditMode(true)} style={{ padding:'9px 16px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#111', cursor:'pointer', fontWeight:500 }}>✎ Editează</button>
                <button style={{ padding:'9px 18px', background:'#16705a', color:'white', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:500, cursor:'pointer' }}>⎙ Printează</button>
              </>
            ) : (
              <>
                <button onClick={() => setEditMode(false)} style={{ padding:'9px 16px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#111', cursor:'pointer', fontWeight:500 }}>Anulează</button>
                <button onClick={handleSalvare} disabled={salvare} style={{ padding:'9px 18px', background:'#16705a', color:'white', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:500, cursor:'pointer' }}>{salvare ? 'Se salvează...' : 'Salvează'}</button>
              </>
            )}
          </div>
        </div>

        {mesaj && <div style={{ padding:'12px 16px', borderRadius:'8px', marginBottom:'16px', background: mesaj.includes('Eroare') ? '#FCEBEB' : '#E1F5EE', color: mesaj.includes('Eroare') ? '#A32D2D' : '#0F6E56', fontSize:'13px' }}>{mesaj}</div>}

        {/* DATE DE URGENTA */}
        <div style={card}>
          <Banner icon={<IconId size={14} color="white" stroke={1.5} />} title="Date de urgență" sub="CNP, vârstă și parametri fizici" />
          <div style={body}>
            {editMode ? (
              <>
                <div style={{ ...g2, marginBottom:'14px' }}>
                  <div><label style={lbl}>CNP</label><input value={cnp} onChange={e => setCnp(e.target.value)} placeholder="13 cifre" maxLength={13} style={inp} /></div>
                  <div style={{ ...g2 }}>
                    <div><label style={lbl}>Greutate (kg)</label><input type="number" value={greutate} onChange={e => setGreutate(e.target.value)} placeholder="ex: 65" style={inp} /></div>
                    <div><label style={lbl}>Înălțime (cm)</label><input type="number" value={inaltime} onChange={e => setInaltime(e.target.value)} placeholder="ex: 168" style={inp} /></div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={g4}>
                  <Val label="Nume" value={profil?.nume?.split(' ')[0] || ''} />
                  <Val label="Prenume" value={profil?.nume?.split(' ').slice(1).join(' ') || ''} />
                  <div>
                    <div style={lbl}>CNP</div>
                    <div style={{ fontSize:'14px', fontWeight:500, color:'#111', letterSpacing:'1px' }}>{cnp ? cnp[0] + '••••••••••••' : '—'}</div>
                  </div>
                  <Val label="Data nașterii" value={dataNasterii} />
                </div>
                <div style={g4}>
                  <Val label="Vârstă" value={varsta ? `${varsta} ani` : ''} />
                  <Val label="Sex" value={sex || ''} />
                  <Val label="Înălțime" value={inaltime ? `${inaltime} cm` : ''} />
                  <Val label="Greutate" value={greutate ? `${greutate} kg` : ''} />
                </div>
                {imcVal && (
                  <>
                    <div style={{ height:'0.5px', background:'#e5e7eb', margin:'14px 0' }}></div>
                    <div>
                      <div style={lbl}>Indice de masă corporală (IMC)</div>
                      <div style={{ fontSize:'14px', fontWeight:500, color:'#111' }}>{imcVal.valoare}</div>
                      <span style={{ display:'inline-flex', padding:'3px 10px', background:'#E1F5EE', color:'#085041', borderRadius:'12px', fontSize:'12px', fontWeight:500, marginTop:'4px' }}>✓ {imcVal.label}</span>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* GRUP SANGUIN + ALERGII */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px', marginBottom:'12px' }}>
          {[
            { label:'Grup sanguin și Rh', val: grupSanguin, set: setGrupSanguin, big: true, placeholder:'ex: A+' },
            { label:'Alergii medicamentoase', val: alergiiMed, set: setAlergiiMed, big: false, placeholder:'ex: Penicilină' },
            { label:'Alte alergii cunoscute', val: alergiiAl, set: setAlergiiAl, big: false, placeholder:'ex: Nuci' },
          ].map((item, i) => (
            <div key={i} style={{ background:'white', border:'0.5px solid #e5e7eb', borderRadius:'10px', padding:'14px', display:'flex', flexDirection:'column', gap:'8px' }}>
              <div style={lbl}>{item.label}</div>
              {editMode ? (
                <input value={item.val} onChange={e => item.set(e.target.value)} placeholder={item.placeholder} style={inp} />
              ) : (
                <div style={{ fontSize: item.big ? '24px' : '13px', fontWeight:500, color: item.big ? '#E24B4A' : '#111' }}>{item.val || '—'}</div>
              )}
              <BadgeDoc tip={item.val ? 'declarat' : 'necunoscut'} />
            </div>
          ))}
        </div>

        {/* DIAGNOSTICE CRONICE */}
        <div style={card}>
          <Banner icon={<IconStethoscope size={14} color="white" stroke={1.5} />} title="Diagnostice cronice" sub="Extrase din documente sau declarate de titular" />
          <div style={body}>
            {editMode ? (
              <div><label style={lbl}>Diagnostice — separate prin virgulă</label><textarea value={boliCronice} onChange={e => setBoliCronice(e.target.value)} placeholder="ex: Hipotiroidism Hashimoto, Diabet tip 2..." style={ta} /></div>
            ) : (
              diagnostice.length === 0 ? (
                <div style={{ fontSize:'13px', color:'#111' }}>Niciun diagnostic adăugat</div>
              ) : (
                <div style={{ display:'flex', gap:'12px', overflowX:'auto', paddingBottom:'8px' }}>
                  {diagnostice.map((d: string, i: number) => (
                    <div key={i} style={{ background:'#f8f9fa', border:'0.5px solid #e5e7eb', borderRadius:'10px', padding:'16px', minWidth:'220px', maxWidth:'220px', display:'flex', flexDirection:'column', gap:'10px', flexShrink:0 }}>
                      <div style={{ fontSize:'14px', fontWeight:500, color:'#111' }}>{d}</div>
                      <BadgeDoc tip="declarat" />
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        {/* IMPLANTE */}
        <div style={card}>
          <Banner icon={<IconDeviceHeartMonitor size={14} color="white" stroke={1.5} />} title="Implante și dispozitive medicale" sub={implanteList.length > 0 ? 'Extrase din documente sau declarate de titular' : 'Nicio intrare adăugată'} onAdd={!editMode && implanteList.length === 0 ? () => setEditMode(true) : undefined} />
          {(editMode || implanteList.length > 0) && (
            <div style={body}>
              {editMode ? (
                <div><label style={lbl}>Implante — separate prin virgulă</label><textarea value={implante} onChange={e => setImplante(e.target.value)} placeholder="ex: Stent coronarian 2019, Pace-maker..." style={ta} /></div>
              ) : (
                <div style={{ display:'flex', gap:'12px', overflowX:'auto', paddingBottom:'8px' }}>
                  {implanteList.map((imp: string, i: number) => (
                    <div key={i} style={{ background:'#f8f9fa', border:'0.5px solid #e5e7eb', borderRadius:'10px', padding:'16px', minWidth:'220px', maxWidth:'220px', display:'flex', flexDirection:'column', gap:'10px', flexShrink:0 }}>
                      <div style={{ fontSize:'14px', fontWeight:500, color:'#111' }}>{imp}</div>
                      <BadgeDoc tip="declarat" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* INTERVENTII */}
        <div style={card}>
          <Banner icon={<IconScissors size={14} color="white" stroke={1.5} />} title="Intervenții chirurgicale majore" sub="Nicio intrare adăugată" onAdd={!editMode ? () => setEditMode(true) : undefined} />
          {editMode && (
            <div style={body}>
              <div style={{ fontSize:'13px', color:'#111' }}>Funcționalitate în curând disponibilă</div>
            </div>
          )}
        </div>

        {/* DATE CONTACT */}
        <div style={card}>
          <Banner icon={<IconPhone size={14} color="white" stroke={1.5} />} title="Date de contact" sub="Introduse de titular" />
          <div style={body}>
            {editMode ? (
              <>
                <div style={{ ...g2, marginBottom:'14px' }}>
                  <div><label style={lbl}>Persoană de contact — Nume</label><input value={contactNume} onChange={e => setContactNume(e.target.value)} placeholder="ex: Ion Popescu" style={inp} /></div>
                  <div><label style={lbl}>Persoană de contact — Telefon</label><input value={contactTel} onChange={e => setContactTel(e.target.value)} placeholder="ex: 0721 000 000" style={inp} /></div>
                </div>
                <div style={{ height:'0.5px', background:'#e5e7eb', margin:'14px 0' }}></div>
                <div style={{ ...g2, marginBottom:'14px' }}>
                  <div><label style={lbl}>Medic de familie — Nume</label><input value={medicNume} onChange={e => setMedicNume(e.target.value)} placeholder="ex: Dr. Maria Ionescu" style={inp} /></div>
                  <div><label style={lbl}>Medic de familie — Telefon</label><input value={medicTel} onChange={e => setMedicTel(e.target.value)} placeholder="ex: 021 000 0000" style={inp} /></div>
                </div>
                <div style={{ height:'0.5px', background:'#e5e7eb', margin:'14px 0' }}></div>
                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                  <label style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', color:'#111', cursor:'pointer' }}>
                    <div onClick={() => setAsiguratCnas(!asiguratCnas)} style={{ width:'16px', height:'16px', borderRadius:'4px', border:'0.5px solid #e5e7eb', background: asiguratCnas ? '#16705a' : 'white', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                      {asiguratCnas && <span style={{ color:'white', fontSize:'11px', fontWeight:700 }}>✓</span>}
                    </div>
                    Asigurat CNAS
                  </label>
                </div>
              </>
            ) : (
              <>
                <div style={{ ...g2, marginBottom:'14px' }}>
                  <div>
                    <div style={lbl}>Persoană de contact urgență</div>
                    <div style={{ fontSize:'14px', fontWeight:500, color:'#111' }}>{contactNume || '—'}</div>
                    <div style={{ fontSize:'13px', color:'#111', marginTop:'2px' }}>{contactTel}</div>
                  </div>
                  <div>
                    <div style={lbl}>Medic de familie</div>
                    <div style={{ fontSize:'14px', fontWeight:500, color:'#111' }}>{medicNume || '—'}</div>
                    <div style={{ fontSize:'13px', color:'#111', marginTop:'2px' }}>{medicTel}</div>
                  </div>
                </div>
                <div style={{ height:'0.5px', background:'#e5e7eb', margin:'14px 0' }}></div>
                <div>
                  <div style={lbl}>Asigurare CNAS</div>
                  <span style={{ display:'inline-flex', padding:'4px 12px', background: asiguratCnas ? '#E1F5EE' : '#f8f9fa', color: asiguratCnas ? '#085041' : '#555', borderRadius:'12px', fontSize:'12px', fontWeight:500, marginTop:'6px' }}>
                    {asiguratCnas ? '✓ Asigurat CNAS' : '— Nedeclarat'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* QR COD */}
        <div style={card}>
          <Banner icon={<IconQrcode size={14} color="white" stroke={1.5} />} title="QR Cod de urgență" sub="Date embedded offline — funcționează fără internet" />
          <div style={body}>
            <div style={{ display:'flex', gap:'20px', alignItems:'center' }}>
              <div style={{ width:'100px', height:'100px', background:'#f8f9fa', border:'0.5px solid #e5e7eb', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <IconQrcode size={56} color="#e5e7eb" stroke={1} />
              </div>
              <div>
                <div style={{ fontSize:'14px', fontWeight:500, color:'#111', marginBottom:'4px' }}>Scanează pentru acces instant</div>
                <div style={{ fontSize:'12px', color:'#111', lineHeight:1.6, marginBottom:'12px' }}>QR codul va conține datele tale critice de urgență encodate direct. În curând disponibil.</div>
                <div style={{ display:'flex', gap:'8px' }}>
                  <button style={{ padding:'7px 14px', background:'#16705a', color:'white', border:'none', borderRadius:'8px', fontSize:'12px', fontWeight:500, cursor:'pointer' }}>⬇ Descarcă QR</button>
                  <button style={{ padding:'7px 14px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'12px', color:'#111', cursor:'pointer', fontWeight:500 }}>⎙ Printează card</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DISCLAIMER */}
        <div style={{ background:'white', borderLeft:'4px solid #E24B4A', borderTop:'0.5px solid #e5e7eb', borderRight:'0.5px solid #e5e7eb', borderBottom:'0.5px solid #e5e7eb', borderRadius:'10px', padding:'20px 24px', marginTop:'4px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
            <span style={{ color:'#E24B4A', fontSize:'20px' }}>⚠</span>
            <div style={{ fontSize:'14px', fontWeight:600, color:'#111' }}>Responsabilitatea datelor</div>
          </div>
          <div style={{ fontSize:'13px', color:'#111', lineHeight:1.8 }}>
            Datele din acest card sunt declarate de titular sau extrase din documente medicale atașate de titular. MedFile nu verifică, nu validează și nu certifică nicio informație medicală. Orice decizie clinică aparține exclusiv medicului curant, care are obligația să verifice datele înainte de orice intervenție.
          </div>
        </div>

      </div>
    </div>
  )
}