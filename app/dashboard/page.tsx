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

  const normale = analize.filter(a => a.observatii?.includes('normal')).length
  const peste = analize.filter(a => a.observatii?.includes('peste')).length
  const sub = analize.filter(a => a.observatii?.includes('sub')).length

  const initiale = user?.email?.slice(0, 2)?.toUpperCase() || 'MC'

  return (
    <div style={{fontFamily:'system-ui, -apple-system, sans-serif', background:'#f8f9fa', minHeight:'100vh'}}>

      {/* Topbar */}
      <div style={{background:'white', borderBottom:'0.5px solid #e5e7eb', padding:'0 1.5rem', height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:10}}>
        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
          <span style={{fontSize:'18px', color:'#1D9E75'}}>✚</span>
          <span style={{fontSize:'15px', fontWeight:500, color:'#111'}}>MedFile</span>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
          <Link href="/profil" style={{display:'flex', alignItems:'center', gap:'8px', textDecoration:'none'}}>
            <div style={{width:'32px', height:'32px', borderRadius:'50%', background:'#E1F5EE', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:500, color:'#0F6E56'}}>
              {initiale}
            </div>
            <span style={{fontSize:'13px', color:'#555'}}>{user?.email?.split('@')[0]}</span>
          </Link>
          <button onClick={handleLogout} style={{padding:'6px 14px', background:'transparent', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#555', cursor:'pointer'}}>
            Ieșire
          </button>
        </div>
      </div>

      <div style={{maxWidth:'1100px', margin:'0 auto', padding:'2rem 1.5rem'}}>

        {/* Header */}
        <div style={{marginBottom:'1.5rem'}}>
          <h1 style={{fontSize:'20px', fontWeight:500, color:'#111', margin:0}}>Dosarul meu medical</h1>
          <p style={{fontSize:'13px', color:'#888', marginTop:'4px'}}>
            {analize.length > 0 ? `${analize.length} analize înregistrate · ultima actualizare ${analize[0]?.data_analiza}` : 'Nicio analiză înregistrată încă'}
          </p>
        </div>

        {/* Stat cards */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'12px', marginBottom:'1.5rem'}}>
          <div style={{background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', padding:'1rem 1.25rem'}}>
            <div style={{fontSize:'12px', color:'#888', marginBottom:'6px'}}>Total analize</div>
            <div style={{fontSize:'24px', fontWeight:500, color:'#111'}}>{analize.length}</div>
          </div>
          <div style={{background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', padding:'1rem 1.25rem'}}>
            <div style={{fontSize:'12px', color:'#888', marginBottom:'6px'}}>În limite normale</div>
            <div style={{fontSize:'24px', fontWeight:500, color:'#1D9E75'}}>{normale}</div>
          </div>
          <div style={{background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', padding:'1rem 1.25rem'}}>
            <div style={{fontSize:'12px', color:'#888', marginBottom:'6px'}}>Peste limită</div>
            <div style={{fontSize:'24px', fontWeight:500, color:'#E24B4A'}}>{peste}</div>
          </div>
          <div style={{background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', padding:'1rem 1.25rem'}}>
            <div style={{fontSize:'12px', color:'#888', marginBottom:'6px'}}>Sub limită</div>
            <div style={{fontSize:'24px', fontWeight:500, color:'#EF9F27'}}>{sub}</div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{display:'flex', gap:'10px', marginBottom:'1.5rem'}}>
          <Link href="/panoramic" style={{display:'flex', alignItems:'center', gap:'8px', padding:'9px 18px', background:'#1D9E75', color:'white', borderRadius:'8px', textDecoration:'none', fontSize:'13px', fontWeight:500}}>
            ◉ Vizualizare panoramică
          </Link>
          <Link href="/upload" style={{display:'flex', alignItems:'center', gap:'8px', padding:'9px 18px', background:'white', color:'#111', border:'0.5px solid #e5e7eb', borderRadius:'8px', textDecoration:'none', fontSize:'13px'}}>
            ↑ Adaugă analize
          </Link>
          <Link href="/export" style={{display:'flex', alignItems:'center', gap:'8px', padding:'9px 18px', background:'white', color:'#111', border:'0.5px solid #e5e7eb', borderRadius:'8px', textDecoration:'none', fontSize:'13px'}}>
            ↓ Export PDF
          </Link>
        </div>

        {/* Tabel analize */}
        {analize.length === 0 ? (
          <div style={{background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', padding:'3rem', textAlign:'center'}}>
            <div style={{fontSize:'32px', marginBottom:'1rem'}}>📄</div>
            <p style={{fontSize:'15px', fontWeight:500, color:'#111', marginBottom:'8px'}}>Niciun buletin de analize încă</p>
            <p style={{fontSize:'13px', color:'#888', marginBottom:'1.5rem'}}>Uploadează primul PDF și platforma va extrage automat toate valorile</p>
            <Link href="/upload" style={{padding:'10px 20px', background:'#1D9E75', color:'white', borderRadius:'8px', textDecoration:'none', fontSize:'13px'}}>
              Adaugă primul buletin
            </Link>
          </div>
        ) : (
          <div style={{background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', overflow:'hidden'}}>
            <div style={{padding:'12px 16px', borderBottom:'0.5px solid #e5e7eb', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
              <span style={{fontSize:'13px', fontWeight:500, color:'#111'}}>Toate analizele</span>
              <span style={{fontSize:'12px', color:'#888'}}>{analize.length} rezultate</span>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', padding:'8px 16px', background:'#f8f9fa', borderBottom:'0.5px solid #e5e7eb'}}>
              {['Analiză', 'Valoare', 'Data', 'Status'].map(h => (
                <span key={h} style={{fontSize:'11px', color:'#888', fontWeight:500, textTransform:'uppercase', letterSpacing:'0.5px'}}>{h}</span>
              ))}
            </div>
            {analize.map((a, i) => {
              const status = a.observatii?.includes('peste') ? 'peste' : a.observatii?.includes('sub') ? 'sub' : 'normal'
              const statusColor = status === 'normal' ? '#1D9E75' : status === 'peste' ? '#E24B4A' : '#EF9F27'
              const statusBg = status === 'normal' ? '#E1F5EE' : status === 'peste' ? '#FCEBEB' : '#FAEEDA'
              const statusLabel = status === 'normal' ? '✓ Normal' : status === 'peste' ? '↑ Peste' : '↓ Sub'
              return (
                <div key={i} style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', padding:'10px 16px', borderBottom: i < analize.length - 1 ? '0.5px solid #f0f0f0' : 'none', alignItems:'center'}}>
                  <span style={{fontSize:'13px', color:'#111'}}>{a.nume_analiza}</span>
                  <span style={{fontSize:'13px', color:'#111', fontWeight:500}}>{a.tip_rezultat === 'calitativ' ? a.rezultat_text : `${a.valoare} ${a.unitate || ''}`}</span>
                  <span style={{fontSize:'12px', color:'#888'}}>{a.data_analiza}</span>
                  <span style={{display:'inline-flex', padding:'3px 10px', background:statusBg, color:statusColor, borderRadius:'12px', fontSize:'11px', fontWeight:500, width:'fit-content'}}>{statusLabel}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}