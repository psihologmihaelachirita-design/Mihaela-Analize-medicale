'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [eroare, setEroare] = useState('')
  const router = useRouter()

  async function handleLogin() {
    setLoading(true)
    setEroare('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setEroare('Email sau parolă incorectă.')
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <main style={{fontFamily:'Arial', maxWidth:'420px', margin:'80px auto', padding:'0 1rem'}}>
      <h1 style={{fontSize:'1.8rem', marginBottom:'0.5rem'}}>Intră în cont</h1>
      <p style={{color:'#666', marginBottom:'2rem'}}>
        Accesează dosarul tău medical
      </p>

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
          placeholder="parola ta"
          style={{width:'100%', padding:'10px', border:'1px solid #ddd', borderRadius:'6px', fontSize:'15px'}}
        />
      </div>

      {eroare && <p style={{color:'red', marginBottom:'1rem', fontSize:'14px'}}>{eroare}</p>}

      <button
        onClick={handleLogin}
        disabled={loading}
        style={{width:'100%', padding:'12px', background:'#0070f3', color:'white', border:'none', borderRadius:'6px', fontSize:'16px', cursor:'pointer'}}
      >
        {loading ? 'Se verifică...' : 'Intră în cont'}
      </button>

      <p style={{textAlign:'center', marginTop:'1rem', fontSize:'14px', color:'#666'}}>
        Nu ai cont?{' '}
        <p style={{textAlign:'center', marginTop:'0.5rem', fontSize:'14px'}}>
  <button onClick={async () => {
    if (!email) { setEroare('Introdu emailul mai întâi.'); return }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://mihaela-analize-medicale.vercel.app/reset-password'
    })
    if (error) setEroare(error.message)
    else setEroare('Email de resetare trimis! Verifică inbox-ul.')
  }} style={{background:'none', border:'none', color:'#0070f3', cursor:'pointer', fontSize:'14px'}}>
    Am uitat parola
  </button>
</p>
<Link href="/register" style={{color:'#0070f3'}}>Creează cont nou</Link>
      </p>
    </main>
  )
}