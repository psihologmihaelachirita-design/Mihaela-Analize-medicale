'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Profil() {
  const [user, setUser] = useState<any>(null)
  const [nume, setNume] = useState('')
  const [varsta, setVarsta] = useState('')
  const [sex, setSex] = useState('')
  const [loading, setLoading] = useState(true)
  const [salvare, setSalvare] = useState(false)
  const [mesaj, setMesaj] = useState('')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      const { data } = await supabase
        .from('profiluri')
        .select('*')
        .eq('id', session.user.id)
        .single()
      if (data) {
        setNume(data.nume || '')
        setVarsta(data.varsta?.toString() || '')
        setSex(data.sex || '')
      }
      setLoading(false)
    })
  }, [])

  async function handleSalvare() {
    setSalvare(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { error } = await supabase
      .from('profiluri')
      .upsert({
        id: session.user.id,
        nume,
        varsta: parseInt(varsta) || null,
        sex
      })

    if (error) {
      setMesaj('Eroare: ' + error.message)
    } else {
      setMesaj('Profil salvat!')
      setTimeout(() => setMesaj(''), 3000)
    }
    setSalvare(false)
  }

  if (loading) return <p style={{fontFamily:'Arial', padding:'2rem'}}>Se încarcă...</p>

  return (
    <main style={{fontFamily:'Arial', maxWidth:'500px', margin:'0 auto', padding:'2rem 1rem'}}>
      <div style={{marginBottom:'2rem'}}>
        <Link href="/dashboard" style={{color:'#0070f3', textDecoration:'none', fontSize:'14px'}}>← Înapoi la dosar</Link>
      </div>

      <h1 style={{fontSize:'1.8rem', marginBottom:'0.5rem'}}>Profilul meu</h1>
      <p style={{color:'#666', marginBottom:'2rem', fontSize:'14px'}}>{user?.email}</p>

      <div style={{marginBottom:'1rem'}}>
        <label style={{display:'block', marginBottom:'4px', fontSize:'14px'}}>Nume complet</label>
        <input
          type="text"
          value={nume}
          onChange={e => setNume(e.target.value)}
          placeholder="Numele tău"
          style={{width:'100%', padding:'10px', border:'1px solid #ddd', borderRadius:'6px', fontSize:'15px'}}
        />
      </div>

      <div style={{marginBottom:'1rem'}}>
        <label style={{display:'block', marginBottom:'4px', fontSize:'14px'}}>Vârstă</label>
        <input
          type="number"
          value={varsta}
          onChange={e => setVarsta(e.target.value)}
          placeholder="ex: 35"
          style={{width:'100%', padding:'10px', border:'1px solid #ddd', borderRadius:'6px', fontSize:'15px'}}
        />
      </div>

      <div style={{marginBottom:'2rem'}}>
        <label style={{display:'block', marginBottom:'8px', fontSize:'14px'}}>Sex</label>
        <div style={{display:'flex', gap:'1rem'}}>
          <label style={{display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontSize:'15px'}}>
            <input type="radio" value="F" checked={sex === 'F'} onChange={e => setSex(e.target.value)} />
            Feminin
          </label>
          <label style={{display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontSize:'15px'}}>
            <input type="radio" value="M" checked={sex === 'M'} onChange={e => setSex(e.target.value)} />
            Masculin
          </label>
        </div>
      </div>

      {mesaj && <p style={{color: mesaj.includes('Eroare') ? 'red' : 'green', marginBottom:'1rem', fontSize:'14px'}}>{mesaj}</p>}

      <button
        onClick={handleSalvare}
        disabled={salvare}
        style={{width:'100%', padding:'12px', background:'#0070f3', color:'white', border:'none', borderRadius:'6px', fontSize:'16px', cursor:'pointer'}}>
        {salvare ? 'Se salvează...' : 'Salvează profil'}
      </button>
    </main>
  )
}