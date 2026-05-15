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
    const { error } = await supabase.from('profiluri').upsert({
      id: session.user.id,
      nume,
      varsta: parseInt(varsta) || null,
      sex
    })
    if (error) setMesaj('Eroare: ' + error.message)
    else { setMesaj('Profil salvat!'); setTimeout(() => setMesaj(''), 3000) }
    setSalvare(false)
  }

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontFamily:'system-ui'}}>
      <p style={{color:'#888',fontSize:'14px'}}>Se încarcă...</p>
    </div>
  )

  return (
    <div style={{fontFamily:'system-ui,-apple-system,sans-serif', background:'#f8f9fa', minHeight:'100vh'}}>

      {/* Topbar */}
      <div style={{background:'white', borderBottom:'0.5px solid #e5e7eb', padding:'0 24px', height:'52px', display:'flex', alignItems:'center', gap:'16px'}}>
        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
          <div style={{width:'26px', height:'26px', background:'#E1F5EE', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color:'#0F6E56', fontSize:'14px', fontWeight:500}}>✚</div>
          <span style={{fontSize:'18px', fontWeight:500, color:'#111'}}>MedFile</span>
        </div>
        <span style={{color:'#e5e7eb'}}>|</span>
        <Link href="/dashboard" style={{color:'#0F6E56', textDecoration:'none', fontSize:'14px', fontWeight:500}}>← Dosar</Link>
      </div>

      <div style={{maxWidth:'500px', margin:'0 auto', padding:'2rem 1.5rem'}}>
        <h1 style={{fontSize:'20px', fontWeight:500, color:'#111', marginBottom:'4px'}}>Profilul meu</h1>
        <p style={{fontSize:'13px', color:'#888', marginBottom:'2rem'}}>{user?.email}</p>

        <div style={{background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', padding:'1.5rem'}}>

          <div style={{marginBottom:'1rem'}}>
            <label style={{display:'block', marginBottom:'4px', fontSize:'13px', color:'#555', fontWeight:500}}>Nume complet</label>
            <input
              type="text"
              value={nume}
              onChange={e => setNume(e.target.value)}
              placeholder="Numele tău"
              style={{width:'100%', padding:'10px 12px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'14px', outline:'none', background:'#f8f9fa'}}
            />
          </div>

          <div style={{marginBottom:'1rem'}}>
            <label style={{display:'block', marginBottom:'4px', fontSize:'13px', color:'#555', fontWeight:500}}>Vârstă</label>
            <input
              type="number"
              value={varsta}
              onChange={e => setVarsta(e.target.value)}
              placeholder="ex: 35"
              style={{width:'100%', padding:'10px 12px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'14px', outline:'none', background:'#f8f9fa'}}
            />
          </div>

          <div style={{marginBottom:'1.5rem'}}>
            <label style={{display:'block', marginBottom:'8px', fontSize:'13px', color:'#555', fontWeight:500}}>Sex</label>
            <div style={{display:'flex', gap:'12px'}}>
              {[{val:'F', label:'Feminin'}, {val:'M', label:'Masculin'}].map(opt => (
                <label key={opt.val} style={{display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontSize:'14px', color:'#111'}}>
                  <input type="radio" value={opt.val} checked={sex === opt.val} onChange={e => setSex(e.target.value)} />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {mesaj && (
            <p style={{fontSize:'13px', marginBottom:'1rem', color: mesaj.includes('Eroare') ? '#E24B4A' : '#1D9E75', fontWeight:500}}>
              {mesaj}
            </p>
          )}

          <button
            onClick={handleSalvare}
            disabled={salvare}
            style={{width:'100%', padding:'11px', background:'#1D9E75', color:'white', border:'none', borderRadius:'8px', fontSize:'15px', fontWeight:500, cursor:'pointer'}}>
            {salvare ? 'Se salvează...' : 'Salvează profil'}
          </button>
        </div>
      </div>
    </div>
  )
}