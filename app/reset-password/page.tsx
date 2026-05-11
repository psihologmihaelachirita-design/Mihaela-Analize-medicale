'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mesaj, setMesaj] = useState('')
  const [eroare, setEroare] = useState('')
  const router = useRouter()

  async function handleReset() {
    if (!password || password.length < 6) {
      setEroare('Parola trebuie să aibă minim 6 caractere.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setEroare(error.message)
    } else {
      setMesaj('Parola a fost schimbată! Te redirecționăm...')
      setTimeout(() => router.push('/dashboard'), 2000)
    }
    setLoading(false)
  }

  return (
    <main style={{fontFamily:'Arial', maxWidth:'420px', margin:'80px auto', padding:'0 1rem'}}>
      <h1 style={{fontSize:'1.8rem', marginBottom:'0.5rem'}}>Parolă nouă</h1>
      <p style={{color:'#666', marginBottom:'2rem', fontSize:'14px'}}>
        Introdu noua ta parolă
      </p>

      <div style={{marginBottom:'1.5rem'}}>
        <label style={{display:'block', marginBottom:'4px', fontSize:'14px'}}>Parolă nouă</label>
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
        onClick={handleReset}
        disabled={loading}
        style={{width:'100%', padding:'12px', background:'#0070f3', color:'white', border:'none', borderRadius:'6px', fontSize:'16px', cursor:'pointer'}}>
        {loading ? 'Se salvează...' : 'Salvează parola nouă'}
      </button>
    </main>
  )
}