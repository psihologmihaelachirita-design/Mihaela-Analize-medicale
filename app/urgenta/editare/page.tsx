'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface DiagnosticItem {
  id: string
  nume: string
  dataStart: string
  specialist: string
  undeUrmarit: string
  medicatie: string
  atestat: boolean
}

interface ImplantItem {
  id: string
  nume: string
  dataImplant: string
  spital: string
  observatii: string
  atestat: boolean
}

interface InterventieItem {
  id: string
  nume: string
  dataInterventie: string
  spital: string
  chirurg: string
  atestat: boolean
}

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

export default function UrgentaEditare() {
  const [loading, setLoading] = useState(true)
  const [salvare, setSalvare] = useState(false)
  const [mesaj, setMesaj] = useState('')
  const router = useRouter()

  const [cnp, setCnp] = useState('')
  const [grupSanguin, setGrupSanguin] = useState('')
  const [alergiiMed, setAlergiiMed] = useState('')
  const [alergiiAl, setAlergiiAl] = useState('')
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
      const { data } = await supabase.from('profiluri').select('*').eq('id', session.user.id).single()
      if (data) {
        setCnp(data.cnp || '')
        setGrupSanguin(data.grup_sanguin || '')
        setAlergiiMed(data.alergii_medicamente || '')
        setAlergiiAl(data.alergii_alimentare || '')
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
      alergii_medicamente: alergiiMed || null,
      alergii_alimentare: alergiiAl || null,
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
    router.push('/urgenta')
  }

  function adaugaDiagnostic() {
    setDiagnostice(prev => [...prev, { id: Date.now().toString(), nume:'', dataStart:'', specialist:'', undeUrmarit:'', medicatie:'', atestat:false }])
  }
  function updateDiagnostic(id: string, field: keyof DiagnosticItem, value: any) {
    setDiagnostice(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d))
  }
  function stergeDiagnostic(id: string) {
    setDiagnostice(prev => prev.filter(d => d.id !== id))
  }

  function adaugaImplant() {
    setImplanteList(prev => [...prev, { id: Date.now().toString(), nume:'', dataImplant:'', spital:'', observatii:'', atestat:false }])
  }
  function updateImplant(id: string, field: keyof ImplantItem, value: any) {
    setImplanteList(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d))
  }
  function stergeImplant(id: string) {
    setImplanteList(prev => prev.filter(d => d.id !== id))
  }

  function adaugaInterventie() {
    setInterventii(prev => [...prev, { id: Date.now().toString(), nume:'', dataInterventie:'', spital:'', chirurg:'', atestat:false }])
  }
  function updateInterventie(id: string, field: keyof InterventieItem, value: any) {
    setInterventii(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d))
  }
  function stergeInterventie(id: string) {
    setInterventii(prev => prev.filter(d => d.id !== id))
  }

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'system-ui' }}><p>Se încarcă...</p></div>

  const varsta = cnp.length === 13 ? calculeazaVarsta(cnp) : null
  const dataNasterii = cnp.length === 13 ? calculeazaDataNasterii(cnp) : ''
  const sex = cnp.length === 13 ? calculeazaSex(cnp) : ''

  const inp: React.CSSProperties = { width:'100%', padding:'9px 13px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#111', background:'white', outline:'none', fontFamily:'system-ui', boxSizing:'border-box' }
  const lbl: React.CSSProperties = { fontSize:'12px', fontWeight:500, color:'#555', display:'block', marginBottom:'5px' }
  const g2: React.CSSProperties = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }
  const card: React.CSSProperties = { background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', overflow:'hidden', marginBottom:'12px' }
  const banner = (title: string) => (
    <div style={{ background:'#16705a', padding:'14px 20px' }}>
      <div style={{ fontSize:'14px', fontWeight:500, color:'white' }}>{title}</div>
    </div>
  )
  const body: React.CSSProperties = { padding:'18px 20px' }
  const divider: React.CSSProperties = { height:'0.5px', background:'#e5e7eb', margin:'14px 0' }
  const itemCard: React.CSSProperties = { background:'#f8f9fa', border:'0.5px solid #e5e7eb', borderRadius:'10px', padding:'16px', marginBottom:'12px' }

  return (
    <div style={{ fontFamily:'system-ui,-apple-system,sans-serif', background:'#f8f9fa', minHeight:'100vh' }}>

      {/* Topbar */}
      <div style={{ background:'white', borderBottom:'0.5px solid #e5e7eb', padding:'0 24px', height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <Link href="/urgenta" style={{ fontSize:'13px', color:'#16705a', fontWeight:500, textDecoration:'none' }}>← Card urgență</Link>
          <div style={{ width:'0.5px', height:'20px', background:'#e5e7eb' }}></div>
          <span style={{ fontSize:'15px', fontWeight:500, color:'#111' }}>Editează card urgență</span>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <Link href="/urgenta" style={{ padding:'8px 16px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#111', textDecoration:'none', fontWeight:500 }}>Anulează</Link>
          <button onClick={handleSalvare} disabled={salvare} style={{ padding:'8px 20px', background:'#16705a', color:'white', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:500, cursor:'pointer' }}>
            {salvare ? 'Se salvează...' : 'Salvează'}
          </button>
        </div>
      </div>

      <div style={{ maxWidth:'720px', margin:'0 auto', padding:'28px 24px' }}>

        {mesaj && <div style={{ padding:'12px 16px', borderRadius:'8px', marginBottom:'16px', background:'#FCEBEB', color:'#A32D2D', fontSize:'13px' }}>{mesaj}</div>}

        {/* DATE IDENTITATE */}
        <div style={card}>
          {banner('Date de urgență')}
          <div style={body}>
            <div style={{ marginBottom:'14px' }}>
              <label style={lbl}>CNP</label>
              <input value={cnp} onChange={e => setCnp(e.target.value)} placeholder="13 cifre" maxLength={13} style={inp} />
              {cnp.length === 13 && (
                <div style={{ display:'flex', gap:'16px', marginTop:'8px', fontSize:'12px', color:'#16705a', fontWeight:500 }}>
                  <span>Data nașterii: {dataNasterii}</span>
                  <span>Vârstă: {varsta} ani</span>
                  <span>Sex: {sex}</span>
                </div>
              )}
            </div>
            <div style={{ ...g2 }}>
              <div><label style={lbl}>Greutate (kg)</label><input type="number" value={greutate} onChange={e => setGreutate(e.target.value)} placeholder="ex: 65" style={inp} /></div>
              <div><label style={lbl}>Înălțime (cm)</label><input type="number" value={inaltime} onChange={e => setInaltime(e.target.value)} placeholder="ex: 168" style={inp} /></div>
            </div>
          </div>
        </div>

        {/* GRUP SANGUIN + ALERGII */}
        <div style={card}>
          {banner('Grup sanguin și alergii')}
          <div style={body}>
            <div style={{ marginBottom:'14px' }}>
              <label style={lbl}>Grup sanguin și Rh</label>
              <select value={grupSanguin} onChange={e => setGrupSanguin(e.target.value)} style={inp}>
                <option value="">Selectează</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-','Necunoscut'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div style={divider}></div>
            <div style={g2}>
              <div><label style={lbl}>Alergii medicamentoase</label><input value={alergiiMed} onChange={e => setAlergiiMed(e.target.value)} placeholder="ex: Penicilină, Aspirină..." style={inp} /></div>
              <div><label style={lbl}>Alte alergii cunoscute</label><input value={alergiiAl} onChange={e => setAlergiiAl(e.target.value)} placeholder="ex: Nuci, Arahide..." style={inp} /></div>
            </div>
          </div>
        </div>

        {/* DIAGNOSTICE */}
        <div style={card}>
          {banner('Diagnostice cronice')}
          <div style={body}>
            {diagnostice.map(d => (
              <div key={d.id} style={itemCard}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
                  <div style={{ fontSize:'13px', fontWeight:500, color:'#111' }}>Diagnostic</div>
                  <button onClick={() => stergeDiagnostic(d.id)} style={{ border:'none', background:'none', cursor:'pointer', fontSize:'16px', color:'#aaa' }}>×</button>
                </div>
                <div style={{ marginBottom:'10px' }}>
                  <label style={lbl}>Nume diagnostic</label>
                  <input value={d.nume} onChange={e => updateDiagnostic(d.id, 'nume', e.target.value)} placeholder="ex: Hipotiroidism Hashimoto" style={inp} />
                </div>
                <div style={{ ...g2, marginBottom:'10px' }}>
                  <div><label style={lbl}>Data de start</label><input value={d.dataStart} onChange={e => updateDiagnostic(d.id, 'dataStart', e.target.value)} placeholder="ex: 2018" style={inp} /></div>
                  <div><label style={lbl}>Specialist curant</label><input value={d.specialist} onChange={e => updateDiagnostic(d.id, 'specialist', e.target.value)} placeholder="ex: Dr. Ana Gheorghe" style={inp} /></div>
                </div>
                <div style={{ ...g2, marginBottom:'10px' }}>
                  <div><label style={lbl}>Unde e urmărit</label><input value={d.undeUrmarit} onChange={e => updateDiagnostic(d.id, 'undeUrmarit', e.target.value)} placeholder="ex: Medicover București" style={inp} /></div>
                  <div><label style={lbl}>Medicație aferentă</label><input value={d.medicatie} onChange={e => updateDiagnostic(d.id, 'medicatie', e.target.value)} placeholder="ex: Euthyrox 50mcg/zi" style={inp} /></div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <div onClick={() => updateDiagnostic(d.id, 'atestat', !d.atestat)} style={{ width:'16px', height:'16px', borderRadius:'4px', border:'0.5px solid #e5e7eb', background: d.atestat ? '#16705a' : 'white', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                    {d.atestat && <span style={{ color:'white', fontSize:'11px', fontWeight:700 }}>✓</span>}
                  </div>
                  <span style={{ fontSize:'12px', color:'#111' }}>Document care atestă acest diagnostic</span>
                </div>
              </div>
            ))}
            <button onClick={adaugaDiagnostic} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'9px 16px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#16705a', fontWeight:500, cursor:'pointer' }}>
              + Adaugă diagnostic
            </button>
          </div>
        </div>

        {/* IMPLANTURI */}
        <div style={card}>
          {banner('Implante și dispozitive medicale')}
          <div style={body}>
            {implanteList.map(d => (
              <div key={d.id} style={itemCard}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
                  <div style={{ fontSize:'13px', fontWeight:500, color:'#111' }}>Implant / Dispozitiv</div>
                  <button onClick={() => stergeImplant(d.id)} style={{ border:'none', background:'none', cursor:'pointer', fontSize:'16px', color:'#aaa' }}>×</button>
                </div>
                <div style={{ marginBottom:'10px' }}>
                  <label style={lbl}>Nume implant / dispozitiv</label>
                  <input value={d.nume} onChange={e => updateImplant(d.id, 'nume', e.target.value)} placeholder="ex: Stent coronarian" style={inp} />
                </div>
                <div style={{ ...g2, marginBottom:'10px' }}>
                  <div><label style={lbl}>Data implantării</label><input value={d.dataImplant} onChange={e => updateImplant(d.id, 'dataImplant', e.target.value)} placeholder="ex: 2019" style={inp} /></div>
                  <div><label style={lbl}>Spital</label><input value={d.spital} onChange={e => updateImplant(d.id, 'spital', e.target.value)} placeholder="ex: Spitalul Fundeni" style={inp} /></div>
                </div>
                <div style={{ marginBottom:'10px' }}>
                  <label style={lbl}>Observații critice</label>
                  <input value={d.observatii} onChange={e => updateImplant(d.id, 'observatii', e.target.value)} placeholder="ex: Atenție proceduri imagistice" style={inp} />
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <div onClick={() => updateImplant(d.id, 'atestat', !d.atestat)} style={{ width:'16px', height:'16px', borderRadius:'4px', border:'0.5px solid #e5e7eb', background: d.atestat ? '#16705a' : 'white', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                    {d.atestat && <span style={{ color:'white', fontSize:'11px', fontWeight:700 }}>✓</span>}
                  </div>
                  <span style={{ fontSize:'12px', color:'#111' }}>Document care atestă acest implant</span>
                </div>
              </div>
            ))}
            <button onClick={adaugaImplant} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'9px 16px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#16705a', fontWeight:500, cursor:'pointer' }}>
              + Adaugă implant
            </button>
          </div>
        </div>

        {/* INTERVENTII */}
        <div style={card}>
          {banner('Intervenții chirurgicale majore')}
          <div style={body}>
            {interventii.map(d => (
              <div key={d.id} style={itemCard}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
                  <div style={{ fontSize:'13px', fontWeight:500, color:'#111' }}>Intervenție chirurgicală</div>
                  <button onClick={() => stergeInterventie(d.id)} style={{ border:'none', background:'none', cursor:'pointer', fontSize:'16px', color:'#aaa' }}>×</button>
                </div>
                <div style={{ marginBottom:'10px' }}>
                  <label style={lbl}>Tip intervenție</label>
                  <input value={d.nume} onChange={e => updateInterventie(d.id, 'nume', e.target.value)} placeholder="ex: Apendicectomie" style={inp} />
                </div>
                <div style={{ ...g2, marginBottom:'10px' }}>
                  <div><label style={lbl}>Data intervenției</label><input value={d.dataInterventie} onChange={e => updateInterventie(d.id, 'dataInterventie', e.target.value)} placeholder="ex: 2005" style={inp} /></div>
                  <div><label style={lbl}>Spital</label><input value={d.spital} onChange={e => updateInterventie(d.id, 'spital', e.target.value)} placeholder="ex: Spitalul Colentina" style={inp} /></div>
                </div>
                <div style={{ marginBottom:'10px' }}>
                  <label style={lbl}>Chirurg</label>
                  <input value={d.chirurg} onChange={e => updateInterventie(d.id, 'chirurg', e.target.value)} placeholder="ex: Dr. Ionescu Mihai" style={inp} />
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <div onClick={() => updateInterventie(d.id, 'atestat', !d.atestat)} style={{ width:'16px', height:'16px', borderRadius:'4px', border:'0.5px solid #e5e7eb', background: d.atestat ? '#16705a' : 'white', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                    {d.atestat && <span style={{ color:'white', fontSize:'11px', fontWeight:700 }}>✓</span>}
                  </div>
                  <span style={{ fontSize:'12px', color:'#111' }}>Document care atestă această intervenție</span>
                </div>
              </div>
            ))}
            <button onClick={adaugaInterventie} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'9px 16px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#16705a', fontWeight:500, cursor:'pointer' }}>
              + Adaugă intervenție
            </button>
          </div>
        </div>

        {/* DATE CONTACT */}
        <div style={card}>
          {banner('Date de contact')}
          <div style={body}>
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
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <div onClick={() => setAsiguratCnas(!asiguratCnas)} style={{ width:'16px', height:'16px', borderRadius:'4px', border:'0.5px solid #e5e7eb', background: asiguratCnas ? '#16705a' : 'white', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                {asiguratCnas && <span style={{ color:'white', fontSize:'11px', fontWeight:700 }}>✓</span>}
              </div>
              <span style={{ fontSize:'13px', color:'#111' }}>Asigurat CNAS</span>
            </div>
          </div>
        </div>

        <div style={{ display:'flex', justifyContent:'flex-end', gap:'10px', paddingTop:'8px' }}>
          <Link href="/urgenta" style={{ padding:'10px 18px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'14px', color:'#111', textDecoration:'none', fontWeight:500 }}>Anulează</Link>
          <button onClick={handleSalvare} disabled={salvare} style={{ padding:'10px 26px', background:'#16705a', color:'white', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:500, cursor:'pointer' }}>
            {salvare ? 'Se salvează...' : 'Salvează'}
          </button>
        </div>

      </div>
    </div>
  )
}