'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nume, setNume] = useState('')
  const [loading, setLoading] = useState(false)
  const [mesaj, setMesaj] = useState('')
  const [eroare, setEroare] = useState('')

  async function handleRegister() {
    setLoading(true)
    setEroare('')
    setMesaj('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nume_complet: nume } }
    })

    if (error) {
      setEroare(error.message)
    } else {
      setMesaj('Cont creat! Verifică emailul pentru confirmare.')
    }
    setLoading(false)
  }

  return (
    <main style={{fontFamily:'Arial', maxWidth:'420px', margin:'80px auto', padding:'0 1rem'}}>
      <h1 style={{fontSize:'1.8rem', marginBottom:'0.5rem'}}>Cont nou</h1>
      <p style={{color:'#666', marginBottom:'2rem'}}>
        Creează-ți dosarul medical personal
      </p>

      <div style={{marginBottom:'1rem'}}>
        <label style={{display:'block', marginBottom:'4px', fontSize:'14px'}}>Nume complet</label>
        <input
          type="text"
          value={nume}
          onChange={e => setNume(e.target.value)}
          placeholder="ex: Maria Ionescu"
          style={{width:'100%', padding:'10px', border:'1px solid #ddd', borderRadius:'6px', fontSize:'15px'}}
        />
      </div>

      <div style={{marginBottom:'1rem'}}>
        <label style={{display:'block', marginBottom:'4px', fontSize:'14px'}}>Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="email@exemplu.com"
          style={{width:'100%', padding:'10px', border:'1px solid #ddd', borderRadius:'6px', fontSize:'15px'}}
        />
      </div>

      <div style={{marginBottom:'1.5rem'}}>
        <label style={{display:'block', marginBottom:'4px', fontSize:'14px'}}>Parolă</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="minimum 6 caractere"
          style={{width:'100%', padding:'10px', border:'1px solid #ddd', borderRadius:'6px', fontSize:'15px'}}
        />
      </div>

      {eroare && <p style={{color:'red', marginBottom:'1rem', fontSize:'14px'}}>{eroare}</p>}
      {mesaj && <p style={{color:'green', marginBottom:'1rem', fontSize:'14px'}}>{mesaj}</p>}

      <button
        onClick={handleRegister}
        disabled={loading}
        style={{width:'100%', padding:'12px', background:'#0070f3', color:'white', border:'none', borderRadius:'6px', fontSize:'16px', cursor:'pointer'}}
      >
        {loading ? 'Se creează contul...' : 'Creează cont'}
      </button>

      <p style={{textAlign:'center', marginTop:'1rem', fontSize:'14px', color:'#666'}}>
        Ai deja cont?{' '}
        <Link href="/login" style={{color:'#0070f3'}}>Intră în cont</Link>
      </p>
    </main>
  )
}
