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
    <div style={{fontFamily:'system-ui,-apple-system,sans-serif', minHeight:'100vh', background:'#f8f9fa', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem'}}>
      <div style={{background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', padding:'2.5rem', width:'100%', maxWidth:'420px'}}>

        {/* Logo */}
        <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'2rem'}}>
          <div style={{width:'28px', height:'28px', background:'#E1F5EE', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color:'#16705a', fontSize:'15px', fontWeight:500}}>✚</div>
          <span style={{fontSize:'18px', fontWeight:500, color:'#111'}}>MedFile</span>
        </div>

        {/* Titlu */}
        <h1 style={{fontSize:'26px', fontWeight:500, color:'#111', marginBottom:'2rem'}}>Login</h1>

        {/* Email */}
        <div style={{marginBottom:'16px'}}>
          <label style={{display:'block', marginBottom:'6px', fontSize:'14px', color:'#333', fontWeight:500}}>Adresă email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="email@exemplu.com"
            style={{width:'100%', padding:'11px 14px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'14px', outline:'none', background:'#f8f9fa', color:'#111'}}
          />
        </div>

        {/* Parola */}
        <div style={{marginBottom:'8px'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px'}}>
            <label style={{fontSize:'14px', color:'#333', fontWeight:500}}>Parolă</label>
            <button onClick={handleForgotPassword} style={{background:'none', border:'none', color:'#16705a', cursor:'pointer', fontSize:'13px', fontWeight:500, padding:0}}>
              Ai uitat parola?
            </button>
          </div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="••••••••"
            style={{width:'100%', padding:'11px 14px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'14px', outline:'none', background:'#f8f9fa', color:'#111'}}
          />
        </div>

        {eroare && (
          <p style={{fontSize:'13px', marginBottom:'16px', marginTop:'12px', padding:'10px 14px', borderRadius:'8px',
            background: eroare.includes('trimis') ? '#E1F5EE' : '#FCEBEB',
            color: eroare.includes('trimis') ? '#0F6E56' : '#A32D2D'}}>
            {eroare}
          </p>
        )}

        {/* Buton */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{width:'100%', padding:'16px', background:'#16705a', color:'white', border:'none', borderRadius:'8px', fontSize:'17px', fontWeight:500, cursor:'pointer', marginTop:'20px', marginBottom:'20px'}}>
          {loading ? 'Se verifică...' : 'Autentificare'}
        </button>

        {/* Link register */}
        <p style={{textAlign:'center', fontSize:'14px', color:'#888'}}>
          Nu ai cont?{' '}
          <Link href="/register" style={{color:'#16705a', fontWeight:500}}>Creează cont nou</Link>
        </p>
      </div>
    </div>
  )
}