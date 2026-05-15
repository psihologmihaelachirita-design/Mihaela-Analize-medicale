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
    if (!password || password.length < 6) { setEroare('Parola trebuie să aibă minim 6 caractere.'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setEroare(error.message)
    else { setMesaj('Parola a fost schimbată!'); setTimeout(() => router.push('/dashboard'), 2000) }
    setLoading(false)
  }

  return (
    <div style={{fontFamily:'system-ui,-apple-system,sans-serif', minHeight:'100vh', background:'#f8f9fa', display:'flex', flexDirection:'column'}}>
      <div style={{background:'white', borderBottom:'0.5px solid #e5e7eb', padding:'0 24px', height:'52px', display:'flex', alignItems:'center'}}>
        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
          <div style={{width:'26px', height:'26px', background:'#E1F5EE', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color:'#0F6E56', fontSize:'14px', fontWeight:500}}>✚</div>
          <span style={{fontSize:'18px', fontWeight:500, color:'#111'}}>MedFile</span>
        </div>
      </div>

      <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem'}}>
        <div style={{background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', padding:'2rem', width:'100%', maxWidth:'400px'}}>
          <h1 style={{fontSize:'20px', fontWeight:500, color:'#111', marginBottom:'6px'}}>Parolă nouă</h1>
          <p style={{fontSize:'13px', color:'#888', marginBottom:'1.5rem'}}>Introdu noua ta parolă</p>

          <div style={{marginBottom:'1.5rem'}}>
            <label style={{display:'block', marginBottom:'4px', fontSize:'13px', color:'#555', fontWeight:500}}>Parolă nouă</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="minimum 6 caractere"
              style={{width:'100%', padding:'10px 12px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'14px', outline:'none', background:'#f8f9fa'}} />
          </div>

          {eroare && <p style={{color:'#E24B4A', marginBottom:'1rem', fontSize:'13px'}}>{eroare}</p>}
          {mesaj && <p style={{color:'#1D9E75', marginBottom:'1rem', fontSize:'13px', fontWeight:500}}>{mesaj}</p>}

          <button onClick={handleReset} disabled={loading}
            style={{width:'100%', padding:'11px', background:'#1D9E75', color:'white', border:'none', borderRadius:'8px', fontSize:'15px', fontWeight:500, cursor:'pointer'}}>
            {loading ? 'Se salvează...' : 'Salvează parola nouă'}
          </button>
        </div>
      </div>
    </div>
  )
}