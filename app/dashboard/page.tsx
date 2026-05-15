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
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontFamily:'system-ui'}}>
      <p style={{color:'#888',fontSize:'14px'}}>Se încarcă...</p>
    </div>
  )

  const normale = analize.filter(a => a.observatii?.includes('normal')).length
  const peste = analize.filter(a => a.observatii?.includes('peste')).length
  const sub = analize.filter(a => a.observatii?.includes('sub')).length
  const initiale = user?.email?.slice(0,2)?.toUpperCase() || 'MC'
  const username = user?.email?.split('@')[0]

  return (
    <div style={{fontFamily:'system-ui,-apple-system,sans-serif',background:'#f8f9fa',minHeight:'100vh'}}>

      {/* Topbar */}
      <div style={{background:'white',borderBottom:'0.5px solid #e5e7eb',padding:'0 24px',height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:10}}>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <div style={{width:'28px',height:'28px',background:'#E1F5EE',borderRadius:'6px',display:'flex',alignItems:'center',justifyContent:'center',color:'#0F6E56',fontSize:'15px',fontWeight:500}}>✚</div>
          <span style={{fontSize:'18px',fontWeight:500,color:'#111'}}>MedFile</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'#E1F5EE',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:500,color:'#0F6E56'}}>{initiale}</div>
          <span style={{fontSize:'14px',color:'#111',fontWeight:500}}>{username}</span>
          <Link href="/profil" style={{padding:'8px 16px',background:'transparent',border:'0.5px solid #e5e7eb',borderRadius:'8px',fontSize:'14px',color:'#111',textDecoration:'none',fontWeight:500}}>Profil</Link>
          <button onClick={handleLogout} style={{padding:'8px 16px',background:'transparent',border:'0.5px solid #e5e7eb',borderRadius:'8px',fontSize:'14px',color:'#111',cursor:'pointer',fontWeight:500}}>Ieșire</button>
        </div>
      </div>

      <div style={{maxWidth:'900px',margin:'0 auto',padding:'24px'}}>

        <h1 style={{fontSize:'22px',fontWeight:500,color:'#111',margin:'0 0 4px'}}>Dosarul meu medical</h1>
        <p style={{fontSize:'13px',color:'#888',marginBottom:'20px'}}>
          {analize.length > 0 ? `${analize.length} analize înregistrate · ultima actualizare ${analize[0]?.data_analiza}` : 'Nicio analiză înregistrată încă'}
        </p>

        {/* Statistici */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px',marginBottom:'20px'}}>
          {[
            {label:'Total analize', val:analize.length, color:'#111'},
            {label:'În limite normale', val:normale, color:'#1D9E75'},
            {label:'Peste limită', val:peste, color:'#E24B4A'},
            {label:'Sub limită', val:sub, color:'#EF9F27'},
          ].map((s,i) => (
            <div key={i} style={{background:'white',border:'0.5px solid #e5e7eb',borderRadius:'10px',padding:'14px'}}>
              <div style={{fontSize:'12px',color:'#888',marginBottom:'6px'}}>{s.label}</div>
              <div style={{fontSize:'24px',fontWeight:500,color:s.color}}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* Actiuni */}
        <div style={{display:'flex',gap:'10px',marginBottom:'20px'}}>
          <Link href="/panoramic" style={{display:'flex',alignItems:'center',gap:'8px',padding:'11px 22px',background:'#1D9E75',color:'white',borderRadius:'8px',fontSize:'15px',fontWeight:500,textDecoration:'none'}}>
            ◉ Vizualizare panoramică
          </Link>
          <Link href="/upload" style={{display:'flex',alignItems:'center',gap:'8px',padding:'11px 22px',background:'white',border:'0.5px solid #e5e7eb',borderRadius:'8px',fontSize:'15px',color:'#0F6E56',textDecoration:'none',fontWeight:500}}>
            ↑ Adaugă analize
          </Link>
          <Link href="/export" style={{display:'flex',alignItems:'center',gap:'8px',padding:'11px 22px',background:'white',border:'0.5px solid #e5e7eb',borderRadius:'8px',fontSize:'15px',color:'#0F6E56',textDecoration:'none',fontWeight:500}}>
            ↓ Export PDF
          </Link>
        </div>

        {/* Tabel */}
        {analize.length === 0 ? (
          <div style={{background:'white',border:'0.5px solid #e5e7eb',borderRadius:'10px',padding:'3rem',textAlign:'center'}}>
            <div style={{fontSize:'32px',marginBottom:'12px'}}>📄</div>
            <p style={{fontSize:'15px',fontWeight:500,color:'#111',marginBottom:'8px'}}>Niciun buletin de analize încă</p>
            <p style={{fontSize:'13px',color:'#888',marginBottom:'16px'}}>Uploadează primul PDF și platforma va extrage automat toate valorile</p>
            <Link href="/upload" style={{padding:'10px 20px',background:'#1D9E75',color:'white',borderRadius:'8px',textDecoration:'none',fontSize:'14px'}}>Adaugă primul buletin</Link>
          </div>
        ) : (
          <div style={{background:'white',border:'0.5px solid #e5e7eb',borderRadius:'10px',overflow:'hidden'}}>
            <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',padding:'10px 16px',background:'#f8f9fa',borderBottom:'0.5px solid #e5e7eb'}}>
              {['Analiză','Valoare','Data','Status'].map(h => (
                <span key={h} style={{fontSize:'11px',color:'#888',fontWeight:500,textTransform:'uppercase',letterSpacing:'0.5px'}}>{h}</span>
              ))}
            </div>
            {analize.map((a,i) => {
              const status = a.observatii?.includes('peste') ? 'peste' : a.observatii?.includes('sub') ? 'sub' : 'normal'
              const badgeBg = status==='normal'?'#E1F5EE':status==='peste'?'#FCEBEB':'#FAEEDA'
              const badgeColor = status==='normal'?'#085041':status==='peste'?'#A32D2D':'#854F0B'
              const badgeLabel = status==='normal'?'✓ Normal':status==='peste'?'↑ Peste':'↓ Sub'
              const valoare = a.tip_rezultat==='calitativ' ? a.rezultat_text : `${a.valoare} ${a.unitate||''}`
              return (
                <div key={i} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',padding:'11px 16px',borderBottom:i<analize.length-1?'0.5px solid #f0f0f0':'none',alignItems:'center'}}>
                  <span style={{fontSize:'13px',color:'#111'}}>{a.nume_analiza}</span>
                  <span style={{fontSize:'13px',fontWeight:500,color:'#111'}}>{valoare}</span>
                  <span style={{fontSize:'13px',color:'#888'}}>{a.data_analiza}</span>
                  <span style={{display:'inline-flex',padding:'3px 10px',background:badgeBg,color:badgeColor,borderRadius:'12px',fontSize:'12px',fontWeight:500,width:'fit-content'}}>{badgeLabel}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}