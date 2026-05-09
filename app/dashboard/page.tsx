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
      if (!session) {
        router.push('/login')
        return
      }
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

  if (loading) return <p style={{fontFamily:'Arial', padding:'2rem'}}>Se încarcă...</p>

  const normale = analize.filter(a => a.observatii?.includes('normal')).length
  const peste = analize.filter(a => a.observatii?.includes('peste')).length

  return (
    <main style={{fontFamily:'Arial', maxWidth:'900px', margin:'0 auto', padding:'2rem 1rem'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem', paddingBottom:'1rem', borderBottom:'1px solid #eee'}}>
        <div>
          <h1 style={{fontSize:'1.5rem', margin:0}}>🏥 Dosarul meu medical</h1>
          <p style={{color:'#666', margin:'4px 0 0', fontSize:'14px'}}>{user?.email}</p>
        </div>
        <button onClick={handleLogout} style={{padding:'8px 16px', background:'#fff', border:'1px solid #ddd', borderRadius:'6px', cursor:'pointer', fontSize:'14px'}}>
          Ieșire
        </button>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'1rem', marginBottom:'2rem'}}>
        <div style={{background:'#f0f7ff', borderRadius:'8px', padding:'1.5rem', textAlign:'center'}}>
          <div style={{fontSize:'2rem', fontWeight:'bold', color:'#0070f3'}}>{analize.length}</div>
          <div style={{fontSize:'14px', color:'#666', marginTop:'4px'}}>Analize înregistrate</div>
        </div>
        <div style={{background:'#f0fff4', borderRadius:'8px', padding:'1.5rem', textAlign:'center'}}>
          <div style={{fontSize:'2rem', fontWeight:'bold', color:'#00a854'}}>{normale}</div>
          <div style={{fontSize:'14px', color:'#666', marginTop:'4px'}}>În limite normale</div>
        </div>
        <div style={{background:'#fff7f0', borderRadius:'8px', padding:'1.5rem', textAlign:'center'}}>
          <div style={{fontSize:'2rem', fontWeight:'bold', color:'#f5222d'}}>{peste}</div>
          <div style={{fontSize:'14px', color:'#666', marginTop:'4px'}}>Peste limite</div>
        </div>
      </div>

      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
        <h2 style={{fontSize:'1.2rem', margin:0}}>Analizele mele</h2>
        <div style={{display:'flex', gap:'10px'}}>
          <Link href="/panoramic" style={{padding:'10px 20px', background:'#1D9E75', color:'white', borderRadius:'6px', textDecoration:'none', fontSize:'14px'}}>
            📊 Panoramic
          </Link>
          <Link href="/upload" style={{padding:'10px 20px', background:'#0070f3', color:'white', borderRadius:'6px', textDecoration:'none', fontSize:'14px'}}>
            + Adaugă analize
          </Link>
        </div>
      </div>

      {analize.length === 0 ? (
        <div style={{background:'#fafafa', borderRadius:'8px', padding:'3rem', textAlign:'center', border:'2px dashed #ddd'}}>
          <div style={{fontSize:'3rem', marginBottom:'1rem'}}>📄</div>
          <h2 style={{fontSize:'1.2rem', marginBottom:'0.5rem'}}>Niciun buletin de analize încă</h2>
          <p style={{color:'#666', marginBottom:'1.5rem', fontSize:'14px'}}>Uploadează primul tău PDF și platforma va extrage automat toate valorile</p>
          <Link href="/upload" style={{padding:'12px 24px', background:'#0070f3', color:'white', borderRadius:'6px', textDecoration:'none', fontSize:'15px'}}>
            + Adaugă analize
          </Link>
        </div>
      ) : (
        <div style={{border:'1px solid #eee', borderRadius:'8px', overflow:'hidden'}}>
          <div style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', background:'#f5f5f5', padding:'10px 16px', fontSize:'13px', fontWeight:'500', color:'#555'}}>
            <span>Analiză</span><span>Valoare</span><span>Data</span><span>Status</span>
          </div>
          {analize.map((a, i) => {
            const status = a.observatii?.includes('peste') ? 'peste' : a.observatii?.includes('sub') ? 'sub' : 'normal'
            return (
              <div key={i} style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', padding:'10px 16px', fontSize:'14px', borderTop:'1px solid #eee', background: i % 2 === 0 ? 'white' : '#fafafa'}}>
                <span>{a.nume_analiza}</span>
                <span style={{fontWeight:'500'}}>{a.valoare} {a.unitate}</span>
                <span style={{color:'#666'}}>{a.data_analiza}</span>
                <span style={{color: status === 'normal' ? '#00a854' : status === 'peste' ? '#f5222d' : '#fa8c16', fontWeight:'500'}}>
                  {status === 'normal' ? '✓ Normal' : status === 'peste' ? '↑ Peste' : '↓ Sub'}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}