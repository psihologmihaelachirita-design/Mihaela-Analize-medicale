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
    <div style={{fontFamily:'system-ui,-apple-system,sans-serif', minHeight:'100vh', display:'flex'}}>

      {/* Stanga - brand */}
      <div style={{width:'45%', background:'#16705a', display:'flex', flexDirection:'column', justifyContent:'center', padding:'3rem', position:'relative', overflow:'hidden'}}>
        <div style={{position:'absolute', top:'-80px', right:'-80px', width:'300px', height:'300px', borderRadius:'50%', background:'rgba(255,255,255,0.04)'}}></div>
        <div style={{position:'absolute', bottom:'-60px', left:'-60px', width:'200px', height:'200px', borderRadius:'50%', background:'rgba(255,255,255,0.04)'}}></div>

        <div style={{position:'relative', zIndex:1}}>
          <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'3rem'}}>
            <div style={{width:'36px', height:'36px', background:'rgba(255,255,255,0.15)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'18px', fontWeight:500}}>✚</div>
            <span style={{fontSize:'22px', fontWeight:500, color:'white'}}>MedFile</span>
          </div>

          <h2 style={{fontSize:'28px', fontWeight:500, color:'white', lineHeight:1.3, marginBottom:'1rem'}}>
            Dosarul tău medical,<br/>mereu la îndemână
          </h2>
          <p style={{fontSize:'15px', color:'rgba(255,255,255,0.75)', lineHeight:1.7, marginBottom:'2.5rem'}}>
            Toate analizele tale din orice laborator, vizualizate panoramic cu evoluție în timp.
          </p>

          <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
            {[
              'Extragere automată din PDF',
              'Vizualizare panoramică unică',
              'Date securizate în Europa',
            ].map((f, i) => (
              <div key={i} style={{display:'flex', alignItems:'center', gap:'10px'}}>
                <div style={{width:'20px', height:'20px', borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', color:'white', flexShrink:0}}>✓</div>
                <span style={{fontSize:'14px', color:'rgba(255,255,255,0.85)'}}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dreapta - form */}
      <div style={{flex:1, background:'#f8f9fa', display:'flex', alignItems:'center', justifyContent:'center', padding:'3rem'}}>
        <div style={{width:'100%', maxWidth:'380px'}}>
          <h1 style={{fontSize:'22px', fontWeight:500, color:'#111', marginBottom:'6px'}}>Bine ai revenit</h1>
          <p style={{fontSize:'14px', color:'#888', marginBottom:'2rem'}}>Intră în contul tău MedFile</p>

          <div style={{marginBottom:'16px'}}>
            <label style={{display:'block', marginBottom:'6px', fontSize:'13px', color:'#333', fontWeight:500}}>Adresă email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="email@exemplu.com"
              style={{width:'100%', padding:'11px 14px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'14px', outline:'none', background:'white', color:'#111'}}
            />
          </div>

          <div style={{marginBottom:'8px'}}>
            <label style={{display:'block', marginBottom:'6px', fontSize:'13px', color:'#333', fontWeight:500}}>Parolă</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              style={{width:'100%', padding:'11px 14px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'14px', outline:'none', background:'white', color:'#111'}}
            />
          </div>

          <div style={{textAlign:'right', marginBottom:'20px'}}>
            <button onClick={handleForgotPassword} style={{background:'none', border:'none', color:'#16705a', cursor:'pointer', fontSize:'13px', fontWeight:500}}>
              Am uitat parola
            </button>
          </div>

          {eroare && (
            <p style={{fontSize:'13px', marginBottom:'16px', padding:'10px 14px', borderRadius:'8px', background: eroare.includes('trimis') ? '#E1F5EE' : '#FCEBEB', color: eroare.includes('trimis') ? '#0F6E56' : '#A32D2D'}}>
              {eroare}
            </p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{width:'100%', padding:'12px', background:'#16705a', color:'white', border:'none', borderRadius:'8px', fontSize:'15px', fontWeight:500, cursor:'pointer', marginBottom:'16px'}}>
            {loading ? 'Se verifică...' : 'Intră în cont'}
          </button>

          <p style={{textAlign:'center', fontSize:'13px', color:'#888'}}>
            Nu ai cont?{' '}
            <Link href="/register" style={{color:'#16705a', fontWeight:500}}>Creează cont nou</Link>
          </p>
        </div>
      </div>
    </div>
  )
}