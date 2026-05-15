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

  async function handleForgotPassword() {
    if (!email) { setEroare('Introdu emailul mai întâi.'); return }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://mihaela-analize-medicale.vercel.app/reset-password'
    })
    if (error) setEroare(error.message)
    else setEroare('Email de resetare trimis! Verifică inbox-ul.')
  }

  return (
    <div style={{fontFamily:'system-ui,-apple-system,sans-serif', minHeight:'100vh', background:'#f8f9fa', display:'flex', flexDirection:'column'}}>

      {/* Topbar */}
      <div style={{background:'white', borderBottom:'0.5px solid #e5e7eb', padding:'0 24px', height:'52px', display:'flex', alignItems:'center'}}>
        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
          <div style={{width:'26px', height:'26px', background:'#E1F5EE', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color:'#0F6E56', fontSize:'14px', fontWeight:500}}>✚</div>
          <span style={{fontSize:'18px', fontWeight:500, color:'#111'}}>MedFile</span>
        </div>
      </div>

      {/* Form */}
      <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem'}}>
        <div style={{background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', padding:'2rem', width:'100%', maxWidth:'400px'}}>
          <h1 style={{fontSize:'20px', fontWeight:500, color:'#111', marginBottom:'6px'}}>Intră în cont</h1>
          <p style={{fontSize:'13px', color:'#888', marginBottom:'1.5rem'}}>Accesează dosarul tău medical</p>

          <div style={{marginBottom:'1rem'}}>
            <label style={{display:'block', marginBottom:'4px', fontSize:'13px', color:'#555', fontWeight:500}}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@exemplu.com"
              style={{width:'100%', padding:'10px 12px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'14px', outline:'none', background:'#f8f9fa'}}
            />
          </div>

          <div style={{marginBottom:'1.5rem'}}>
            <label style={{display:'block', marginBottom:'4px', fontSize:'13px', color:'#555', fontWeight:500}}>Parolă</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="parola ta"
              style={{width:'100%', padding:'10px 12px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'14px', outline:'none', background:'#f8f9fa'}}
            />
          </div>

          {eroare && (
            <p style={{fontSize:'13px', marginBottom:'1rem', color: eroare.includes('trimis') ? '#1D9E75' : '#E24B4A'}}>
              {eroare}
            </p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{width:'100%', padding:'11px', background:'#1D9E75', color:'white', border:'none', borderRadius:'8px', fontSize:'15px', fontWeight:500, cursor:'pointer', marginBottom:'12px'}}>
            {loading ? 'Se verifică...' : 'Intră în cont'}
          </button>

          <div style={{textAlign:'center', marginBottom:'8px'}}>
            <button onClick={handleForgotPassword} style={{background:'none', border:'none', color:'#0F6E56', cursor:'pointer', fontSize:'13px', fontWeight:500}}>
              Am uitat parola
            </button>
          </div>

          <p style={{textAlign:'center', fontSize:'13px', color:'#888'}}>
            Nu ai cont?{' '}
            <Link href="/register" style={{color:'#0F6E56', fontWeight:500}}>Creează cont nou</Link>
          </p>
        </div>
      </div>
    </div>
  )
}