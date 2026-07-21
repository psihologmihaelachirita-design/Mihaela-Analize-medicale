'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Topbar from '@/components/Topbar'
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

function parseAlergii(val: string | null): string[] {
  if (!val) return ['']
  try {
    const parsed = JSON.parse(val)
    if (Array.isArray(parsed)) return parsed.length > 0 ? parsed : ['']
  } catch {}
  return val.split(',').map(s => s.trim()).filter(Boolean).length > 0
    ? val.split(',').map(s => s.trim()).filter(Boolean)
    : ['']
}

interface DiagnosticItem { id: string; nume: string; dataStart: string; specialist: string; specialitate: string; undeUrmarit: string; medicatie: string; atestat: boolean }
interface ImplantItem { id: string; nume: string; dataImplant: string; spital: string; observatii: string; atestat: boolean }
interface InterventieItem { id: string; nume: string; dataInterventie: string; spital: string; chirurg: string; atestat: boolean }

function AlergiiView({ list }: { list: string[] }) {
  const filtered = list.filter(Boolean)
  if (filtered.length === 0) return <div style={{ fontSize:'13px', color:'#111' }}>—</div>
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
      {filtered.map((a, i) => <div key={i} style={{ fontSize:'13px', fontWeight:500, color:'#111' }}>{a}</div>)}
    </div>
  )
}

function AlergiiInput({ value, onChange, placeholder, style }: { value: string, onChange: (v: string) => void, placeholder: string, style: React.CSSProperties }) {
  return <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={style} />
}

function BadgeDoc({ atestat }: { atestat: boolean }) {
  return atestat
    ? <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', padding:'4px 10px', background:'#E1F5EE', color:'#085041', borderRadius:'12px', fontSize:'11px', fontWeight:500 }}>✓ Document care atestă</span>
    : <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', padding:'4px 10px', background:'#FEF3C7', color:'#B45309', borderRadius:'12px', fontSize:'11px', fontWeight:500 }}>Fără document care atestă</span>
}

function Banner({ icon, title, sub, onAdd, onToggle }: { icon: React.ReactNode, title: string, sub: string, onAdd?: () => void, onToggle?: () => void }) {
  return (
    <div onClick={onToggle} style={{ background:'#16705a', padding:'14px 20px', display:'flex', alignItems:'center', gap:'10px', cursor: onToggle ? 'pointer' : 'default' }}>
      <div style={{ width:'28px', height:'28px', background:'rgba(255,255,255,0.15)', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{icon}</div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:'14px', fontWeight:500, color:'white' }}>{title}</div>
        <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.75)', marginTop:'1px' }}>{sub}</div>
      </div>
      {onAdd && <div onClick={e => { e.stopPropagation(); onAdd() }} style={{ fontSize:'13px', color:'rgba(255,255,255,0.9)', fontWeight:500, cursor:'pointer' }}>+ Adaugă</div>}
      {onToggle && <span style={{ color:'rgba(255,255,255,0.8)', fontSize:'12px', marginLeft:'8px' }}>▼</span>}
    </div>
  )
}

