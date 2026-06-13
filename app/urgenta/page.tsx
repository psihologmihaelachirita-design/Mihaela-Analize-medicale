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
  const [dropdown, setDropdown] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      const { data } = await supabase.from('profiluri').select('*').eq('id', session.user.id).single()
      setProfil(data)
      setLoading(false)
    })
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'system-ui' }}><p style={{ color:'#111' }}>Se încarcă...</p></div>

  const username = profil?.nume || user?.email?.split('@')[0]
  const cnp = profil?.cnp || ''
  const varsta = cnp.length === 13 ? calculeazaVarsta(cnp) : profil?.varsta
  const dataNasterii = cnp.length === 13 ? calculeazaDataNasterii(cnp) : ''
  const sex = cnp.length === 13 ? calculeazaSex(cnp) : profil?.sex
  const imc = profil?.greutate && profil?.inaltime ? calculeazaIMC(profil.greutate, profil.inaltime) : null
  const diagnostice = profil?.diagnostice_json ? JSON.parse(profil.diagnostice_json) : []
  const implanteList = profil?.implanturi_json ? JSON.parse(profil.implanturi_json) : []
  const interventii = profil?.interventii_json ? JSON.parse(profil.interventii_json) : []

  const navStyle: React.CSSProperties = { padding:'6px 10px', borderRadius:'8px', fontSize:'13px', color:'#111', textDecoration:'none', fontWeight:500 }
  const card: React.CSSProperties = { background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', overflow:'hidden', marginBottom:'12px' }
  const body: React.CSSProperties = { padding:'18px 20px' }
  const lbl: React.CSSProperties = { fontSize:'11px', fontWeight:500, color:'#555', textTransform:'uppercase' as const, letterSpacing:'0.5px', marginBottom:'4px' }

  function BadgeDoc({ tip }: { tip: 'atestat' | 'declarat' | 'necunoscut' }) {
    if (tip === 'necunoscut') return null
    const cfg = {
      atestat: { bg:'#E1F5EE', color:'#085041', label:'✓ Document care atestă' },
      declarat: { bg:'#f8f9fa', color:'#111', label:'⚠ Declarat de titular' },
    }[tip]
    return <span style={{ display:'inline-flex', padding:'4px 10px', background:cfg.bg, color:cfg.color, borderRadius:'12px', fontSize:'11px', fontWeight:500 }}>{cfg.label}</span>
  }

  function Banner({ icon, title, sub }: { icon: React.ReactNode, title: string, sub: string }) {
    return (
      <div style={{ background:'#16705a', padding:'14px 20px', display:'flex', alignItems:'center', gap:'10px' }}>
        <div style={{ width:'28px', height:'28px', background:'rgba(255,255,255,0.15)', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{icon}</div>
        <div>
          <div style={{ fontSize:'14px', fontWeight:500, color:'white' }}>{title}</div>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.75)', marginTop:'1px' }}>{sub}</div>
        </div>
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
    <div style={{ fontFamily:'system-ui,-apple-system,sans-serif', background:'#f8f9fa', minHeight:'100vh' }}>

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

        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'24px' }}>
          <div>
            <div style={{ fontSize:'20px', fontWeight:500, color:'#111' }}>Card de urgență MedFile</div>
            <div style={{ fontSize:'13px', color:'#111', marginTop:'4px' }}>Date extrase automat sau declarate de titular</div>
          </div>
          <div style={{ display:'flex', gap:'8px' }}>
            <Link href="/urgenta/editare" style={{ padding:'9px 16px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#111', textDecoration:'none', fontWeight:500 }}>✎ Editează</Link>
            <button style={{ padding:'9px 18px', background:'#16705a', color:'white', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:500, cursor:'pointer' }}>⎙ Printează</button>
          </div>
        </div>

        {/* DATE DE URGENTA */}
        <div style={card}>
          <Banner icon={<IconId size={14} color="white" stroke={1.5} />} title="Date de urgență" sub="Identitate și parametri fizici" />
          <div style={body}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:'14px', marginBottom:'14px' }}>
              <Val label="Nume" value={profil?.nume?.split(' ')[0] || ''} />
              <Val label="Prenume" value={profil?.nume?.split(' ').slice(1).join(' ') || ''} />
              <div>
                <div style={lbl}>CNP</div>
                <div style={{ fontSize:'14px', fontWeight:500, color:'#111', letterSpacing:'1px' }}>{cnp ? cnp[0] + '••••••••••••' : '—'}</div>
              </div>
              <Val label="Data nașterii" value={dataNasterii} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:'14px', marginBottom:'14px' }}>
              <Val label="Vârstă" value={varsta ? `${varsta} ani` : ''} />
              <Val label="Sex" value={sex || ''} />
              <Val label="Înălțime" value={profil?.inaltime ? `${profil.inaltime} cm` : ''} />
              <Val label="Greutate" value={profil?.greutate ? `${profil.greutate} kg` : ''} />
            </div>
            {imc && (
              <>
                <div style={{ height:'0.5px', background:'#e5e7eb', margin:'14px 0' }}></div>
                <div>
                  <div style={lbl}>Indice de masă corporală (IMC)</div>
                  <div style={{ fontSize:'14px', fontWeight:500, color:'#111' }}>{imc.valoare}</div>
                  <span style={{ display:'inline-flex', padding:'3px 10px', background:'#E1F5EE', color:'#085041', borderRadius:'12px', fontSize:'12px', fontWeight:500, marginTop:'4px' }}>✓ {imc.label}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* GRUP SANGUIN + ALERGII */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px', marginBottom:'12px' }}>
          {[
            { label:'Grup sanguin și Rh', val: profil?.grup_sanguin, big: true },
            { label:'Alergii medicamentoase', val: profil?.alergii_medicamente, big: false },
            { label:'Alte alergii cunoscute', val: profil?.alergii_alimentare, big: false },
          ].map((item, i) => (
            <div key={i} style={{ background:'white', border:'0.5px solid #e5e7eb', borderRadius:'10px', padding:'14px', display:'flex', flexDirection:'column', gap:'8px' }}>
              <div style={lbl}>{item.label}</div>
              <div style={{ fontSize: item.big ? '24px' : '13px', fontWeight:500, color: item.big ? '#E24B4A' : '#111' }}>{item.val || '—'}</div>
              {item.val && <BadgeDoc tip="declarat" />}
            </div>
          ))}
        </div>

        {/* DIAGNOSTICE */}
        {diagnostice.length > 0 && (
          <div style={card}>
            <Banner icon={<IconStethoscope size={14} color="white" stroke={1.5} />} title="Diagnostice cronice" sub="Declarate de titular sau extrase din documente" />
            <div style={body}>
              <div style={{ display:'flex', gap:'12px', overflowX:'auto', paddingBottom:'8px' }}>
                {diagnostice.map((d: any, i: number) => (
                  <div key={i} style={{ background:'#f8f9fa', border:'0.5px solid #e5e7eb', borderRadius:'10px', padding:'16px', minWidth:'220px', maxWidth:'220px', display:'flex', flexDirection:'column', gap:'8px', flexShrink:0 }}>
                    <div style={{ fontSize:'14px', fontWeight:500, color:'#111' }}>{d.nume || '—'}</div>
                    <div style={{ height:'0.5px', background:'#e5e7eb' }}></div>
                    {d.dataStart && <div><div style={lbl}>Data de start</div><div style={{ fontSize:'13px', color:'#111' }}>{d.dataStart}</div></div>}
                    {d.specialist && <div><div style={lbl}>Specialist</div><div style={{ fontSize:'13px', color:'#111' }}>{d.specialist}</div></div>}
                    {d.undeUrmarit && <div><div style={lbl}>Unde e urmărit</div><div style={{ fontSize:'13px', color:'#111' }}>{d.undeUrmarit}</div></div>}
                    {d.medicatie && <div><div style={lbl}>Medicație</div><div style={{ fontSize:'13px', color:'#111' }}>{d.medicatie}</div></div>}
                    <BadgeDoc tip={d.atestat ? 'atestat' : 'declarat'} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* IMPLANTURI */}
        {implanteList.length > 0 && (
          <div style={card}>
            <Banner icon={<IconDeviceHeartMonitor size={14} color="white" stroke={1.5} />} title="Implante și dispozitive medicale" sub="Declarate de titular sau extrase din documente" />
            <div style={body}>
              <div style={{ display:'flex', gap:'12px', overflowX:'auto', paddingBottom:'8px' }}>
                {implanteList.map((d: any, i: number) => (
                  <div key={i} style={{ background:'#f8f9fa', border:'0.5px solid #e5e7eb', borderRadius:'10px', padding:'16px', minWidth:'220px', maxWidth:'220px', display:'flex', flexDirection:'column', gap:'8px', flexShrink:0 }}>
                    <div style={{ fontSize:'14px', fontWeight:500, color:'#111' }}>{d.nume || '—'}</div>
                    <div style={{ height:'0.5px', background:'#e5e7eb' }}></div>
                    {d.dataImplant && <div><div style={lbl}>Data implantării</div><div style={{ fontSize:'13px', color:'#111' }}>{d.dataImplant}</div></div>}
                    {d.spital && <div><div style={lbl}>Spital</div><div style={{ fontSize:'13px', color:'#111' }}>{d.spital}</div></div>}
                    {d.observatii && <div><div style={lbl}>Observații</div><div style={{ fontSize:'13px', color:'#E24B4A', fontWeight:500 }}>{d.observatii}</div></div>}
                    <BadgeDoc tip={d.atestat ? 'atestat' : 'declarat'} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* INTERVENTII */}
        {interventii.length > 0 && (
          <div style={card}>
            <Banner icon={<IconScissors size={14} color="white" stroke={1.5} />} title="Intervenții chirurgicale majore" sub="Declarate de titular sau extrase din documente" />
            <div style={body}>
              <div style={{ display:'flex', gap:'12px', overflowX:'auto', paddingBottom:'8px' }}>
                {interventii.map((d: any, i: number) => (
                  <div key={i} style={{ background:'#f8f9fa', border:'0.5px solid #e5e7eb', borderRadius:'10px', padding:'16px', minWidth:'220px', maxWidth:'220px', display:'flex', flexDirection:'column', gap:'8px', flexShrink:0 }}>
                    <div style={{ fontSize:'14px', fontWeight:500, color:'#111' }}>{d.nume || '—'}</div>
                    <div style={{ height:'0.5px', background:'#e5e7eb' }}></div>
                    {d.dataInterventie && <div><div style={lbl}>Data intervenției</div><div style={{ fontSize:'13px', color:'#111' }}>{d.dataInterventie}</div></div>}
                    {d.spital && <div><div style={lbl}>Spital</div><div style={{ fontSize:'13px', color:'#111' }}>{d.spital}</div></div>}
                    {d.chirurg && <div><div style={lbl}>Chirurg</div><div style={{ fontSize:'13px', color:'#111' }}>{d.chirurg}</div></div>}
                    <BadgeDoc tip={d.atestat ? 'atestat' : 'declarat'} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DATE CONTACT */}
        <div style={card}>
          <Banner icon={<IconPhone size={14} color="white" stroke={1.5} />} title="Date de contact" sub="Introduse de titular" />
          <div style={body}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'14px' }}>
              <div>
                <div style={lbl}>Persoană de contact urgență</div>
                <div style={{ fontSize:'14px', fontWeight:500, color:'#111' }}>{profil?.contact_urgenta_nume || '—'}</div>
                <div style={{ fontSize:'13px', color:'#111', marginTop:'2px' }}>{profil?.contact_urgenta_telefon || ''}</div>
              </div>
              <div>
                <div style={lbl}>Medic de familie</div>
                <div style={{ fontSize:'14px', fontWeight:500, color:'#111' }}>{profil?.medic_familie_nume || '—'}</div>
                <div style={{ fontSize:'13px', color:'#111', marginTop:'2px' }}>{profil?.medic_familie_telefon || ''}</div>
              </div>
            </div>
            <div style={{ height:'0.5px', background:'#e5e7eb', margin:'14px 0' }}></div>
            <div>
              <div style={lbl}>Asigurare CNAS</div>
              <span style={{ display:'inline-flex', padding:'4px 12px', background: profil?.asigurat_cnas ? '#E1F5EE' : '#f8f9fa', color: profil?.asigurat_cnas ? '#085041' : '#555', borderRadius:'12px', fontSize:'12px', fontWeight:500, marginTop:'6px' }}>
                {profil?.asigurat_cnas ? '✓ Asigurat CNAS' : '— Nedeclarat'}
              </span>
            </div>
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