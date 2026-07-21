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
        <Link href="/" style={{textDecoration:'none', display:'flex', flexDirection:'column'}}>
          <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
            <div style={{width:'26px', height:'26px', background:'#E1F5EE', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color:'#16705a', fontSize:'14px', fontWeight:500}}>✚</div>
            <span style={{fontSize:'18px', fontWeight:500, color:'#111'}}>Panoramic MedLog</span>
          </div>
          <span style={{fontSize:'11px', color:'#888', marginLeft:'34px', marginTop:'1px'}}>Dosar medical agregat</span>
        </Link>
      </div>

      {/* Form */}
      <div style={{flex:1, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'3rem 2rem 2rem'}}>
        <div style={{background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', padding:'2.5rem', width:'100%', maxWidth:'440px'}}>

          <h1 style={{fontSize:'28px', fontWeight:500, color:'#111', marginBottom:'2rem', textAlign:'center'}}>Login</h1>

          <div style={{marginBottom:'16px'}}>
            <label style={{display:'block', marginBottom:'6px', fontSize:'15px', color:'#333', fontWeight:500}}>Adresă email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="email@exemplu.com"
              style={{width:'100%', padding:'12px 14px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'15px', outline:'none', background:'#f8f9fa', color:'#111'}}
            />
          </div>

          <div style={{marginBottom:'8px'}}>
            <label style={{display:'block', marginBottom:'6px', fontSize:'15px', color:'#333', fontWeight:500}}>Parolă</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              style={{width:'100%', padding:'12px 14px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'15px', outline:'none', background:'#f8f9fa', color:'#111'}}
            />
            <div style={{textAlign:'right', marginTop:'8px'}}>
              <button onClick={handleForgotPassword} style={{background:'none', border:'none', color:'#16705a', cursor:'pointer', fontSize:'15px', fontWeight:500, padding:0}}>
                Ai uitat parola?
              </button>
            </div>
          </div>

          {eroare && (
            <p style={{fontSize:'14px', marginBottom:'16px', marginTop:'12px', padding:'10px 14px', borderRadius:'8px',
              background: eroare.includes('trimis') ? '#E1F5EE' : '#FCEBEB',
              color: eroare.includes('trimis') ? '#0F6E56' : '#A32D2D'}}>
              {eroare}
            </p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{width:'100%', padding:'17px', background:'#16705a', color:'white', border:'none', borderRadius:'8px', fontSize:'18px', fontWeight:500, cursor:'pointer', marginTop:'20px', marginBottom:'20px'}}>
            {loading ? 'Se verifică...' : 'Autentificare'}
          </button>

          <p style={{textAlign:'center', fontSize:'15px', color:'#888'}}>
            Nu ai cont?{' '}
            <Link href="/register" style={{color:'#16705a', fontWeight:500}}>Creează cont nou</Link>
          </p>
        </div>
      </div>
    </div>
  )
}