function Checkbox({ checked, onChange, label }: { checked: boolean, onChange: () => void, label: string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer' }} onClick={onChange}>
      <div style={{ width:'16px', height:'16px', borderRadius:'4px', border:'0.5px solid #e5e7eb', background: checked ? '#16705a' : 'white', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        {checked && <span style={{ color:'white', fontSize:'11px', fontWeight:700 }}>✓</span>}
      </div>
      <span style={{ fontSize:'13px', color:'#111' }}>{label}</span>
    </div>
  )
}

type SectiuneKey = 'urgenta' | 'diagnostice' | 'implanturi' | 'interventii' | 'contact' | 'qr'
const sidebarItems: { key: SectiuneKey, label: string, Icon: any }[] = [
  { key:'urgenta', label:'Date de urgență', Icon: IconId },
  { key:'diagnostice', label:'Diagnostice cronice', Icon: IconStethoscope },
  { key:'implanturi', label:'Implanturi', Icon: IconDeviceHeartMonitor },
  { key:'interventii', label:'Intervenții chirurgicale', Icon: IconScissors },
  { key:'contact', label:'Date de contact', Icon: IconPhone },
  { key:'qr', label:'QR Cod', Icon: IconQrcode },
]

export default function Urgenta() {
  const [user, setUser] = useState<any>(null)
  const [profil, setProfil] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [salvare, setSalvare] = useState(false)
  const [mesaj, setMesaj] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [dropdown, setDropdown] = useState(false)
  const [dropdownAdd, setDropdownAdd] = useState(false)
  const [sectiuni, setSectiuni] = useState<Record<SectiuneKey, boolean>>({ urgenta: true, diagnostice: true, implanturi: true, interventii: true, contact: true, qr: true })
  const router = useRouter()

  function toggleSectiune(key: SectiuneKey) { setSectiuni(prev => ({ ...prev, [key]: !prev[key] })) }

  const [cnp, setCnp] = useState('')
  const [grupSanguin, setGrupSanguin] = useState('')
  const [grupSanguinAtestat, setGrupSanguinAtestat] = useState(false)
  const [alergiiMed, setAlergiiMed] = useState<string[]>([''])
  const [alergiiAl, setAlergiiAl] = useState<string[]>([''])
  const [contactNume, setContactNume] = useState('')
  const [contactTel, setContactTel] = useState('')
  const [medicNume, setMedicNume] = useState('')
  const [medicTel, setMedicTel] = useState('')
  const [asiguratCnas, setAsiguratCnas] = useState(false)
  const [fumator, setFumator] = useState<boolean | null>(null)
  const [greutate, setGreutate] = useState('')
  const [inaltime, setInaltime] = useState('')
  const [diagnostice, setDiagnostice] = useState<DiagnosticItem[]>([])
  const [implanteList, setImplanteList] = useState<ImplantItem[]>([])
  const [interventii, setInterventii] = useState<InterventieItem[]>([])

  const updateAlergiiMed = (i: number, val: string) => setAlergiiMed(prev => prev.map((x, j) => j === i ? val : x))
  const updateAlergiiAl = (i: number, val: string) => setAlergiiAl(prev => prev.map((x, j) => j === i ? val : x))

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      const profilActiv = JSON.parse(localStorage.getItem('profilActiv') || '{}')
      const eApartinator = profilActiv?.tip === 'apartinator' && profilActiv?.id
      const { data } = eApartinator
        ? await supabase.from('profiluri_apartinatori').select('*').eq('apartinator_id', profilActiv.id).single()
        : await supabase.from('profiluri').select('*').eq('id', session.user.id).single()
      if (data) {
        setProfil(data)
        setCnp(data.cnp || '')
        setGrupSanguin(data.grup_sanguin || '')
        setAlergiiMed(parseAlergii(data.alergii_medicamente))
        setAlergiiAl(parseAlergii(data.alergii_alimentare))
        setContactNume(data.contact_urgenta_nume || '')
        setContactTel(data.contact_urgenta_telefon || '')
        setMedicNume(data.medic_familie_nume || '')
        setMedicTel(data.medic_familie_telefon || '')
        setAsiguratCnas(data.asigurat_cnas || false)
        setFumator(data.fumator ?? null)
        setGreutate(data.greutate?.toString() || '')
        setInaltime(data.inaltime?.toString() || '')
        if (data.diagnostice_json) setDiagnostice(JSON.parse(data.diagnostice_json))
        if (data.implanturi_json) setImplanteList(JSON.parse(data.implanturi_json))
        if (data.interventii_json) setInterventii(JSON.parse(data.interventii_json))
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
      alergii_medicamente: alergiiMed.filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(',') || null,
      alergii_alimentare: alergiiAl.filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(',') || null,
      contact_urgenta_nume: contactNume || null,
      contact_urgenta_telefon: contactTel || null,
      medic_familie_nume: medicNume || null,
      medic_familie_telefon: medicTel || null,
      asigurat_cnas: asiguratCnas,
      fumator: fumator,
      greutate: parseFloat(greutate) || null,
      inaltime: parseFloat(inaltime) || null,
      diagnostice_json: JSON.stringify(diagnostice.map(d => ({
        ...d,
        specialist: d.specialist ? d.specialist.charAt(0).toUpperCase() + d.specialist.slice(1) : '',
        specialitate: d.specialitate ? d.specialitate.charAt(0).toUpperCase() + d.specialitate.slice(1) : '',
        undeUrmarit: d.undeUrmarit ? d.undeUrmarit.charAt(0).toUpperCase() + d.undeUrmarit.slice(1) : '',
        medicatie: d.medicatie ? d.medicatie.charAt(0).toUpperCase() + d.medicatie.slice(1) : '',
        nume: d.nume ? d.nume.charAt(0).toUpperCase() + d.nume.slice(1) : '',
      }))),
      implanturi_json: JSON.stringify(implanteList),
      interventii_json: JSON.stringify(interventii),
    })
    if (error) { setMesaj('Eroare: ' + error.message); setSalvare(false); return }
    setMesaj('Salvat!')
    setEditMode(false)
    setTimeout(() => setMesaj(''), 3000)
    setSalvare(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'system-ui' }}><p style={{ color:'#111' }}>Se încarcă...</p></div>

  const username = profil?.prenume || user?.email?.split('@')[0] || 'Utilizator'
  const varstaCalc = cnp.length === 13 ? calculeazaVarsta(cnp) : profil?.varsta
  const dataNasterii = cnp.length === 13 ? calculeazaDataNasterii(cnp) : ''
  const sexCalc = cnp.length === 13 ? calculeazaSex(cnp) : profil?.sex
  const imc = greutate && inaltime ? calculeazaIMC(parseFloat(greutate), parseFloat(inaltime)) : null

  const navStyle: React.CSSProperties = { padding:'6px 10px', borderRadius:'8px', fontSize:'13px', color:'#111', textDecoration:'none', fontWeight:500 }
  const card: React.CSSProperties = { background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', overflow:'hidden', marginBottom:'12px' }
  const body: React.CSSProperties = { padding:'18px 20px' }
  const lbl: React.CSSProperties = { fontSize:'11px', fontWeight:500, color:'#555', textTransform:'uppercase' as const, letterSpacing:'0.5px', marginBottom:'4px' }
  const inp: React.CSSProperties = { width:'100%', padding:'9px 13px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#111', background:'white', outline:'none', fontFamily:'system-ui', boxSizing:'border-box' as const, textTransform:'capitalize' as const }
  const g2: React.CSSProperties = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }
  const divider: React.CSSProperties = { height:'0.5px', background:'#e5e7eb', margin:'14px 0' }
  const itemCard: React.CSSProperties = { background:'#f8f9fa', border:'0.5px solid #e5e7eb', borderRadius:'10px', padding:'16px', marginBottom:'12px' }

  return (
    <div style={{ fontFamily:'system-ui,-apple-system,sans-serif', background:'#f8f9fa', minHeight:'100vh' }}>
      <Topbar username={username} activePage="urgenta" onLogout={handleLogout} />

      <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', minHeight:'calc(100vh - 56px)' }}>

        <div style={{ background:'white', borderRight:'0.5px solid #e5e7eb', padding:'28px 0', display:'flex', flexDirection:'column' }}>
          <div style={{ padding:'0 20px 24px', borderBottom:'0.5px solid #e5e7eb', marginBottom:'20px', display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ width:'32px', height:'32px', background:'#E1F5EE', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', color:'#0F6E56', fontSize:'16px', fontWeight:600 }}>✚</div>
            
          </div>
          <div style={{ fontSize:'18px', fontWeight:600, color:'#111', marginBottom:'32px', padding:'0 20px', textAlign:'center' as const }}>{profil?.prenume} {profil?.nume}</div>
          {sidebarItems.map(item => (
            <div key={item.key} onClick={() => toggleSectiune(item.key)} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'9px 20px', fontSize:'13px', color: sectiuni[item.key] ? '#085041' : '#555', background: sectiuni[item.key] ? '#E1F5EE' : 'transparent', cursor:'pointer', marginBottom:'2px' }}>
              <item.Icon size={16} stroke={1.5} color={sectiuni[item.key] ? '#085041' : '#555'} />
              {item.label}
            </div>
          ))}
        </div>

        <div style={{ padding:'28px', overflowY:'auto' }}>

          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'24px', position:'sticky', top:0, background:'#f8f9fa', zIndex:9, paddingTop:'12px', paddingBottom:'12px' }}>
            <div>
              <div style={{ fontSize:'20px', fontWeight:500, color:'#111' }}>Card de urgență Panoramic MedLog</div>
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
                  <button onClick={() => { setEditMode(false); if (profil) { setCnp(profil.cnp || ''); setGrupSanguin(profil.grup_sanguin || ''); setAlergiiMed(parseAlergii(profil.alergii_medicamente)); setAlergiiAl(parseAlergii(profil.alergii_alimentare)); setContactNume(profil.contact_urgenta_nume || ''); setContactTel(profil.contact_urgenta_telefon || ''); setMedicNume(profil.medic_familie_nume || ''); setMedicTel(profil.medic_familie_telefon || ''); setAsiguratCnas(profil.asigurat_cnas || false); setFumator(profil.fumator ?? null); setGreutate(profil.greutate?.toString() || ''); setInaltime(profil.inaltime?.toString() || ''); setDiagnostice(profil.diagnostice_json ? JSON.parse(profil.diagnostice_json) : []); setImplanteList(profil.implanturi_json ? JSON.parse(profil.implanturi_json) : []); setInterventii(profil.interventii_json ? JSON.parse(profil.interventii_json) : []); } }} style={{ padding:'9px 16px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#111', cursor:'pointer', fontWeight:500 }}>Anulează</button>
                  <button onClick={handleSalvare} disabled={salvare} style={{ padding:'9px 18px', background:'#16705a', color:'white', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:500, cursor:'pointer' }}>{salvare ? 'Se salvează...' : 'Salvează'}</button>
                </>
              )}
            </div>
          </div>

          {mesaj && <div style={{ padding:'12px 16px', borderRadius:'8px', marginBottom:'16px', background: mesaj.includes('Eroare') ? '#FCEBEB' : '#E1F5EE', color: mesaj.includes('Eroare') ? '#A32D2D' : '#0F6E56', fontSize:'13px' }}>{mesaj}</div>}

          {/* DATE URGENTA */}
          <div style={card}>
            <Banner icon={<IconId size={14} color="white" stroke={1.5} />} title="Date de urgență" sub="Identitate și parametri fizici" onToggle={() => toggleSectiune('urgenta')} />
            {sectiuni.urgenta && (
              <div style={body}>
                {editMode ? (
                  <>
                    <div style={{ marginBottom:'14px' }}>
                      <label style={lbl}>CNP</label>
                      <input value={cnp} onChange={e => setCnp(e.target.value)} placeholder="13 cifre" maxLength={13} style={{ ...inp, textTransform:'none' as const }} />
                      {cnp.length === 13 && (
                        <div style={{ display:'flex', gap:'16px', marginTop:'8px', fontSize:'12px', color:'#16705a', fontWeight:500 }}>
                          <span>Data nașterii: {dataNasterii}</span>
                          <span>Vârstă: {varstaCalc} ani</span>
                          <span>Sex: {sexCalc}</span>
                        </div>
                      )}
                    </div>
                    <div style={g2}>
                      <div><label style={lbl}>Greutate (kg)</label><input type="number" value={greutate} onChange={e => setGreutate(e.target.value)} placeholder="ex: 65" style={{ ...inp, textTransform:'none' as const }} /></div>
                      <div><label style={lbl}>Înălțime (cm)</label><input type="number" value={inaltime} onChange={e => setInaltime(e.target.value)} placeholder="ex: 168" style={{ ...inp, textTransform:'none' as const }} /></div>
                    </div>
                    <div style={{ marginTop:'14px' }}>
                      <label style={lbl}>Fumător</label>
                      <div style={{ display:'flex', gap:'16px', marginTop:'6px' }}>
                        {[{val:true,label:'Da'},{val:false,label:'Nu'}].map(opt => (
                          <div key={opt.label} onClick={() => setFumator(opt.val)} style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'13px', color:'#111', cursor:'pointer' }}>
                            <div style={{ width:'16px', height:'16px', borderRadius:'50%', border:'1.5px solid #16705a', background: fumator===opt.val?'#16705a':'white', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              {fumator===opt.val && <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'white' }}></div>}
                            </div>
                            {opt.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:'14px', marginBottom:'14px' }}>
                      <div><div style={lbl}>Nume</div><div style={{ fontSize:'14px', fontWeight:500, color:'#111' }}>{profil?.nume || '—'}</div></div>
                      <div><div style={lbl}>Prenume</div><div style={{ fontSize:'14px', fontWeight:500, color:'#111' }}>{profil?.prenume || '—'}</div></div>
                      <div><div style={lbl}>CNP</div><div style={{ fontSize:'14px', fontWeight:500, color:'#111', letterSpacing:'1px' }}>{cnp ? cnp[0] + '••••••••••••' : '—'}</div></div>
                      <div><div style={lbl}>Data nașterii</div><div style={{ fontSize:'14px', fontWeight:500, color:'#111' }}>{dataNasterii || '—'}</div></div>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:'14px' }}>
                      <div><div style={lbl}>Vârstă</div><div style={{ fontSize:'14px', fontWeight:500, color:'#111' }}>{varstaCalc ? `${varstaCalc} ani` : '—'}</div></div>
                      <div><div style={lbl}>Sex</div><div style={{ fontSize:'14px', fontWeight:500, color:'#111' }}>{sexCalc || '—'}</div></div>
                      <div><div style={lbl}>Înălțime</div><div style={{ fontSize:'14px', fontWeight:500, color:'#111' }}>{inaltime ? `${inaltime} cm` : '—'}</div></div>
                      <div><div style={lbl}>Greutate</div><div style={{ fontSize:'14px', fontWeight:500, color:'#111' }}>{greutate ? `${greutate} kg` : '—'}</div></div>
                    </div>
                    {imc && (
                      <>
                        <div style={divider}></div>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                          <div>
                            <div style={lbl}>Indice de masă corporală (IMC)</div>
                            <div style={{ fontSize:'14px', fontWeight:500, color:'#111' }}>{imc.valoare}</div>
                            <div style={{ marginTop:'6px', background:'#E1F5EE', borderRadius:'20px', padding:'4px 12px', fontSize:'12px', fontWeight:500, color:'#085041', display:'block' }}>✓ {imc.label}</div>
                          </div>
                          <div>
                            <div style={lbl}>Fumător</div>
                            <div style={{ display:'flex', gap:'16px', marginTop:'6px' }}>
                              {[{val:true,label:'Da'},{val:false,label:'Nu'}].map(opt => (
                                <div key={opt.label} style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'13px', color:'#111' }}>
                                  <div style={{ width:'16px', height:'16px', borderRadius:'50%', border:'1.5px solid #16705a', background: fumator===opt.val?'#16705a':'white', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                    {fumator===opt.val && <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'white' }}></div>}
                                  </div>
                                  {opt.label}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* GRUP SANGUIN + ALERGII */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px', marginBottom:'12px' }}>
            <div style={{ background:'white', border:'0.5px solid #e5e7eb', borderRadius:'10px', padding:'14px', display:'flex', flexDirection:'column', gap:'8px' }}>
              <div style={lbl}>Grup sanguin și Rh</div>
              {editMode ? (
                <>
                  <select value={grupSanguin} onChange={e => setGrupSanguin(e.target.value)} style={inp}>
                    <option value="">Selectează</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-','Necunoscut'].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <Checkbox checked={grupSanguinAtestat} onChange={() => setGrupSanguinAtestat(!grupSanguinAtestat)} label="Document care atestă" />
                </>
              ) : (
                <div style={{ fontSize:'24px', fontWeight:700, color:'#E24B4A' }}>{grupSanguin || '—'}</div>
              )}
              {grupSanguin && <div style={{ marginTop:'auto' }}><BadgeDoc atestat={grupSanguinAtestat} /></div>}
            </div>
            <div style={{ background:'white', border:'0.5px solid #e5e7eb', borderRadius:'10px', padding:'14px', display:'flex', flexDirection:'column', gap:'8px', minHeight:'120px' }}>
              <div style={lbl}>Alergii medicamentoase</div>
              {editMode ? (
                <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                  {alergiiMed.map((a, i) => (
                    <AlergiiInput key={i} value={a} onChange={v => updateAlergiiMed(i, v)} placeholder="ex: Penicilină..." style={inp} />
                  ))}
                  {alergiiMed.length < 5 && alergiiMed[alergiiMed.length - 1] !== '' && (
                    <button onClick={() => setAlergiiMed(prev => [...prev, ''])} style={{ padding:'6px 12px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'12px', color:'#16705a', fontWeight:500, cursor:'pointer', textAlign:'left' as const }}>+ Adaugă</button>
                  )}
                </div>
              ) : (
                <AlergiiView list={alergiiMed} />
              )}
              {alergiiMed.filter(Boolean).length > 0 && <div style={{ marginTop:'auto' }}><BadgeDoc atestat={false} /></div>}
            </div>
            <div style={{ background:'white', border:'0.5px solid #e5e7eb', borderRadius:'10px', padding:'14px', display:'flex', flexDirection:'column', gap:'8px', minHeight:'120px' }}>
              <div style={lbl}>Alte alergii cunoscute</div>
              {editMode ? (
                <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                  {alergiiAl.map((a, i) => (
                    <AlergiiInput key={i} value={a} onChange={v => updateAlergiiAl(i, v)} placeholder="ex: Nuci..." style={inp} />
                  ))}
                  {alergiiAl.length < 5 && alergiiAl[alergiiAl.length - 1] !== '' && (
                    <button onClick={() => setAlergiiAl(prev => [...prev, ''])} style={{ padding:'6px 12px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'12px', color:'#16705a', fontWeight:500, cursor:'pointer', textAlign:'left' as const }}>+ Adaugă</button>
                  )}
                </div>
              ) : (
                <AlergiiView list={alergiiAl} />
              )}
              {alergiiAl.filter(Boolean).length > 0 && <div style={{ marginTop:'auto' }}><BadgeDoc atestat={false} /></div>}
            </div>
          </div>

          {/* DIAGNOSTICE */}
          <div style={card}>
            <Banner icon={<IconStethoscope size={14} color="white" stroke={1.5} />} title="Diagnostice cronice" sub={diagnostice.length > 0 ? 'Declarate de titular sau extrase din documente' : 'Nicio intrare adăugată'} onToggle={() => toggleSectiune('diagnostice')} onAdd={editMode ? () => setDiagnostice(prev => [...prev, { id: Date.now().toString(), nume:'', dataStart:'', specialist:'', specialitate:'', undeUrmarit:'', medicatie:'', atestat:false }]) : undefined} />
            {sectiuni.diagnostice && (
              <>
                {diagnostice.length === 0 && !editMode && (
                  <div style={{ padding:'18px 20px' }}>
                    <button onClick={() => { setEditMode(true); setDiagnostice(prev => [...prev, { id: Date.now().toString(), nume:'', dataStart:'', specialist:'', specialitate:'', undeUrmarit:'', medicatie:'', atestat:false }]) }} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'9px 16px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#16705a', fontWeight:500, cursor:'pointer' }}>+ Adaugă diagnostic</button>
                  </div>
                )}
                {(diagnostice.length > 0 || editMode) && (
                  <div style={body}>
                    {editMode ? (
                      <>
                        {diagnostice.map(d => (
                          <div key={d.id} id={`diag-${d.id}`} style={itemCard}>
                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                              <span style={{ fontSize:'13px', fontWeight:500, color:'#111' }}>Diagnostic</span>
                              <button onClick={() => setDiagnostice(prev => prev.filter(x => x.id !== d.id))} style={{ border:'none', background:'none', cursor:'pointer', fontSize:'16px', color:'#aaa' }}>×</button>
                            </div>
                            <div style={{ marginBottom:'8px' }}><label style={lbl}>Nume diagnostic</label><input value={d.nume} onChange={e => setDiagnostice(prev => prev.map(x => x.id === d.id ? {...x, nume: e.target.value} : x))} placeholder="ex: Hipotiroidism" style={inp} /></div>
                            <div style={{ marginBottom:'8px' }}>
                              <label style={lbl}>Data de start</label>
                              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginTop:'4px' }}>
                                <select value={d.dataStart ? d.dataStart.split(' ')[0] : ''} onChange={e => { const an = d.dataStart ? d.dataStart.split(' ')[1] || '' : ''; setDiagnostice(prev => prev.map(x => x.id === d.id ? {...x, dataStart: `${e.target.value} ${an}`.trim()} : x)) }} style={inp}>
                                  <option value="">Lună</option>
                                  {['Ian','Feb','Mar','Apr','Mai','Iun','Iul','Aug','Sep','Oct','Nov','Dec'].map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                                <input type="text" value={d.dataStart ? d.dataStart.split(' ')[1] || '' : ''} onChange={e => { const luna = d.dataStart ? d.dataStart.split(' ')[0] || '' : ''; setDiagnostice(prev => prev.map(x => x.id === d.id ? {...x, dataStart: `${luna} ${e.target.value}`.trim()} : x)) }} placeholder="An" style={{ ...inp, textTransform:'none' as const }} />
                              </div>
                            </div>
                            <div style={{ marginBottom:'8px' }}><label style={lbl}>Specialist curant</label><input value={d.specialist} onChange={e => setDiagnostice(prev => prev.map(x => x.id === d.id ? {...x, specialist: e.target.value} : x))} placeholder="Dr. " style={inp} /></div>
                            <div style={{ marginBottom:'8px' }}><label style={lbl}>Specialitate</label><input value={d.specialitate || ''} onChange={e => setDiagnostice(prev => prev.map(x => x.id === d.id ? {...x, specialitate: e.target.value} : x))} placeholder="ex: Endocrinologie" style={inp} /></div>
                            <div style={{ ...g2, marginBottom:'8px' }}>
                              <div><label style={lbl}>Unde e urmărit</label><input value={d.undeUrmarit} onChange={e => setDiagnostice(prev => prev.map(x => x.id === d.id ? {...x, undeUrmarit: e.target.value} : x))} placeholder="ex: Medicover" style={inp} /></div>
                              <div><label style={lbl}>Medicație aferentă</label><input value={d.medicatie} onChange={e => setDiagnostice(prev => prev.map(x => x.id === d.id ? {...x, medicatie: e.target.value} : x))} placeholder="ex: Euthyrox 50mcg" style={inp} /></div>
                            </div>
                            <Checkbox checked={d.atestat} onChange={() => setDiagnostice(prev => prev.map(x => x.id === d.id ? {...x, atestat: !x.atestat} : x))} label="Document care atestă acest diagnostic" />
                          </div>
                        ))}
                        <button onClick={() => { const newId = Date.now().toString(); setDiagnostice(prev => [...prev, { id: newId, nume:'', dataStart:'', specialist:'', specialitate:'', undeUrmarit:'', medicatie:'', atestat:false }]); setTimeout(() => document.getElementById(`diag-${newId}`)?.scrollIntoView({ behavior:'smooth', block:'center' }), 100) }} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'9px 16px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#16705a', fontWeight:500, cursor:'pointer' }}>+ Adaugă diagnostic</button>
                      </>
                    ) : (
                      <div style={{ display:'flex', gap:'12px', overflowX:'auto', paddingBottom:'8px' }}>
                        {diagnostice.filter(d => d.nume).map((d, i) => (
                          <div key={i} style={{ background:'#fafaf9', border:'0.5px solid #e5e7eb', borderRadius:'10px', padding:'16px', minWidth:'200px', maxWidth:'200px', display:'flex', flexDirection:'column', gap:'8px', flexShrink:0 }}>
                            <div style={{ fontSize:'13px', color:'#111' }}>{(() => { const luni = ['Ian','Feb','Mar','Apr','Mai','Iun','Iul','Aug','Sep','Oct','Nov','Dec']; const parts = d.dataStart.split('/'); if (parts.length === 2) { const l = parseInt(parts[0]); return `${luni[l-1] || parts[0].trim()} ${parts[1].trim()}`; } const partsSpace = d.dataStart.split(' '); if (partsSpace.length === 2) { const lunaText = partsSpace[0].trim(); const lunaGasita = luni.find(l => l.toLowerCase() === lunaText.toLowerCase().slice(0,3)); return `${lunaGasita || lunaText.charAt(0).toUpperCase() + lunaText.slice(1).toLowerCase()} ${partsSpace[1].trim()}`; } return d.dataStart.trim(); })()}</div>
                            <div style={{ fontSize:'14px', fontWeight:600, color:'#111', textTransform:'capitalize' }}>{d.nume}</div>
                            <BadgeDoc atestat={d.atestat} />
                            <div style={{ height:'0.5px', background:'#e5e7eb' }}></div>
                            {d.specialist && <div><div style={lbl}>Specialist curant</div><div style={{ fontSize:'13px', fontWeight:600, color:'#111', textTransform:'capitalize', textAlign:'center' }}>{d.specialist}</div></div>}
                            {d.specialitate && <div><div style={lbl}>Specialitate</div><div style={{ fontSize:'13px', fontWeight:600, color:'#111', textTransform:'capitalize', textAlign:'center' }}>{d.specialitate}</div></div>}
                            {d.undeUrmarit && <div><div style={lbl}>Unde e urmărit</div><div style={{ fontSize:'13px', fontWeight:600, color:'#111', textTransform:'capitalize', textAlign:'center' }}>{d.undeUrmarit}</div></div>}
                            {d.medicatie && <div><div style={lbl}>Medicație</div><div style={{ fontSize:'13px', fontWeight:600, color:'#111', textTransform:'capitalize', textAlign:'center' }}>{d.medicatie}</div></div>}
                          </div>
                        ))}
                        <div onClick={() => { setEditMode(true); setDiagnostice(prev => [...prev, { id: Date.now().toString(), nume:'', dataStart:'', specialist:'', specialitate:'', undeUrmarit:'', medicatie:'', atestat:false }]) }} style={{ background:'white', border:'0.5px dashed #e5e7eb', borderRadius:'10px', padding:'16px', minWidth:'200px', maxWidth:'200px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'8px', flexShrink:0, cursor:'pointer' }}>
                          <div style={{ width:'36px', height:'36px', background:'#E1F5EE', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <span style={{ color:'#16705a', fontSize:'20px', lineHeight:1 }}>+</span>
                          </div>
                          <div style={{ fontSize:'13px', color:'#16705a', fontWeight:500 }}>Adaugă diagnostic</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* IMPLANTURI */}
          <div style={card}>
            <Banner icon={<IconDeviceHeartMonitor size={14} color="white" stroke={1.5} />} title="Implanturi și dispozitive" sub={implanteList.length > 0 ? 'Declarate de titular sau extrase din documente' : 'Nicio intrare adăugată'} onToggle={() => toggleSectiune('implanturi')} onAdd={editMode ? () => setImplanteList(prev => [...prev, { id: Date.now().toString(), nume:'', dataImplant:'', spital:'', observatii:'', atestat:false }]) : undefined} />
            {sectiuni.implanturi && (implanteList.length > 0 || editMode) && (
              <div style={body}>
                {editMode ? (
                  <>
                    {implanteList.map(d => (
                      <div key={d.id} style={itemCard}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                          <span style={{ fontSize:'13px', fontWeight:500, color:'#111' }}>Implant / Dispozitiv</span>
                          <button onClick={() => setImplanteList(prev => prev.filter(x => x.id !== d.id))} style={{ border:'none', background:'none', cursor:'pointer', fontSize:'16px', color:'#aaa' }}>×</button>
                        </div>
                        <div style={{ marginBottom:'8px' }}><label style={lbl}>Nume implant</label><input value={d.nume} onChange={e => setImplanteList(prev => prev.map(x => x.id === d.id ? {...x, nume: e.target.value} : x))} placeholder="ex: Stent coronarian" style={inp} /></div>
                        <div style={{ ...g2, marginBottom:'8px' }}>
                          <div><label style={lbl}>Data implantării</label><input value={d.dataImplant} onChange={e => setImplanteList(prev => prev.map(x => x.id === d.id ? {...x, dataImplant: e.target.value} : x))} placeholder="ex: Mar 2019" style={inp} /></div>
                          <div><label style={lbl}>Spital</label><input value={d.spital} onChange={e => setImplanteList(prev => prev.map(x => x.id === d.id ? {...x, spital: e.target.value} : x))} placeholder="ex: Spitalul Fundeni" style={inp} /></div>
                        </div>
                        <div style={{ marginBottom:'8px' }}><label style={lbl}>Observații critice</label><input value={d.observatii} onChange={e => setImplanteList(prev => prev.map(x => x.id === d.id ? {...x, observatii: e.target.value} : x))} placeholder="ex: Atenție RMN" style={inp} /></div>
                        <Checkbox checked={d.atestat} onChange={() => setImplanteList(prev => prev.map(x => x.id === d.id ? {...x, atestat: !x.atestat} : x))} label="Document care atestă acest implant" />
                      </div>
                    ))}
                    <button onClick={() => setImplanteList(prev => [...prev, { id: Date.now().toString(), nume:'', dataImplant:'', spital:'', observatii:'', atestat:false }])} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'9px 16px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#16705a', fontWeight:500, cursor:'pointer' }}>+ Adaugă implant</button>
                  </>
                ) : (
                  <div style={{ display:'flex', gap:'12px', overflowX:'auto', paddingBottom:'8px' }}>
                    {implanteList.map((d, i) => (
                      <div key={i} style={{ background:'#fafaf9', border:'0.5px solid #e5e7eb', borderRadius:'10px', padding:'16px', minWidth:'200px', maxWidth:'200px', display:'flex', flexDirection:'column', gap:'8px', flexShrink:0 }}>
                        <div style={{ fontSize:'14px', fontWeight:500, color:'#111', textTransform:'capitalize' }}>{d.nume}</div>
                        <BadgeDoc atestat={d.atestat} />
                        <div style={{ height:'0.5px', background:'#e5e7eb' }}></div>
                        {d.dataImplant && <div><div style={lbl}>Data implantării</div><div style={{ fontSize:'13px', color:'#111' }}>{d.dataImplant}</div></div>}
                        {d.spital && <div><div style={lbl}>Spital</div><div style={{ fontSize:'13px', color:'#111', textTransform:'capitalize' }}>{d.spital}</div></div>}
                        {d.observatii && <div><div style={lbl}>Observații</div><div style={{ fontSize:'13px', color:'#E24B4A', fontWeight:500 }}>{d.observatii}</div></div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* INTERVENTII */}
          <div style={card}>
            <Banner icon={<IconScissors size={14} color="white" stroke={1.5} />} title="Intervenții chirurgicale" sub={interventii.length > 0 ? 'Declarate de titular sau extrase din documente' : 'Nicio intrare adăugată'} onToggle={() => toggleSectiune('interventii')} onAdd={editMode ? () => setInterventii(prev => [...prev, { id: Date.now().toString(), nume:'', dataInterventie:'', spital:'', chirurg:'', atestat:false }]) : undefined} />
            {sectiuni.interventii && (interventii.length > 0 || editMode) && (
              <div style={body}>
                {editMode ? (
                  <>
                    {interventii.map(d => (
                      <div key={d.id} style={itemCard}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                          <span style={{ fontSize:'13px', fontWeight:500, color:'#111' }}>Intervenție chirurgicală</span>
                          <button onClick={() => setInterventii(prev => prev.filter(x => x.id !== d.id))} style={{ border:'none', background:'none', cursor:'pointer', fontSize:'16px', color:'#aaa' }}>×</button>
                        </div>
                        <div style={{ marginBottom:'8px' }}><label style={lbl}>Tip intervenție</label><input value={d.nume} onChange={e => setInterventii(prev => prev.map(x => x.id === d.id ? {...x, nume: e.target.value} : x))} placeholder="ex: Apendicectomie" style={inp} /></div>
                        <div style={{ ...g2, marginBottom:'8px' }}>
                          <div><label style={lbl}>Data intervenției</label><input value={d.dataInterventie} onChange={e => setInterventii(prev => prev.map(x => x.id === d.id ? {...x, dataInterventie: e.target.value} : x))} placeholder="ex: Mar 2005" style={inp} /></div>
                          <div><label style={lbl}>Spital</label><input value={d.spital} onChange={e => setInterventii(prev => prev.map(x => x.id === d.id ? {...x, spital: e.target.value} : x))} placeholder="ex: Spitalul Colentina" style={inp} /></div>
                        </div>
                        <div style={{ marginBottom:'8px' }}><label style={lbl}>Chirurg</label><input value={d.chirurg} onChange={e => setInterventii(prev => prev.map(x => x.id === d.id ? {...x, chirurg: e.target.value} : x))} placeholder="ex: Dr. Ionescu Mihai" style={inp} /></div>
                        <Checkbox checked={d.atestat} onChange={() => setInterventii(prev => prev.map(x => x.id === d.id ? {...x, atestat: !x.atestat} : x))} label="Document care atestă această intervenție" />
                      </div>
                    ))}
                    <button onClick={() => setInterventii(prev => [...prev, { id: Date.now().toString(), nume:'', dataInterventie:'', spital:'', chirurg:'', atestat:false }])} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'9px 16px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#16705a', fontWeight:500, cursor:'pointer' }}>+ Adaugă intervenție</button>
                  </>
                ) : (
                  <div style={{ display:'flex', gap:'12px', overflowX:'auto', paddingBottom:'8px' }}>
                    {interventii.map((d, i) => (
                      <div key={i} style={{ background:'#fafaf9', border:'0.5px solid #e5e7eb', borderRadius:'10px', padding:'16px', minWidth:'200px', maxWidth:'200px', display:'flex', flexDirection:'column', gap:'8px', flexShrink:0 }}>
                        <div style={{ fontSize:'14px', fontWeight:500, color:'#111', textTransform:'capitalize' }}>{d.nume}</div>
                        <BadgeDoc atestat={d.atestat} />
                        <div style={{ height:'0.5px', background:'#e5e7eb' }}></div>
                        {d.dataInterventie && <div><div style={lbl}>Data intervenției</div><div style={{ fontSize:'13px', color:'#111' }}>{d.dataInterventie}</div></div>}
                        {d.spital && <div><div style={lbl}>Spital</div><div style={{ fontSize:'13px', color:'#111', textTransform:'capitalize' }}>{d.spital}</div></div>}
                        {d.chirurg && <div><div style={lbl}>Chirurg</div><div style={{ fontSize:'13px', color:'#111', textTransform:'capitalize' }}>{d.chirurg}</div></div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* DATE CONTACT */}
          <div style={card}>
            <Banner icon={<IconPhone size={14} color="white" stroke={1.5} />} title="Date de contact" sub="Introduse de titular" onToggle={() => toggleSectiune('contact')} />
            {sectiuni.contact && (
              <div style={body}>
                {editMode ? (
                  <>
                    <div style={{ ...g2, marginBottom:'14px' }}>
                      <div><label style={lbl}>Persoană de contact — Nume</label><input value={contactNume} onChange={e => setContactNume(e.target.value)} placeholder="ex: Ion Popescu" style={inp} /></div>
                      <div><label style={lbl}>Persoană de contact — Telefon</label><input value={contactTel} onChange={e => setContactTel(e.target.value)} placeholder="ex: 0721 000 000" style={{ ...inp, textTransform:'none' as const }} /></div>
                    </div>
                    <div style={divider}></div>
                    <div style={{ ...g2, marginBottom:'14px' }}>
                      <div><label style={lbl}>Medic de familie — Nume</label><input value={medicNume} onChange={e => setMedicNume(e.target.value)} placeholder="ex: Dr. Maria Ionescu" style={inp} /></div>
                      <div><label style={lbl}>Medic de familie — Telefon</label><input value={medicTel} onChange={e => setMedicTel(e.target.value)} placeholder="ex: 021 000 0000" style={{ ...inp, textTransform:'none' as const }} /></div>
                    </div>
                    <div style={divider}></div>
                    <Checkbox checked={asiguratCnas} onChange={() => setAsiguratCnas(!asiguratCnas)} label="Asigurat CNAS" />
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
                    <div style={divider}></div>
                    <div>
                      <div style={lbl}>Asigurare CNAS</div>
                      <span style={{ display:'inline-flex', padding:'4px 12px', background: asiguratCnas ? '#E1F5EE' : '#f8f9fa', color: asiguratCnas ? '#085041' : '#555', borderRadius:'12px', fontSize:'12px', fontWeight:500, marginTop:'6px' }}>
                        {asiguratCnas ? '✓ Asigurat CNAS' : '— Nedeclarat'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* QR COD */}
          <div style={card}>
            <Banner icon={<IconQrcode size={14} color="white" stroke={1.5} />} title="QR Cod de urgență" sub="Date embedded offline" onToggle={() => toggleSectiune('qr')} />
            {sectiuni.qr && (
              <div style={body}>
                <div style={{ display:'flex', gap:'20px', alignItems:'center' }}>
                  <div style={{ width:'100px', height:'100px', background:'#f8f9fa', border:'0.5px solid #e5e7eb', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <IconQrcode size={56} color="#e5e7eb" stroke={1} />
                  </div>
                  <div>
                    <div style={{ fontSize:'14px', fontWeight:500, color:'#111', marginBottom:'4px' }}>Scanează pentru acces instant</div>
                    <div style={{ fontSize:'12px', color:'#111', lineHeight:1.6, marginBottom:'12px' }}>QR codul va conține datele tale critice de urgență. În curând disponibil.</div>
                    <div style={{ display:'flex', gap:'8px' }}>
                      <button style={{ padding:'7px 14px', background:'#16705a', color:'white', border:'none', borderRadius:'8px', fontSize:'12px', fontWeight:500, cursor:'pointer' }}>⬇ Descarcă QR</button>
                      <button style={{ padding:'7px 14px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'12px', color:'#111', cursor:'pointer', fontWeight:500 }}>⎙ Printează card</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* DISCLAIMER */}
          <div style={{ background:'white', borderLeft:'4px solid #E24B4A', borderTop:'0.5px solid #e5e7eb', borderRight:'0.5px solid #e5e7eb', borderBottom:'0.5px solid #e5e7eb', borderRadius:'10px', padding:'20px 24px', marginTop:'4px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
              <span style={{ color:'#E24B4A', fontSize:'20px' }}>⚠</span>
              <div style={{ fontSize:'14px', fontWeight:600, color:'#111' }}>Responsabilitatea datelor</div>
            </div>
            <div style={{ fontSize:'13px', color:'#111', lineHeight:1.8 }}>
              Datele din acest card sunt declarate de titular sau extrase din documente medicale atașate de titular. Panoramic MedLog nu verifică, nu validează și nu certifică nicio informație medicală. Orice decizie clinică aparține exclusiv medicului curant, care are obligația să verifice datele înainte de orice intervenție.
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}