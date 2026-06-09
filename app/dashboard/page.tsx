'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [analize, setAnalize] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tabPeste, setTabPeste] = useState<'3luni' | '1an'>('3luni')
  const [tabSub, setTabSub] = useState<'3luni' | '1an'>('3luni')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      const { data } = await supabase
        .from('analize')
        .select('*')
        .eq('user_id', session.user.id)
        .order('data_analiza', { ascending: false })
      setAnalize(data || [])
      setLoading(false)
    })
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'system-ui'}}>
      <p style={{color:'#888', fontSize:'14px'}}>Se încarcă...</p>
    </div>
  )

  const username = user?.email?.split('@')[0]
  const initiale = user?.email?.slice(0,2)?.toUpperCase() || 'MC'

  const acum = new Date()
  const acum3luni = new Date(acum); acum3luni.setMonth(acum.getMonth() - 3)
  const acum1an = new Date(acum); acum1an.setFullYear(acum.getFullYear() - 1)

  function filtreazaData(a: any, tab: '3luni' | '1an') {
    const data = new Date(a.data_analiza)
    return tab === '3luni' ? data >= acum3luni : data >= acum1an
  }

  function getLaborator(observatii: string) {
    const match = observatii?.match(/Laborator: ([^|]+)/)
    return match ? match[1].trim() : ''
  }

  const pesteTot = analize.filter(a => a.observatii?.includes('Status: peste'))
  const subTot = analize.filter(a => a.observatii?.includes('Status: sub'))

  const peste3luni = pesteTot.filter(a => filtreazaData(a, '3luni'))
  const peste1an = pesteTot.filter(a => filtreazaData(a, '1an'))
  const sub3luni = subTot.filter(a => filtreazaData(a, '3luni'))
  const sub1an = subTot.filter(a => filtreazaData(a, '1an'))

  const pesteLista = tabPeste === '3luni' ? peste3luni : peste1an
  const subLista = tabSub === '3luni' ? sub3luni : sub1an

  const ultimulBuletin = analize[0]

  const s: React.CSSProperties = {fontFamily:'system-ui,-apple-system,sans-serif'}

  return (
    <div style={{...s, background:'#f8f9fa', minHeight:'100vh'}}>

      {/* Topbar */}
      <div style={{background:'white', borderBottom:'0.5px solid #e5e7eb', padding:'0 24px', height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:10}}>
        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
          <div style={{width:'28px', height:'28px', background:'#E1F5EE', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color:'#0F6E56', fontSize:'15px', fontWeight:500}}>✚</div>
          <span style={{fontSize:'16px', fontWeight:500, color:'#111'}}>MedFile</span>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
          <Link href="/panoramic" style={{padding:'6px 10px', borderRadius:'8px', fontSize:'13px', color:'#555', textDecoration:'none'}}>Panoramic</Link>
          <Link href="/urgenta" style={{padding:'6px 10px', borderRadius:'8px', fontSize:'13px', color:'#555', textDecoration:'none'}}>Urgență</Link>
          <Link href="/dosar" style={{padding:'6px 10px', borderRadius:'8px', fontSize:'13px', color:'#555', textDecoration:'none'}}>Dosar</Link>
          <Link href="/upload" style={{padding:'6px 12px', background:'#16705a', color:'white', borderRadius:'8px', fontSize:'13px', fontWeight:500, textDecoration:'none'}}>+ Adaugă</Link>
          <div style={{position:'relative', marginLeft:'4px'}}>
            <span style={{fontSize:'13px', color:'#111', fontWeight:500, cursor:'pointer'}}>{username} ▾</span>
          </div>
        </div>
      </div>

      <div style={{maxWidth:'960px', margin:'0 auto', padding:'24px'}}>

        {/* 2 butoane mari */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'24px'}}>
          <Link href="/panoramic" style={{textDecoration:'none', background:'white', border:'1.5px solid #16705a', borderRadius:'12px', padding:'24px', display:'flex', flexDirection:'column', alignItems:'center', gap:'10px', cursor:'pointer'}}>
            <div style={{width:'48px', height:'48px', borderRadius:'10px', background:'#E1F5EE', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', color:'#0F6E56'}}>📊</div>
            <div style={{fontSize:'16px', fontWeight:500, color:'#111'}}>Panoramic</div>
            <div style={{fontSize:'13px', color:'#888', textAlign:'center'}}>Toate analizele tale cross-laborator vizualizate în timp</div>
          </Link>
          <Link href="/urgenta" style={{textDecoration:'none', background:'white', border:'1.5px solid #16705a', borderRadius:'12px', padding:'24px', display:'flex', flexDirection:'column', alignItems:'center', gap:'10px', cursor:'pointer'}}>
            <div style={{width:'48px', height:'48px', borderRadius:'10px', background:'#FCEBEB', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', color:'#A32D2D'}}>🚨</div>
            <div style={{fontSize:'16px', fontWeight:500, color:'#111'}}>Urgență</div>
            <div style={{fontSize:'13px', color:'#888', textAlign:'center'}}>Datele tale critice disponibile instant oricui te tratează</div>
          </Link>
        </div>

        {/* Analize anormale */}
        <div style={{fontSize:'11px', fontWeight:500, color:'#aaa', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:'10px'}}>Analize în afara limitelor normale</div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'20px'}}>

          {/* Peste */}
          <div style={{background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', overflow:'hidden'}}>
            <div style={{padding:'12px 16px', background:'#FCEBEB', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
              <span style={{fontSize:'13px', fontWeight:500, color:'#A32D2D'}}>↑ Peste limită</span>
              <span style={{fontSize:'20px', fontWeight:500, color:'#A32D2D'}}>{pesteTot.length}</span>
            </div>
            <div style={{display:'flex', borderBottom:'0.5px solid #e5e7eb'}}>
              {(['3luni', '1an'] as const).map(t => (
                <div key={t} onClick={() => setTabPeste(t)} style={{flex:1, padding:'7px', fontSize:'11px', textAlign:'center', cursor:'pointer', color: tabPeste===t ? '#16705a' : '#aaa', fontWeight: tabPeste===t ? 500 : 400, borderBottom: tabPeste===t ? '2px solid #16705a' : '2px solid transparent'}}>
                  {t === '3luni' ? 'Ultimele 3 luni' : 'Ultimul an'}
                </div>
              ))}
            </div>
            <div style={{maxHeight:'200px', overflowY:'auto'}}>
              {pesteLista.length === 0 ? (
                <div style={{padding:'16px', textAlign:'center', fontSize:'12px', color:'#aaa'}}>Nicio analiză în această perioadă</div>
              ) : pesteLista.map((a, i) => (
                <div key={i} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 16px', borderBottom:'0.5px solid #f0f0f0'}}>
                  <div>
                    <div style={{fontSize:'12px', color:'#111'}}>{a.nume_analiza}</div>
                    <div style={{fontSize:'11px', color:'#aaa'}}>{a.data_analiza} · {getLaborator(a.observatii)}</div>
                  </div>
                  <div style={{fontSize:'12px', fontWeight:500, color:'#A32D2D'}}>{a.tip_rezultat === 'calitativ' ? a.rezultat_text : `${a.valoare} ${a.unitate || ''}`}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sub */}
          <div style={{background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', overflow:'hidden'}}>
            <div style={{padding:'12px 16px', background:'#FAEEDA', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
              <span style={{fontSize:'13px', fontWeight:500, color:'#854F0B'}}>↓ Sub limită</span>
              <span style={{fontSize:'20px', fontWeight:500, color:'#854F0B'}}>{subTot.length}</span>
            </div>
            <div style={{display:'flex', borderBottom:'0.5px solid #e5e7eb'}}>
              {(['3luni', '1an'] as const).map(t => (
                <div key={t} onClick={() => setTabSub(t)} style={{flex:1, padding:'7px', fontSize:'11px', textAlign:'center', cursor:'pointer', color: tabSub===t ? '#16705a' : '#aaa', fontWeight: tabSub===t ? 500 : 400, borderBottom: tabSub===t ? '2px solid #16705a' : '2px solid transparent'}}>
                  {t === '3luni' ? 'Ultimele 3 luni' : 'Ultimul an'}
                </div>
              ))}
            </div>
            <div style={{maxHeight:'200px', overflowY:'auto'}}>
              {subLista.length === 0 ? (
                <div style={{padding:'16px', textAlign:'center', fontSize:'12px', color:'#aaa'}}>Nicio analiză în această perioadă</div>
              ) : subLista.map((a, i) => (
                <div key={i} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 16px', borderBottom:'0.5px solid #f0f0f0'}}>
                  <div>
                    <div style={{fontSize:'12px', color:'#111'}}>{a.nume_analiza}</div>
                    <div style={{fontSize:'11px', color:'#aaa'}}>{a.data_analiza} · {getLaborator(a.observatii)}</div>
                  </div>
                  <div style={{fontSize:'12px', fontWeight:500, color:'#854F0B'}}>{a.tip_rezultat === 'calitativ' ? a.rezultat_text : `${a.valoare} ${a.unitate || ''}`}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom 3 carduri */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px'}}>
          <div style={{background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', padding:'16px'}}>
            <div style={{fontSize:'11px', color:'#aaa', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.5px'}}>Ultimul buletin</div>
            {ultimulBuletin ? (
              <>
                <div style={{fontSize:'14px', fontWeight:500, color:'#111'}}>{getLaborator(ultimulBuletin.observatii) || 'Necunoscut'}</div>
                <div style={{fontSize:'12px', color:'#888', marginTop:'3px'}}>{ultimulBuletin.data_analiza}</div>
              </>
            ) : (
              <div style={{fontSize:'13px', color:'#aaa'}}>Niciun buletin încă</div>
            )}
          </div>

          <Link href="/dosar" style={{textDecoration:'none', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', padding:'16px', display:'block'}}>
            <div style={{fontSize:'11px', color:'#aaa', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.5px'}}>Dosar urgență</div>
            <div style={{fontSize:'14px', fontWeight:500, color:'#111'}}>65% complet</div>
            <div style={{fontSize:'12px', color:'#888', marginTop:'3px'}}>Apasă pentru a completa</div>
            <div style={{height:'4px', background:'#e5e7eb', borderRadius:'2px', overflow:'hidden', marginTop:'8px'}}>
              <div style={{height:'100%', width:'65%', background:'#16705a', borderRadius:'2px'}}></div>
            </div>
          </Link>

          <div style={{background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', padding:'16px'}}>
            <div style={{fontSize:'11px', color:'#aaa', marginBottom:'10px', textTransform:'uppercase', letterSpacing:'0.5px'}}>Acțiuni rapide</div>
            <div style={{display:'flex', gap:'8px'}}>
              <Link href="/export" style={{flex:1, padding:'8px', background:'#f8f9fa', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'12px', color:'#555', textDecoration:'none', textAlign:'center'}}>↓ Export</Link>
              <Link href="/upload" style={{flex:1, padding:'8px', background:'#f8f9fa', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'12px', color:'#555', textDecoration:'none', textAlign:'center'}}>↑ Adaugă</Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}