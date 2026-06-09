'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IconChartBar, IconHeartRateMonitor } from '@tabler/icons-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [analize, setAnalize] = useState<any[]>([])
  const [profil, setProfil] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tabPeste, setTabPeste] = useState<'3luni' | '1an'>('3luni')
  const [tabSub, setTabSub] = useState<'3luni' | '1an'>('3luni')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      const { data: analizeData } = await supabase
        .from('analize').select('*').eq('user_id', session.user.id).order('data_analiza', { ascending: false })
      setAnalize(analizeData || [])
      const { data: profilData } = await supabase
        .from('profiluri').select('*').eq('id', session.user.id).single()
      setProfil(profilData)
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'system-ui'}}>
      <p style={{color:'#111', fontSize:'14px'}}>Se încarcă...</p>
    </div>
  )

  const username = profil?.nume || user?.email?.split('@')[0]

  const acum = new Date()
  const acum3luni = new Date(acum); acum3luni.setMonth(acum.getMonth() - 3)
  const acum1an = new Date(acum); acum1an.setFullYear(acum.getFullYear() - 1)

  function filtreazaData(a: any, tab: '3luni' | '1an') {
    const data = new Date(a.data_analiza)
    return tab === '3luni' ? data >= acum3luni : data >= acum1an
  }

  function getLaborator(observatii: string) {
    if (!observatii) return ''
    const match = observatii.match(/Laborator: ([^|]+)/)
    return match ? match[1].trim() : ''
  }

  function getStatus(a: any): string {
    if (a.tip_rezultat === 'calitativ') {
      const txt = (a.rezultat_text || '').toLowerCase()
      if (txt.includes('pozitiv') || txt.includes('prezent') || txt.includes('reactiv')) return 'peste'
      return 'normal'
    }
    const obs = (a.observatii || '').toLowerCase()
    if (obs.includes('status: peste')) return 'peste'
    if (obs.includes('status: sub')) return 'sub'
    if (a.referinta_min !== null && a.referinta_max !== null && a.valoare !== null) {
      const val = parseFloat(a.valoare)
      if (val > a.referinta_max) return 'peste'
      if (val < a.referinta_min) return 'sub'
      return 'normal'
    }
    return 'normal'
  }

  const pesteTot = analize.filter(a => getStatus(a) === 'peste')
  const subTot = analize.filter(a => getStatus(a) === 'sub')
  const pesteLista = pesteTot.filter(a => filtreazaData(a, tabPeste))
  const subLista = subTot.filter(a => filtreazaData(a, tabSub))
  const ultimulBuletin = analize[0]

  const campuriUrgenta = [
    profil?.grup_sanguin, profil?.alergii_medicamente, profil?.alergii_alimentare,
    profil?.tratamente_cronice, profil?.boli_cronice, profil?.contact_urgenta_nume, profil?.contact_urgenta_telefon,
  ]
  const progres = Math.round((campuriUrgenta.filter(Boolean).length / campuriUrgenta.length) * 100)

  return (
    <div style={{fontFamily:'system-ui,-apple-system,sans-serif', background:'#f8f9fa', minHeight:'100vh'}}>

      {/* Topbar */}
      <div style={{background:'white', borderBottom:'0.5px solid #e5e7eb', padding:'0 24px', height:'52px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:10}}>
        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
          <div style={{width:'26px', height:'26px', background:'#E1F5EE', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color:'#0F6E56', fontSize:'13px', fontWeight:500}}>✚</div>
          <span style={{fontSize:'15px', fontWeight:500, color:'#111'}}>MedFile</span>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:'4px'}}>
          <Link href="/panoramic" style={{padding:'6px 10px', borderRadius:'8px', fontSize:'13px', color:'#111', textDecoration:'none', fontWeight:500}}>Panoramic</Link>
          <Link href="/urgenta" style={{padding:'6px 10px', borderRadius:'8px', fontSize:'13px', color:'#111', textDecoration:'none', fontWeight:500}}>Urgență</Link>
          <Link href="/dosar" style={{padding:'6px 10px', borderRadius:'8px', fontSize:'13px', color:'#111', textDecoration:'none', fontWeight:500}}>Dosar</Link>
          <Link href="/upload" style={{padding:'6px 12px', background:'#16705a', color:'white', borderRadius:'8px', fontSize:'13px', fontWeight:500, textDecoration:'none', marginLeft:'4px'}}>+ Adaugă</Link>
          <span style={{fontSize:'13px', color:'#111', fontWeight:500, marginLeft:'8px'}}>{username} ▾</span>
        </div>
      </div>

      <div style={{maxWidth:'900px', margin:'0 auto', padding:'24px'}}>

        {/* 2 butoane mari */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'20px'}}>
          <Link href="/panoramic" style={{textDecoration:'none', background:'#16705a', border:'0.5px solid #111', borderRadius:'12px', padding:'24px', display:'flex', flexDirection:'column', alignItems:'center', gap:'12px', textAlign:'center'}}>
            <div style={{width:'52px', height:'52px', borderRadius:'12px', background:'white', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
              <IconChartBar size={26} color="#0F6E56" stroke={1.5} />
            </div>
            <div>
              <div style={{fontSize:'17px', fontWeight:500, color:'white', marginBottom:'4px'}}>Vizualizare panoramică</div>
              <div style={{fontSize:'13px', color:'white', lineHeight:1.4}}>Toate analizele cross-laborator vizualizate în timp</div>
            </div>
          </Link>
          <Link href="/urgenta" style={{textDecoration:'none', background:'#16705a', border:'0.5px solid #111', borderRadius:'12px', padding:'24px', display:'flex', flexDirection:'column', alignItems:'center', gap:'12px', textAlign:'center'}}>
            <div style={{width:'52px', height:'52px', borderRadius:'12px', background:'white', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
              <IconHeartRateMonitor size={26} color="#0F6E56" stroke={1.5} />
            </div>
            <div>
              <div style={{fontSize:'17px', fontWeight:500, color:'white', marginBottom:'4px'}}>Profil de urgență</div>
              <div style={{fontSize:'13px', color:'white', lineHeight:1.4}}>Datele tale critice disponibile instant oricui te tratează</div>
            </div>
          </Link>
        </div>

        {/* Analize anormale */}
        <div style={{fontSize:'11px', fontWeight:500, color:'#111', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:'10px'}}>Analize în afara limitelor normale</div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'16px'}}>

          <div style={{background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', overflow:'hidden'}}>
            <div style={{padding:'12px 16px', borderBottom:'0.5px solid #e5e7eb', borderLeft:'3px solid #E24B4A', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
              <span style={{fontSize:'13px', fontWeight:500, color:'#E24B4A'}}>↑ Peste limită</span>
              <span style={{fontSize:'20px', fontWeight:500, color:'#E24B4A'}}>{pesteTot.length}</span>
            </div>
            <div style={{display:'flex', borderBottom:'0.5px solid #e5e7eb'}}>
              {(['3luni', '1an'] as const).map(t => (
                <div key={t} onClick={() => setTabPeste(t)} style={{flex:1, padding:'7px', fontSize:'11px', textAlign:'center', cursor:'pointer', color: tabPeste===t ? '#16705a' : '#111', fontWeight: tabPeste===t ? 500 : 400, borderBottom: tabPeste===t ? '2px solid #16705a' : '2px solid transparent'}}>
                  {t === '3luni' ? 'Ultimele 3 luni' : 'Ultimul an'}
                </div>
              ))}
            </div>
            <div style={{maxHeight:'200px', overflowY:'auto'}}>
              {pesteLista.length === 0 ? (
                <div style={{padding:'16px', textAlign:'center', fontSize:'12px', color:'#111'}}>Nicio analiză în această perioadă</div>
              ) : pesteLista.map((a, i) => (
                <div key={i} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 16px', borderBottom:'0.5px solid #f5f5f5'}}>
                  <div>
                    <div style={{fontSize:'12px', color:'#111'}}>{a.nume_analiza}</div>
                    <div style={{fontSize:'11px', color:'#111'}}>{a.data_analiza}{getLaborator(a.observatii) ? ` · ${getLaborator(a.observatii)}` : ''}</div>
                  </div>
                  <div style={{fontSize:'12px', fontWeight:500, color:'#E24B4A'}}>{a.tip_rezultat === 'calitativ' ? a.rezultat_text : `${a.valoare} ${a.unitate || ''}`}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', overflow:'hidden'}}>
            <div style={{padding:'12px 16px', borderBottom:'0.5px solid #e5e7eb', borderLeft:'3px solid #B45309', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
              <span style={{fontSize:'13px', fontWeight:500, color:'#B45309'}}>↓ Sub limită</span>
              <span style={{fontSize:'20px', fontWeight:500, color:'#B45309'}}>{subTot.length}</span>
            </div>
            <div style={{display:'flex', borderBottom:'0.5px solid #e5e7eb'}}>
              {(['3luni', '1an'] as const).map(t => (
                <div key={t} onClick={() => setTabSub(t)} style={{flex:1, padding:'7px', fontSize:'11px', textAlign:'center', cursor:'pointer', color: tabSub===t ? '#16705a' : '#111', fontWeight: tabSub===t ? 500 : 400, borderBottom: tabSub===t ? '2px solid #16705a' : '2px solid transparent'}}>
                  {t === '3luni' ? 'Ultimele 3 luni' : 'Ultimul an'}
                </div>
              ))}
            </div>
            <div style={{maxHeight:'200px', overflowY:'auto'}}>
              {subLista.length === 0 ? (
                <div style={{padding:'16px', textAlign:'center', fontSize:'12px', color:'#111'}}>Nicio analiză în această perioadă</div>
              ) : subLista.map((a, i) => (
                <div key={i} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 16px', borderBottom:'0.5px solid #f5f5f5'}}>
                  <div>
                    <div style={{fontSize:'12px', color:'#111'}}>{a.nume_analiza}</div>
                    <div style={{fontSize:'11px', color:'#111'}}>{a.data_analiza}{getLaborator(a.observatii) ? ` · ${getLaborator(a.observatii)}` : ''}</div>
                  </div>
                  <div style={{fontSize:'12px', fontWeight:500, color:'#B45309'}}>{a.tip_rezultat === 'calitativ' ? a.rezultat_text : `${a.valoare} ${a.unitate || ''}`}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom 3 carduri */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px'}}>
          <div style={{background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', padding:'14px'}}>
            <div style={{fontSize:'11px', color:'#111', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'6px'}}>Ultimul buletin</div>
            {ultimulBuletin ? (
              <>
                <div style={{fontSize:'14px', fontWeight:500, color:'#111'}}>{getLaborator(ultimulBuletin.observatii) || 'Necunoscut'}</div>
                <div style={{fontSize:'12px', color:'#111', marginTop:'3px'}}>{ultimulBuletin.data_analiza}</div>
              </>
            ) : (
              <div style={{fontSize:'13px', color:'#111'}}>Niciun buletin încă</div>
            )}
          </div>

          <Link href="/dosar" style={{textDecoration:'none', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', padding:'14px', display:'block'}}>
            <div style={{fontSize:'11px', color:'#111', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'6px'}}>Dosar urgență</div>
            <div style={{fontSize:'14px', fontWeight:500, color:'#111'}}>{progres}% complet</div>
            <div style={{fontSize:'12px', color:'#111', marginTop:'3px'}}>{progres < 100 ? 'Apasă pentru a completa' : 'Complet ✓'}</div>
            <div style={{height:'4px', background:'#e5e7eb', borderRadius:'2px', overflow:'hidden', marginTop:'8px'}}>
              <div style={{height:'100%', width:`${progres}%`, background:'#16705a', borderRadius:'2px'}}></div>
            </div>
          </Link>

          <div style={{background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', padding:'14px'}}>
            <div style={{fontSize:'11px', color:'#111', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'10px'}}>Acțiuni rapide</div>
            <div style={{display:'flex', gap:'8px'}}>
              <Link href="/export" style={{flex:1, padding:'8px', background:'#f8f9fa', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'12px', color:'#111', textDecoration:'none', textAlign:'center', fontWeight:500}}>↓ Export</Link>
              <Link href="/upload" style={{flex:1, padding:'8px', background:'#f8f9fa', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'12px', color:'#111', textDecoration:'none', textAlign:'center', fontWeight:500}}>↑ Adaugă</Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}