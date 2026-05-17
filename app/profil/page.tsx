'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IconUser, IconStethoscope, IconVaccine, IconPhone } from '@tabler/icons-react'

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

  const [sectiuni, setSectiuni] = useState({ baza: true, medicale: true, vaccinuri: true, contacte: true })
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

  function toggleSectiune(key: keyof typeof sectiuni) {
    setSectiuni(prev => ({ ...prev, [key]: !prev[key] }))
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)

      const { data: profil } = await supabase
        .from('profiluri').select('*').eq('id', session.user.id).single()

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
        .from('vaccinuri').select('*').eq('user_id', session.user.id).order('created_at', { ascending: true })
      setVaccinuri(vacc || [])
      setLoading(false)
    })
  }, [])

  function adaugaVaccin() { setVaccinuri(prev => [...prev, { denumire: '', data_administrare: '', note: '' }]) }
  function updateVaccin(i: number, f: keyof Vaccin, v: string) { setVaccinuri(prev => prev.map((x, j) => j === i ? { ...x, [f]: v } : x)) }
  function stergeVaccin(i: number) { setVaccinuri(prev => prev.filter((_, j) => j !== i)) }

  async function handleSalvare() {
    setSalvare(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { error } = await supabase.from('profiluri').upsert({
      id: session.user.id, nume, varsta: parseInt(varsta) || null, sex,
      grup_sanguin: grupSanguin || null, greutate: parseFloat(greutate) || null,
      inaltime: parseFloat(inaltime) || null, fumator,
      boli_cronice: boliCronice || null, alergii_medicamente: alergiiMedicamente || null,
      alergii_alimentare: alergiiAlimentare || null, tratamente_cronice: tratamenteCronice || null,
      implante: implante || null, contact_urgenta_nume: contactNume || null,
      contact_urgenta_telefon: contactTelefon || null,
      medic_familie_nume: medicFamilieNume || null, medic_familie_telefon: medicFamilieTelefon || null,
    })

    await supabase.from('vaccinuri').delete().eq('user_id', session.user.id)
    const valide = vaccinuri.filter(v => v.denumire.trim())
    if (valide.length > 0) {
      await supabase.from('vaccinuri').insert(valide.map(v => ({
        user_id: session.user.id, denumire: v.denumire,
        data_administrare: v.data_administrare || null, note: v.note || null,
      })))
    }

    if (error) setMesaj('Eroare: ' + error.message)
    else setMesaj('Profil salvat!')
    setSalvare(false)
    setTimeout(() => setMesaj(''), 3000)
  }

  if (loading) return <p style={{fontFamily:'system-ui', padding:'2rem', color:'#888'}}>Se încarcă...</p>

  const progres = [!!(nume && varsta && sex), !!boliCronice, vaccinuri.length > 0, !!contactNume].filter(Boolean).length * 25

  const inp: React.CSSProperties = { width:'100%', padding:'9px 13px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', outline:'none', background:'white', color:'#111', fontFamily:'system-ui' }
  const ta: React.CSSProperties = { ...inp, resize:'none', height:'76px', background:'#f8f9fa', color:'#666' }
  const lbl: React.CSSProperties = { display:'block', fontSize:'12px', fontWeight:500, color:'#555', marginBottom:'5px' }
  const g3: React.CSSProperties = { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'14px', marginBottom:'14px' }
  const g2: React.CSSProperties = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'14px' }

  const navItems = [
    { key:'baza', Icon: IconUser, label:'Date de bază' },
    { key:'medicale', Icon: IconStethoscope, label:'Date medicale' },
    { key:'vaccinuri', Icon: IconVaccine, label:'Vaccinuri' },
    { key:'contacte', Icon: IconPhone, label:'Contacte urgență' },
  ]

  function Banner({ icon, title, sub, badge, skey }: { icon:string, title:string, sub:string, badge?:boolean, skey:keyof typeof sectiuni }) {
    return (
      <div onClick={() => toggleSectiune(skey)} style={{ background:'#16705a', padding:'15px 22px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ width:'32px', height:'32px', background:'rgba(255,255,255,0.15)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px' }}>{icon}</div>
          <div>
            <div style={{ fontSize:'14px', fontWeight:500, color:'white', display:'flex', alignItems:'center', gap:'8px' }}>
              {title}
              {badge && <span style={{ padding:'2px 8px', background:'rgba(255,255,255,0.15)', borderRadius:'12px', fontSize:'11px', color:'rgba(255,255,255,0.9)' }}>opțional</span>}
            </div>
            <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.72)', marginTop:'2px' }}>{sub}</div>
          </div>
        </div>
        <span style={{ color:'rgba(255,255,255,0.8)', fontSize:'14px' }}>{sectiuni[skey] ? '▲' : '▼'}</span>
      </div>
    )
  }

  return (
    <div style={{ fontFamily:'system-ui,-apple-system,sans-serif', background:'#f8f9fa', minHeight:'100vh', display:'flex', flexDirection:'column' }}>

      {/* Topbar */}
      <div style={{ background:'white', borderBottom:'0.5px solid #e5e7eb', padding:'0 32px', height:'56px', display:'flex', alignItems:'center', gap:'20px', flexShrink:0 }}>
        <Link href="/dashboard" style={{ fontSize:'13px', color:'#16705a', fontWeight:500, textDecoration:'none' }}>← Dosar</Link>
        <div style={{ width:'0.5px', height:'20px', background:'#e5e7eb' }}></div>
        <span style={{ fontSize:'15px', fontWeight:500, color:'#111' }}>Profilul meu</span>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'230px 1fr', flex:1 }}>

        {/* Sidebar */}
        <div style={{ background:'white', borderRight:'0.5px solid #e5e7eb', padding:'32px 0 24px', display:'flex', flexDirection:'column' }}>

          {/* Logo */}
          <div style={{ padding:'0 20px 28px', borderBottom:'0.5px solid #e5e7eb', marginBottom:'24px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <div style={{ width:'36px', height:'36px', background:'#E1F5EE', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', color:'#16705a', fontSize:'20px', fontWeight:500 }}>✚</div>
              <span style={{ fontSize:'16px', fontWeight:500, color:'#111' }}>MedFile</span>
            </div>
          </div>

          {/* Nav items */}
          <div style={{ padding:'0 16px', flex:1 }}>
            <div style={{ fontSize:'11px', fontWeight:500, color:'#aaa', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:'10px', padding:'0 8px' }}>Secțiuni profil</div>
            {navItems.map(item => (
              <div key={item.key} onClick={() => toggleSectiune(item.key as keyof typeof sectiuni)}
                style={{ display:'flex', alignItems:'center', gap:'10px', padding:'9px 12px', borderRadius:'8px', fontSize:'13px', color: sectiuni[item.key as keyof typeof sectiuni] ? '#085041' : '#555', background: sectiuni[item.key as keyof typeof sectiuni] ? '#E1F5EE' : 'transparent', cursor:'pointer', marginBottom:'3px', fontWeight: sectiuni[item.key as keyof typeof sectiuni] ? 500 : 400 }}>
                <span style={{ display:'flex', alignItems:'center', color:'#555' }}><item.Icon size={16} stroke={1.5} /></span>
                {item.label}
              </div>
            ))}
          </div>

          {/* Progres */}
          <div style={{ padding:'14px', margin:'16px 16px 12px', background:'#f8f9fa', borderRadius:'10px', border:'0.5px solid #e5e7eb' }}>
            <div style={{ fontSize:'12px', color:'#555', marginBottom:'8px', display:'flex', justifyContent:'space-between' }}>
              <span>Progres completare</span>
              <span style={{ color:'#16705a', fontWeight:500 }}>{progres}%</span>
            </div>
            <div style={{ height:'4px', background:'#e5e7eb', borderRadius:'2px', overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${progres}%`, background:'#16705a', borderRadius:'2px' }}></div>
            </div>
            <div style={{ fontSize:'11px', color:'#aaa', marginTop:'8px' }}>Completează pentru QR cod de urgență</div>
          </div>

          {/* Disclaimer */}
          <div style={{ padding:'14px', margin:'0 16px', background:'#FAEEDA', borderRadius:'10px', border:'0.5px solid #EF9F27' }}>
            <div style={{ fontSize:'13px', color:'#854F0B', lineHeight:1.6 }}>
              ⚠ Toate datele introduse sunt în răspunderea exclusivă a utilizatorului.
            </div>
          </div>
        </div>

        {/* Main */}
        <div style={{ padding:'28px', overflowY:'auto' }}>

          {/* Date de baza */}
          <div style={{ background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', marginBottom:'14px', overflow:'hidden' }}>
            <Banner icon="👤" title="Date de bază" sub="Folosite pentru intervale de referință corecte pe vârstă și sex" skey="baza" />
            {sectiuni.baza && (
              <div style={{ padding:'20px 22px' }}>
                <div style={g3}>
                  <div><label style={lbl}>Nume complet</label><input value={nume} onChange={e => setNume(e.target.value)} placeholder="Numele tău" style={inp} /></div>
                  <div><label style={lbl}>Vârstă</label><input type="number" value={varsta} onChange={e => setVarsta(e.target.value)} placeholder="ex: 35" style={inp} /></div>
                  <div>
                    <label style={lbl}>Grup sanguin și Rh</label>
                    <select value={grupSanguin} onChange={e => setGrupSanguin(e.target.value)} style={{ ...inp, cursor:'pointer' }}>
                      <option value="">Selectează</option>
                      {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <div style={{ fontSize:'11px', color:'#aaa', marginTop:'4px' }}>În răspunderea utilizatorului</div>
                  </div>
                </div>
                <div style={g3}>
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
                  <div><label style={lbl}>Greutate (kg)</label><input type="number" value={greutate} onChange={e => setGreutate(e.target.value)} placeholder="ex: 65" style={inp} /></div>
                  <div><label style={lbl}>Înălțime (cm)</label><input type="number" value={inaltime} onChange={e => setInaltime(e.target.value)} placeholder="ex: 168" style={inp} /></div>
                </div>
                <div>
                  <label style={lbl}>Fumător</label>
                  <div style={{ display:'flex', gap:'16px', marginTop:'6px' }}>
                    {[{val:true,label:'Da'},{val:false,label:'Nu'}].map(opt => (
                      <label key={opt.label} style={{ display:'flex', alignItems:'center', gap:'7px', fontSize:'13px', cursor:'pointer', color:'#111' }}>
                        <div onClick={() => setFumator(opt.val)} style={{ width:'16px', height:'16px', borderRadius:'50%', border:'0.5px solid #e5e7eb', background: fumator===opt.val?'#16705a':'white', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                          {fumator===opt.val && <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'white' }}></div>}
                        </div>
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Date medicale */}
          <div style={{ background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', marginBottom:'14px', overflow:'hidden' }}>
            <Banner icon="🩺" title="Date medicale" sub="Completează treptat — pentru QR cod urgență și raportul pentru medic" badge skey="medicale" />
            {sectiuni.medicale && (
              <div style={{ padding:'20px 22px' }}>
                <div style={{ marginBottom:'14px' }}><label style={lbl}>Boli cronice diagnosticate</label><textarea value={boliCronice} onChange={e => setBoliCronice(e.target.value)} placeholder="ex: Hipotiroidism Hashimoto, Diabet tip 2..." style={ta} /></div>
                <div style={g2}>
                  <div><label style={lbl}>Alergii medicamentoase</label><textarea value={alergiiMedicamente} onChange={e => setAlergiiMedicamente(e.target.value)} placeholder="ex: Penicilina, Aspirina..." style={ta} /></div>
                  <div><label style={lbl}>Alergii alimentare</label><textarea value={alergiiAlimentare} onChange={e => setAlergiiAlimentare(e.target.value)} placeholder="ex: Nuci, Gluten..." style={ta} /></div>
                </div>
                <div style={g2}>
                  <div><label style={lbl}>Tratamente cronice curente</label><textarea value={tratamenteCronice} onChange={e => setTratamenteCronice(e.target.value)} placeholder="ex: Euthyrox 50mcg/zi..." style={ta} /></div>
                  <div><label style={lbl}>Implante și dispozitive medicale</label><textarea value={implante} onChange={e => setImplante(e.target.value)} placeholder="ex: Stent cardiac 2019..." style={ta} /></div>
                </div>
              </div>
            )}
          </div>

          {/* Vaccinuri */}
          <div style={{ background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', marginBottom:'14px', overflow:'hidden' }}>
            <Banner icon="💉" title="Vaccinuri" sub="Istoricul vaccinărilor tale" badge skey="vaccinuri" />
            {sectiuni.vaccinuri && (
              <div style={{ padding:'20px 22px' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 150px 28px', gap:'8px', paddingBottom:'8px', borderBottom:'0.5px solid #e5e7eb', marginBottom:'4px' }}>
                  {['Vaccin','Data administrării',''].map((h,i) => <div key={i} style={{ fontSize:'11px', fontWeight:500, color:'#aaa', textTransform:'uppercase', letterSpacing:'0.5px' }}>{h}</div>)}
                </div>
                {vaccinuri.map((v, i) => (
                  <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 150px 28px', gap:'8px', alignItems:'center', padding:'8px 0', borderBottom:'0.5px solid #f0f0f0' }}>
                    <input value={v.denumire} onChange={e => updateVaccin(i,'denumire',e.target.value)} placeholder="ex: HPV, Tetanos..." style={inp} />
                    <input type="date" value={v.data_administrare} onChange={e => updateVaccin(i,'data_administrare',e.target.value)} style={{ ...inp, fontSize:'12px' }} />
                    <button onClick={() => stergeVaccin(i)} style={{ border:'none', background:'none', cursor:'pointer', fontSize:'16px', color:'#aaa', padding:0 }}>×</button>
                  </div>
                ))}
                <div onClick={adaugaVaccin} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 0 0', fontSize:'13px', color:'#16705a', fontWeight:500, cursor:'pointer' }}>
                  + Adaugă vaccin
                </div>
              </div>
            )}
          </div>

          {/* Contacte urgenta */}
          <div style={{ background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', marginBottom:'14px', overflow:'hidden' }}>
            <Banner icon="📞" title="Contacte de urgență" sub="Afișate pe QR codul de urgență" badge skey="contacte" />
            {sectiuni.contacte && (
              <div style={{ padding:'20px 22px' }}>
                <div style={g2}>
                  <div><label style={lbl}>Persoană de contact — Nume</label><input value={contactNume} onChange={e => setContactNume(e.target.value)} placeholder="ex: Ion Popescu" style={inp} /></div>
                  <div><label style={lbl}>Persoană de contact — Telefon</label><input value={contactTelefon} onChange={e => setContactTelefon(e.target.value)} placeholder="ex: 0721 000 000" style={inp} /></div>
                </div>
                <div style={{ height:'0.5px', background:'#e5e7eb', margin:'16px 0' }}></div>
                <div style={{ fontSize:'13px', fontWeight:500, color:'#111', marginBottom:'12px' }}>
                  Medic de familie <span style={{ padding:'2px 8px', background:'#f8f9fa', borderRadius:'12px', fontSize:'11px', color:'#aaa', marginLeft:'6px' }}>opțional</span>
                </div>
                <div style={g2}>
                  <div><label style={lbl}>Nume medic</label><input value={medicFamilieNume} onChange={e => setMedicFamilieNume(e.target.value)} placeholder="ex: Dr. Maria Ionescu" style={inp} /></div>
                  <div><label style={lbl}>Telefon cabinet</label><input value={medicFamilieTelefon} onChange={e => setMedicFamilieTelefon(e.target.value)} placeholder="ex: 021 000 0000" style={inp} /></div>
                </div>
              </div>
            )}
          </div>

          {mesaj && (
            <div style={{ padding:'12px 16px', borderRadius:'8px', marginBottom:'16px', background: mesaj.includes('Eroare')?'#FCEBEB':'#E1F5EE', color: mesaj.includes('Eroare')?'#A32D2D':'#0F6E56', fontSize:'13px' }}>
              {mesaj}
            </div>
          )}

          <div style={{ display:'flex', justifyContent:'flex-end', gap:'10px', paddingTop:'4px' }}>
            <Link href="/dashboard" style={{ padding:'10px 18px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'14px', color:'#555', textDecoration:'none' }}>Anulează</Link>
            <button onClick={handleSalvare} disabled={salvare} style={{ padding:'10px 26px', background:'#16705a', color:'white', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:500, cursor:'pointer' }}>
              {salvare ? 'Se salvează...' : 'Salvează profilul'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}