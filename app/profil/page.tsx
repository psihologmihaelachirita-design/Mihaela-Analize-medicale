'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Vaccin {
  id?: string
  denumire: string
  data_administrare: string
  note: string
}

export default function Profil() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [salvare, setSalvare] = useState(false)
  const [mesaj, setMesaj] = useState('')
  const router = useRouter()

  const [nume, setNume] = useState('')
  const [varsta, setVarsta] = useState('')
  const [sex, setSex] = useState('')
  const [grupSanguin, setGrupSanguin] = useState('')
  const [greutate, setGreutate] = useState('')
  const [inaltime, setInaltime] = useState('')
  const [fumator, setFumator] = useState<boolean | null>(null)
  const [boliCronice, setBoliCronice] = useState('')
  const [alergiiMedicamente, setAlergiiMedicamente] = useState('')
  const [alergiiAlimentare, setAlergiiAlimentare] = useState('')
  const [tratamenteCronice, setTratamenteCronice] = useState('')
  const [implante, setImplante] = useState('')
  const [contactNume, setContactNume] = useState('')
  const [contactTelefon, setContactTelefon] = useState('')
  const [medicFamilieNume, setMedicFamilieNume] = useState('')
  const [medicFamilieTelefon, setMedicFamilieTelefon] = useState('')
  const [vaccinuri, setVaccinuri] = useState<Vaccin[]>([])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)

      const { data: profil } = await supabase
        .from('profiluri')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profil) {
        setNume(profil.nume || '')
        setVarsta(profil.varsta?.toString() || '')
        setSex(profil.sex || '')
        setGrupSanguin(profil.grup_sanguin || '')
        setGreutate(profil.greutate?.toString() || '')
        setInaltime(profil.inaltime?.toString() || '')
        setFumator(profil.fumator ?? null)
        setBoliCronice(profil.boli_cronice || '')
        setAlergiiMedicamente(profil.alergii_medicamente || '')
        setAlergiiAlimentare(profil.alergii_alimentare || '')
        setTratamenteCronice(profil.tratamente_cronice || '')
        setImplante(profil.implante || '')
        setContactNume(profil.contact_urgenta_nume || '')
        setContactTelefon(profil.contact_urgenta_telefon || '')
        setMedicFamilieNume(profil.medic_familie_nume || '')
        setMedicFamilieTelefon(profil.medic_familie_telefon || '')
      }

      const { data: vacc } = await supabase
        .from('vaccinuri')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true })
      setVaccinuri(vacc || [])

      setLoading(false)
    })
  }, [])

  function adaugaVaccin() {
    setVaccinuri(prev => [...prev, { denumire: '', data_administrare: '', note: '' }])
  }

  function updateVaccin(index: number, field: keyof Vaccin, value: string) {
    setVaccinuri(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v))
  }

  function stergeVaccin(index: number) {
    setVaccinuri(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSalvare() {
    setSalvare(true)
    setMesaj('')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { error } = await supabase.from('profiluri').upsert({
      id: session.user.id,
      nume,
      varsta: parseInt(varsta) || null,
      sex,
      grup_sanguin: grupSanguin || null,
      greutate: parseFloat(greutate) || null,
      inaltime: parseFloat(inaltime) || null,
      fumator: fumator,
      boli_cronice: boliCronice || null,
      alergii_medicamente: alergiiMedicamente || null,
      alergii_alimentare: alergiiAlimentare || null,
      tratamente_cronice: tratamenteCronice || null,
      implante: implante || null,
      contact_urgenta_nume: contactNume || null,
      contact_urgenta_telefon: contactTelefon || null,
      medic_familie_nume: medicFamilieNume || null,
      medic_familie_telefon: medicFamilieTelefon || null,
    })

    // Salveaza vaccinuri
    await supabase.from('vaccinuri').delete().eq('user_id', session.user.id)
    const vaccinuriValide = vaccinuri.filter(v => v.denumire.trim())
    if (vaccinuriValide.length > 0) {
      await supabase.from('vaccinuri').insert(
        vaccinuriValide.map(v => ({
          user_id: session.user.id,
          denumire: v.denumire,
          data_administrare: v.data_administrare || null,
          note: v.note || null,
        }))
      )
    }

    if (error) setMesaj('Eroare: ' + error.message)
    else setMesaj('Profil salvat!')
    setSalvare(false)
    setTimeout(() => setMesaj(''), 3000)
  }

  if (loading) return <p style={{fontFamily:'system-ui', padding:'2rem', color:'#888'}}>Se încarcă...</p>

  const inputStyle = {
    width:'100%', padding:'9px 12px', border:'0.5px solid #e5e7eb',
    borderRadius:'8px', fontSize:'13px', outline:'none',
    background:'#f8f9fa', color:'#111', fontFamily:'system-ui'
  }
  const labelStyle = { display:'block' as const, fontSize:'12px', color:'#555', fontWeight:500 as const, marginBottom:'5px' }
  const textareaStyle = { ...inputStyle, resize:'none' as const, height:'72px' }

  return (
    <div style={{fontFamily:'system-ui,-apple-system,sans-serif', background:'#f8f9fa', minHeight:'100vh'}}>

      <div style={{background:'white', borderBottom:'0.5px solid #e5e7eb', padding:'0 24px', height:'52px', display:'flex', alignItems:'center', gap:'16px'}}>
        <Link href="/dashboard" style={{color:'#16705a', textDecoration:'none', fontSize:'14px', fontWeight:500}}>← Dosar</Link>
        <span style={{color:'#e5e7eb'}}>|</span>
        <span style={{fontSize:'15px', fontWeight:500, color:'#111'}}>Profilul meu</span>
      </div>

      <div style={{maxWidth:'640px', margin:'0 auto', padding:'24px'}}>

        {/* Sectiunea 1 */}
        <div style={{background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', padding:'20px', marginBottom:'16px'}}>
          <div style={{fontSize:'14px', fontWeight:500, color:'#111', marginBottom:'4px'}}>Date de bază</div>
          <div style={{fontSize:'12px', color:'#888', marginBottom:'16px'}}>Completează în 2 minute — folosite pentru intervale de referință corecte</div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px'}}>
            <div>
              <label style={labelStyle}>Nume complet</label>
              <input value={nume} onChange={e => setNume(e.target.value)} placeholder="Numele tău" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Vârstă</label>
              <input type="number" value={varsta} onChange={e => setVarsta(e.target.value)} placeholder="ex: 35" style={inputStyle} />
            </div>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px'}}>
            <div>
              <label style={labelStyle}>Sex</label>
              <div style={{display:'flex', gap:'16px', marginTop:'8px'}}>
                {['F', 'M'].map(s => (
                  <label key={s} style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'13px', cursor:'pointer', color:'#111'}}>
                    <div onClick={() => setSex(s)} style={{width:'16px', height:'16px', borderRadius:'50%', border:'0.5px solid #e5e7eb', background: sex === s ? '#16705a' : 'white', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0}}>
                      {sex === s && <div style={{width:'6px', height:'6px', borderRadius:'50%', background:'white'}}></div>}
                    </div>
                    {s === 'F' ? 'Feminin' : 'Masculin'}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Grup sanguin și Rh</label>
              <select value={grupSanguin} onChange={e => setGrupSanguin(e.target.value)} style={{...inputStyle, cursor:'pointer'}}>
                <option value="">Selectează</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              {grupSanguin && <div style={{fontSize:'11px', color:'#888', marginTop:'4px'}}>Introdus pe răspunderea utilizatorului</div>}
            </div>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px'}}>
            <div>
              <label style={labelStyle}>Greutate (kg)</label>
              <input type="number" value={greutate} onChange={e => setGreutate(e.target.value)} placeholder="ex: 65" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Înălțime (cm)</label>
              <input type="number" value={inaltime} onChange={e => setInaltime(e.target.value)} placeholder="ex: 168" style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Fumător</label>
            <div style={{display:'flex', gap:'16px', marginTop:'8px'}}>
              {[{val: true, label:'Da'}, {val: false, label:'Nu'}].map(opt => (
                <label key={opt.label} style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'13px', cursor:'pointer', color:'#111'}}>
                  <div onClick={() => setFumator(opt.val)} style={{width:'16px', height:'16px', borderRadius:'50%', border:'0.5px solid #e5e7eb', background: fumator === opt.val ? '#16705a' : 'white', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0}}>
                    {fumator === opt.val && <div style={{width:'6px', height:'6px', borderRadius:'50%', background:'white'}}></div>}
                  </div>
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Sectiunea 2 */}
        <div style={{background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', padding:'20px', marginBottom:'16px'}}>
          <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px'}}>
            <div style={{fontSize:'14px', fontWeight:500, color:'#111'}}>Date medicale</div>
            <span style={{padding:'2px 8px', background:'#f8f9fa', borderRadius:'12px', fontSize:'11px', color:'#888'}}>opțional</span>
          </div>
          <div style={{fontSize:'12px', color:'#888', marginBottom:'16px'}}>Completează treptat — folosite pentru QR code de urgență și raportul pentru medic</div>

          <div style={{marginBottom:'12px'}}>
            <label style={labelStyle}>Boli cronice diagnosticate</label>
            <textarea value={boliCronice} onChange={e => setBoliCronice(e.target.value)} placeholder="ex: Hipotiroidism, Diabet tip 2..." style={textareaStyle} />
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px'}}>
            <div>
              <label style={labelStyle}>Alergii medicamentoase</label>
              <textarea value={alergiiMedicamente} onChange={e => setAlergiiMedicamente(e.target.value)} placeholder="ex: Penicilina, Aspirina..." style={textareaStyle} />
            </div>
            <div>
              <label style={labelStyle}>Alergii alimentare</label>
              <textarea value={alergiiAlimentare} onChange={e => setAlergiiAlimentare(e.target.value)} placeholder="ex: Nuci, Gluten..." style={textareaStyle} />
            </div>
          </div>

          <div style={{marginBottom:'12px'}}>
            <label style={labelStyle}>Tratamente cronice curente</label>
            <textarea value={tratamenteCronice} onChange={e => setTratamenteCronice(e.target.value)} placeholder="ex: Euthyrox 50mcg/zi, Metformin 500mg..." style={textareaStyle} />
          </div>

          <div style={{marginBottom:'16px'}}>
            <label style={labelStyle}>Implante și dispozitive medicale</label>
            <input value={implante} onChange={e => setImplante(e.target.value)} placeholder="ex: Stent cardiac 2019, Proteză șold stâng..." style={inputStyle} />
          </div>

          <div style={{height:'0.5px', background:'#e5e7eb', marginBottom:'16px'}}></div>

          {/* Vaccinuri */}
          <div style={{fontSize:'13px', fontWeight:500, color:'#111', marginBottom:'10px'}}>Vaccinuri <span style={{fontSize:'11px', color:'#888', fontWeight:400}}>opțional</span></div>

          {vaccinuri.map((v, i) => (
            <div key={i} style={{display:'grid', gridTemplateColumns:'2fr 1fr auto', gap:'8px', marginBottom:'8px', alignItems:'center'}}>
              <input value={v.denumire} onChange={e => updateVaccin(i, 'denumire', e.target.value)} placeholder="ex: HPV, Tetanos, COVID..." style={inputStyle} />
              <input type="date" value={v.data_administrare} onChange={e => updateVaccin(i, 'data_administrare', e.target.value)} style={inputStyle} />
              <button onClick={() => stergeVaccin(i)} style={{border:'none', background:'none', cursor:'pointer', fontSize:'18px', color:'#888', padding:'0 4px'}}>×</button>
            </div>
          ))}

          <button onClick={adaugaVaccin} style={{display:'flex', alignItems:'center', gap:'6px', padding:'7px 14px', background:'#f8f9fa', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'12px', color:'#555', cursor:'pointer', marginBottom:'16px'}}>
            + Adaugă vaccin
          </button>

          <div style={{height:'0.5px', background:'#e5e7eb', marginBottom:'16px'}}></div>

          {/* Contact urgenta */}
          <div style={{fontSize:'13px', fontWeight:500, color:'#111', marginBottom:'10px'}}>Contact de urgență <span style={{fontSize:'11px', color:'#888', fontWeight:400}}>opțional</span></div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px'}}>
            <div>
              <label style={labelStyle}>Nume</label>
              <input value={contactNume} onChange={e => setContactNume(e.target.value)} placeholder="ex: Ion Popescu" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Telefon</label>
              <input value={contactTelefon} onChange={e => setContactTelefon(e.target.value)} placeholder="ex: 0721 000 000" style={inputStyle} />
            </div>
          </div>

          <div style={{fontSize:'13px', fontWeight:500, color:'#111', marginBottom:'10px'}}>Medic de familie <span style={{fontSize:'11px', color:'#888', fontWeight:400}}>opțional</span></div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
            <div>
              <label style={labelStyle}>Nume medic</label>
              <input value={medicFamilieNume} onChange={e => setMedicFamilieNume(e.target.value)} placeholder="ex: Dr. Maria Ionescu" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Telefon cabinet</label>
              <input value={medicFamilieTelefon} onChange={e => setMedicFamilieTelefon(e.target.value)} placeholder="ex: 021 000 0000" style={inputStyle} />
            </div>
          </div>
        </div>

        {mesaj && (
          <div style={{padding:'12px 16px', borderRadius:'8px', marginBottom:'16px', background: mesaj.includes('Eroare') ? '#FCEBEB' : '#E1F5EE', color: mesaj.includes('Eroare') ? '#A32D2D' : '#0F6E56', fontSize:'13px'}}>
            {mesaj}
          </div>
        )}

        <button onClick={handleSalvare} disabled={salvare} style={{width:'100%', padding:'13px', background:'#16705a', color:'white', border:'none', borderRadius:'8px', fontSize:'15px', fontWeight:500, cursor:'pointer'}}>
          {salvare ? 'Se salvează...' : 'Salvează profilul'}
        </button>
      </div>
    </div>
  )
}