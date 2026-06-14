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

function cap(s: string) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s }

interface DiagnosticItem { id: string; nume: string; dataStart: string; specialist: string; undeUrmarit: string; medicatie: string; atestat: boolean }
interface ImplantItem { id: string; nume: string; dataImplant: string; spital: string; observatii: string; atestat: boolean }
interface InterventieItem { id: string; nume: string; dataInterventie: string; spital: string; chirurg: string; atestat: boolean }

export default function Urgenta() {
  const [user, setUser] = useState<any>(null)
  const [profil, setProfil] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [salvare, setSalvare] = useState(false)
  const [mesaj, setMesaj] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [dropdown, setDropdown] = useState(false)
  const router = useRouter()

  const [cnp, setCnp] = useState('')
  const [grupSanguin, setGrupSanguin] = useState('')
  const [alergiiMed, setAlergiiMed] = useState<string[]>([''])
  const [alergiiAl, setAlergiiAl] = useState<string[]>([''])
  const [contactNume, setContactNume] = useState('')
  const [contactTel, setContactTel] = useState('')
  const [medicNume, setMedicNume] = useState('')
  const [medicTel, setMedicTel] = useState('')
  const [asiguratCnas, setAsiguratCnas] = useState(false)
  const [greutate, setGreutate] = useState('')
  const [inaltime, setInaltime] = useState('')
  const [diagnostice, setDiagnostice] = useState<DiagnosticItem[]>([])
  const [implanteList, setImplanteList] = useState<ImplantItem[]>([])
  const [interventii, setInterventii] = useState<InterventieItem[]>([])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      const { data } = await supabase.from('profiluri').select('*').eq('id', session.user.id).single()
      if (data) {
        setProfil(data)
        setCnp(data.cnp || '')
        setGrupSanguin(data.grup_sanguin || '')
        try { const v = JSON.parse(data.alergii_medicamente); setAlergiiMed(Array.isArray(v) ? v : data.alergii_medicamente.split(',').map((s: string) => s.trim()).filter(Boolean)) } catch { setAlergiiMed(data.alergii_medicamente ? data.alergii_medicamente.split(',').map((s: string) => s.trim()).filter(Boolean) : ['']) }
        try { const v2 = JSON.parse(data.alergii_alimentare); setAlergiiAl(Array.isArray(v2) ? v2 : data.alergii_alimentare.split(',').map((s: string) => s.trim()).filter(Boolean)) } catch { setAlergiiAl(data.alergii_alimentare ? data.alergii_alimentare.split(',').map((s: string) => s.trim()).filter(Boolean) : ['']) }
        setContactNume(data.contact_urgenta_nume || '')
        setContactTel(data.contact_urgenta_telefon || '')
        setMedicNume(data.medic_familie_nume || '')
        setMedicTel(data.medic_familie_telefon || '')
        setAsiguratCnas(data.asigurat_cnas || false)
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
      alergii_medicamente: alergiiMed.filter(Boolean).join(',') || null,
      alergii_alimentare: alergiiAl.filter(Boolean).join(',') || null,
      contact_urgenta_nume: contactNume || null,
      contact_urgenta_telefon: contactTel || null,
      medic_familie_nume: medicNume || null,
      medic_familie_telefon: medicTel || null,
      asigurat_cnas: asiguratCnas,
      greutate: parseFloat(greutate) || null,
      inaltime: parseFloat(inaltime) || null,
      diagnostice_json: JSON.stringify(diagnostice),
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

  const username = profil?.nume || user?.email?.split('@')[0]
  const varstaCalc = cnp.length === 13 ? calculeazaVarsta(cnp) : profil?.varsta
  const dataNasterii = cnp.length === 13 ? calculeazaDataNasterii(cnp) : ''
  const sexCalc = cnp.length === 13 ? calculeazaSex(cnp) : profil?.sex
  const imc = greutate && inaltime ? calculeazaIMC(parseFloat(greutate), parseFloat(inaltime)) : null

  const navStyle: React.CSSProperties = { padding:'6px 10px', borderRadius:'8px', fontSize:'13px', color:'#111', textDecoration:'none', fontWeight:500 }
  const card: React.CSSProperties = { background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', overflow:'hidden', marginBottom:'12px' }
  const body: React.CSSProperties = { padding:'18px 20px' }
  const lbl: React.CSSProperties = { fontSize:'11px', fontWeight:500, color:'#555', textTransform:'uppercase' as const, letterSpacing:'0.5px', marginBottom:'4px' }
  const inp: React.CSSProperties = { width:'100%', padding:'9px 13px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#111', background:'white', outline:'none', fontFamily:'system-ui', boxSizing:'border-box' as const }
  const g2: React.CSSProperties = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }
  const divider: React.CSSProperties = { height:'0.5px', background:'#e5e7eb', margin:'14px 0' }
  const itemCard: React.CSSProperties = { background:'#f8f9fa', border:'0.5px solid #e5e7eb', borderRadius:'10px', padding:'16px', marginBottom:'12px' }

  function BadgeDoc({ atestat }: { atestat: boolean }) {
    return atestat
      ? <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', padding:'4px 10px', background:'#E1F5EE', color:'#085041', borderRadius:'12px', fontSize:'11px', fontWeight:500 }}>✓ Document care atestă</span>
      : <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', padding:'4px 10px', background:'#f8f9fa', color:'#111', borderRadius:'12px', fontSize:'11px', fontWeight:500 }}>Fără document care atestă</span>
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
        <div style={{ fontSize:'14px', fontWeight:500, color:'#111', textTransform:'capitalize' }}>{value || '—'}</div>
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

  function AlergiiView({ list }: { list: string[] }) {
    const filtered = list.filter(Boolean)
    if (filtered.length === 0) return <div style={{ fontSize:'13px', color:'#111' }}>—</div>
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
        {filtered.map((a, i) => <div key={i} style={{ fontSize:'13px', fontWeight:500, color:'#111', textTransform:'capitalize' }}>{a}</div>)}
      </div>
    )
  }

  function AlergiiEdit({ list, setList, placeholder }: { list: string[], setList: (v: string[]) => void, placeholder: string }) {
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
        {list.map((a, i) => (
          <input key={i} value={a} onChange={e => setList(list.map((x, j) => j === i ? e.target.value : x))} placeholder={placeholder} style={inp} />
        ))}
        {list.length < 5 && list[list.length - 1] !== '' && (
          <button onClick={() => setList([...list, ''])} style={{ padding:'6px 12px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'12px', color:'#16705a', fontWeight:500, cursor:'pointer', textAlign:'left' as const }}>+ Adaugă</button>
        )}
      </div>
    )
  }

  return (
    <div style={{ fontFamily:'system-ui,-apple-system,sans-serif', background:'#f8f9fa', minHeight:'100vh' }}>

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
          <div style={{ position:'relative', marginLeft:'8px' }}>
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

        {/* DATE URGENTA */}
        <div style={card}>
          <Banner icon={<IconId size={14} color="white" stroke={1.5} />} title="Date de urgență" sub="Identitate și parametri fizici" />
          <div style={body}>
            {editMode ? (
              <>
                <div style={{ marginBottom:'14px' }}>
                  <label style={lbl}>CNP</label>
                  <input value={cnp} onChange={e => setCnp(e.target.value)} placeholder="13 cifre" maxLength={13} style={inp} />
                  {cnp.length === 13 && (
                    <div style={{ display:'flex', gap:'16px', marginTop:'8px', fontSize:'12px', color:'#16705a', fontWeight:500 }}>
                      <span>Data nașterii: {dataNasterii}</span>
                      <span>Vârstă: {varstaCalc} ani</span>
                      <span>Sex: {sexCalc}</span>
                    </div>
                  )}
                </div>
                <div style={g2}>
                  <div><label style={lbl}>Greutate (kg)</label><input type="number" value={greutate} onChange={e => setGreutate(e.target.value)} placeholder="ex: 65" style={inp} /></div>
                  <div><label style={lbl}>Înălțime (cm)</label><input type="number" value={inaltime} onChange={e => setInaltime(e.target.value)} placeholder="ex: 168" style={inp} /></div>
                </div>
              </>
            ) : (
              <>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:'14px', marginBottom:'14px' }}>
                  <Val label="Nume" value={profil?.nume?.split(' ')[0] || ''} />
                  <Val label="Prenume" value={profil?.nume?.split(' ').slice(1).join(' ') || ''} />
                  <div>
                    <div style={lbl}>CNP</div>
                    <div style={{ fontSize:'14px', fontWeight:500, color:'#111', letterSpacing:'1px' }}>{cnp ? cnp[0] + '••••••••••••' : '—'}</div>
                  </div>
                  <Val label="Data nașterii" value={dataNasterii} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:'14px' }}>
                  <Val label="Vârstă" value={varstaCalc ? `${varstaCalc} ani` : ''} />
                  <Val label="Sex" value={sexCalc || ''} />
                  <Val label="Înălțime" value={inaltime ? `${inaltime} cm` : ''} />
                  <Val label="Greutate" value={greutate ? `${greutate} kg` : ''} />
                </div>
                {imc && (
                  <>
                    <div style={divider}></div>
                    <div>
                      <div style={lbl}>Indice de masă corporală (IMC)</div>
                      <div style={{ fontSize:'14px', fontWeight:500, color:'#111' }}>{imc.valoare}</div>
                      <span style={{ display:'inline-flex', padding:'3px 10px', background:'#E1F5EE', color:'#085041', borderRadius:'12px', fontSize:'12px', fontWeight:500, marginTop:'4px' }}>✓ {imc.label}</span>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* GRUP SANGUIN + ALERGII */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px', marginBottom:'12px' }}>
          <div style={{ background:'white', border:'0.5px solid #e5e7eb', borderRadius:'10px', padding:'14px', display:'flex', flexDirection:'column', gap:'8px' }}>
            <div style={lbl}>Grup sanguin și Rh</div>
            {editMode ? (
              <select value={grupSanguin} onChange={e => setGrupSanguin(e.target.value)} style={inp}>
                <option value="">Selectează</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-','Necunoscut'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            ) : (
              <div style={{ fontSize:'24px', fontWeight:700, color:'#E24B4A' }}>{grupSanguin || '—'}</div>
            )}
            {grupSanguin && <BadgeDoc atestat={false} />}
          </div>
          <div style={{ background:'white', border:'0.5px solid #e5e7eb', borderRadius:'10px', padding:'14px', display:'flex', flexDirection:'column', gap:'8px' }}>
            <div style={lbl}>Alergii medicamentoase</div>
            {editMode ? <AlergiiEdit list={alergiiMed} setList={setAlergiiMed} placeholder="ex: Penicilină..." /> : <AlergiiView list={alergiiMed} />}
            {alergiiMed.filter(Boolean).length > 0 && <BadgeDoc atestat={false} />}
          </div>
          <div style={{ background:'white', border:'0.5px solid #e5e7eb', borderRadius:'10px', padding:'14px', display:'flex', flexDirection:'column', gap:'8px' }}>
            <div style={lbl}>Alte alergii cunoscute</div>
            {editMode ? <AlergiiEdit list={alergiiAl} setList={setAlergiiAl} placeholder="ex: Nuci..." /> : <AlergiiView list={alergiiAl} />}
            {alergiiAl.filter(Boolean).length > 0 && <BadgeDoc atestat={false} />}
          </div>
        </div>

        {/* DIAGNOSTICE */}
        <div style={card}>
          <Banner icon={<IconStethoscope size={14} color="white" stroke={1.5} />} title="Diagnostice cronice" sub={diagnostice.length > 0 ? 'Declarate de titular sau extrase din documente' : 'Nicio intrare adăugată'} onAdd={editMode ? () => setDiagnostice(prev => [...prev, { id: Date.now().toString(), nume:'', dataStart:'', specialist:'', undeUrmarit:'', medicatie:'', atestat:false }]) : undefined} />
          {(diagnostice.length > 0 || editMode) && (
            <div style={body}>
              {editMode ? (
                <>
                  {diagnostice.map(d => (
                    <div key={d.id} style={itemCard}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                        <span style={{ fontSize:'13px', fontWeight:500, color:'#111' }}>Diagnostic</span>
                        <button onClick={() => setDiagnostice(prev => prev.filter(x => x.id !== d.id))} style={{ border:'none', background:'none', cursor:'pointer', fontSize:'16px', color:'#aaa' }}>×</button>
                      </div>
                      <div style={{ marginBottom:'8px' }}><label style={lbl}>Nume diagnostic</label><input value={d.nume} onChange={e => setDiagnostice(prev => prev.map(x => x.id === d.id ? {...x, nume: e.target.value} : x))} placeholder="ex: Hipotiroidism" style={inp} /></div>
                      <div style={{ marginBottom:'8px' }}>
                        <label style={lbl}>Luna și anul de start <span style={{ color:'#E24B4A' }}>*</span></label>
                        <input value={d.dataStart} onChange={e => setDiagnostice(prev => prev.map(x => x.id === d.id ? {...x, dataStart: e.target.value} : x))} placeholder="ex: 03/2018" style={inp} />
                      </div>
                      <div style={{ ...g2, marginBottom:'8px' }}>
                        <div><label style={lbl}>Specialist curant</label><input value={d.specialist} onChange={e => setDiagnostice(prev => prev.map(x => x.id === d.id ? {...x, specialist: e.target.value} : x))} placeholder="ex: Dr. Ana Gheorghe" style={inp} /></div>
                        <div><label style={lbl}>Unde e urmărit</label><input value={d.undeUrmarit} onChange={e => setDiagnostice(prev => prev.map(x => x.id === d.id ? {...x, undeUrmarit: e.target.value} : x))} placeholder="ex: Medicover" style={inp} /></div>
                      </div>
                      <div style={{ marginBottom:'8px' }}><label style={lbl}>Medicație aferentă</label><input value={d.medicatie} onChange={e => setDiagnostice(prev => prev.map(x => x.id === d.id ? {...x, medicatie: e.target.value} : x))} placeholder="ex: Euthyrox 50mcg" style={inp} /></div>
                      <Checkbox checked={d.atestat} onChange={() => setDiagnostice(prev => prev.map(x => x.id === d.id ? {...x, atestat: !x.atestat} : x))} label="Document care atestă acest diagnostic" />
                    </div>
                  ))}
                  <button onClick={() => setDiagnostice(prev => [...prev, { id: Date.now().toString(), nume:'', dataStart:'', specialist:'', undeUrmarit:'', medicatie:'', atestat:false }])} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'9px 16px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#16705a', fontWeight:500, cursor:'pointer' }}>+ Adaugă diagnostic</button>
                </>
              ) : (
                <div style={{ display:'flex', gap:'12px', overflowX:'auto', paddingBottom:'8px' }}>
                  {diagnostice.map((d, i) => (
                    <div key={i} style={{ background:'#f8f9fa', border:'0.5px solid #e5e7eb', borderRadius:'10px', padding:'16px', minWidth:'220px', maxWidth:'220px', display:'flex', flexDirection:'column', gap:'8px', flexShrink:0 }}>
                      <div style={{ fontSize:'14px', fontWeight:500, color:'#111', textTransform:'capitalize' }}>{d.nume}</div>
                      <BadgeDoc atestat={d.atestat} />
                      <div style={{ height:'0.5px', background:'#e5e7eb' }}></div>
                      {d.dataStart && <div><div style={lbl}>Luna / An start</div><div style={{ fontSize:'13px', color:'#111' }}>{d.dataStart}</div></div>}
                      {d.specialist && <div><div style={lbl}>Specialist</div><div style={{ fontSize:'13px', color:'#111', textTransform:'capitalize' }}>{d.specialist}</div></div>}
                      {d.undeUrmarit && <div><div style={lbl}>Unde e urmărit</div><div style={{ fontSize:'13px', color:'#111', textTransform:'capitalize' }}>{d.undeUrmarit}</div></div>}
                      {d.medicatie && <div><div style={lbl}>Medicație</div><div style={{ fontSize:'13px', color:'#111', textTransform:'capitalize' }}>{d.medicatie}</div></div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* IMPLANTURI */}
        <div style={card}>
          <Banner icon={<IconDeviceHeartMonitor size={14} color="white" stroke={1.5} />} title="Implante și dispozitive medicale" sub={implanteList.length > 0 ? 'Declarate de titular sau extrase din documente' : 'Nicio intrare adăugată'} onAdd={editMode ? () => setImplanteList(prev => [...prev, { id: Date.now().toString(), nume:'', dataImplant:'', spital:'', observatii:'', atestat:false }]) : undefined} />
          {(implanteList.length > 0 || editMode) && (
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
                        <div><label style={lbl}>Data implantării</label><input value={d.dataImplant} onChange={e => setImplanteList(prev => prev.map(x => x.id === d.id ? {...x, dataImplant: e.target.value} : x))} placeholder="ex: 03/2019" style={inp} /></div>
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
                    <div key={i} style={{ background:'#f8f9fa', border:'0.5px solid #e5e7eb', borderRadius:'10px', padding:'16px', minWidth:'220px', maxWidth:'220px', display:'flex', flexDirection:'column', gap:'8px', flexShrink:0 }}>
                      <div style={{ fontSize:'14px', fontWeight:500, color:'#111', textTransform:'capitalize' }}>{d.nume}</div>
                      <BadgeDoc atestat={d.atestat} />
                      <div style={{ height:'0.5px', background:'#e5e7eb' }}></div>
                      {d.dataImplant && <div><div style={lbl}>Data implantării</div><div style={{ fontSize:'13px', color:'#111' }}>{d.dataImplant}</div></div>}
                      {d.spital && <div><div style={lbl}>Spital</div><div style={{ fontSize:'13px', color:'#111', textTransform:'capitalize' }}>{d.spital}</div></div>}
                      {d.observatii && <div><div style={lbl}>Observații</div><div style={{ fontSize:'13px', color:'#E24B4A', fontWeight:500, textTransform:'capitalize' }}>{d.observatii}</div></div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* INTERVENTII */}
        <div style={card}>
          <Banner icon={<IconScissors size={14} color="white" stroke={1.5} />} title="Intervenții chirurgicale majore" sub={interventii.length > 0 ? 'Declarate de titular sau extrase din documente' : 'Nicio intrare adăugată'} onAdd={editMode ? () => setInterventii(prev => [...prev, { id: Date.now().toString(), nume:'', dataInterventie:'', spital:'', chirurg:'', atestat:false }]) : undefined} />
          {(interventii.length > 0 || editMode) && (
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
                        <div><label style={lbl}>Data intervenției</label><input value={d.dataInterventie} onChange={e => setInterventii(prev => prev.map(x => x.id === d.id ? {...x, dataInterventie: e.target.value} : x))} placeholder="ex: 03/2005" style={inp} /></div>
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
                    <div key={i} style={{ background:'#f8f9fa', border:'0.5px solid #e5e7eb', borderRadius:'10px', padding:'16px', minWidth:'220px', maxWidth:'220px', display:'flex', flexDirection:'column', gap:'8px', flexShrink:0 }}>
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
          <Banner icon={<IconPhone size={14} color="white" stroke={1.5} />} title="Date de contact" sub="Introduse de titular" />
          <div style={body}>
            {editMode ? (
              <>
                <div style={{ ...g2, marginBottom:'14px' }}>
                  <div><label style={lbl}>Persoană de contact — Nume</label><input value={contactNume} onChange={e => setContactNume(e.target.value)} placeholder="ex: Ion Popescu" style={inp} /></div>
                  <div><label style={lbl}>Persoană de contact — Telefon</label><input value={contactTel} onChange={e => setContactTel(e.target.value)} placeholder="ex: 0721 000 000" style={inp} /></div>
                </div>
                <div style={divider}></div>
                <div style={{ ...g2, marginBottom:'14px' }}>
                  <div><label style={lbl}>Medic de familie — Nume</label><input value={medicNume} onChange={e => setMedicNume(e.target.value)} placeholder="ex: Dr. Maria Ionescu" style={inp} /></div>
                  <div><label style={lbl}>Medic de familie — Telefon</label><input value={medicTel} onChange={e => setMedicTel(e.target.value)} placeholder="ex: 021 000 0000" style={inp} /></div>
                </div>
                <div style={divider}></div>
                <Checkbox checked={asiguratCnas} onChange={() => setAsiguratCnas(!asiguratCnas)} label="Asigurat CNAS" />
              </>
            ) : (
              <>
                <div style={{ ...g2, marginBottom:'14px' }}>
                  <div>
                    <div style={lbl}>Persoană de contact urgență</div>
                    <div style={{ fontSize:'14px', fontWeight:500, color:'#111', textTransform:'capitalize' }}>{contactNume || '—'}</div>
                    <div style={{ fontSize:'13px', color:'#111', marginTop:'2px' }}>{contactTel}</div>
                  </div>
                  <div>
                    <div style={lbl}>Medic de familie</div>
                    <div style={{ fontSize:'14px', fontWeight:500, color:'#111', textTransform:'capitalize' }}>{medicNume || '—'}</div>
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
        </div>

        {/* QR COD */}
        <div style={card}>
          <Banner icon={<IconQrcode size={14} color="white" stroke={1.5} />} title="QR Cod de urgență" sub="Date embedded offline" />
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