'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [eroare, setEroare] = useState('')
  const [mesaj, setMesaj] = useState('')
  const router = useRouter()

  async function handleLogin() {
    setLoading(true)
    setEroare('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setEroare('Email sau parolă incorectă.')
      setLoading(false)
      return
    }
    const { data: factors } = await supabase.auth.mfa.listFactors()
    if (factors?.totp && factors.totp.length > 0) {
      const factor = factors.totp[0]
      const cod = prompt('Introdu codul din Google Authenticator:')
      if (cod) {
        const { data: challenge } = await supabase.auth.mfa.challenge({ factorId: factor.id })
        if (challenge) {
          const { error: verifyError } = await supabase.auth.mfa.verify({ factorId: factor.id, challengeId: challenge.id, code: cod })
          if (verifyError) { setEroare('Cod incorect.'); setLoading(false); return }
        }
      } else {
        setEroare('Cod necesar.')
        setLoading(false)
        return
      }
    }
    router.push('/dashboard')
    setLoading(false)
  }

  async function handleForgotPassword() {
    if (!email) { setEroare('Introdu emailul mai întâi.'); return }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://mihaela-analize-medicale.vercel.app/reset-password'
    })
    if (error) setEroare('Eroare: ' + error.message)
    else setMesaj('Email de resetare trimis! Verifică inbox-ul.')
    setTimeout(() => setMesaj(''), 5000)
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8f9fa', fontFamily:'system-ui' }}>
      <div style={{ background:'white', borderRadius:'16px', padding:'40px', width:'420px', maxWidth:'90vw', boxShadow:'0 4px 24px rgba(0,0,0,0.08)', border:'0.5px solid #e5e7eb' }}>
        <div style={{ textAlign:'center', marginBottom:'28px' }}>
          <div style={{ width:'44px', height:'44px', background:'#E1F5EE', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', color:'#0F6E56', fontSize:'20px', fontWeight:600 }}>✚</div>
          <div style={{ fontSize:'22px', fontWeight:600, color:'#111' }}>Panoramic MedLog</div>
          <div style={{ fontSize:'14px', color:'#888', marginTop:'4px' }}>Autentifică-te în cont</div>
        </div>

        {eroare && <div style={{ padding:'12px 14px', background:'#FCEBEB', color:'#A32D2D', borderRadius:'8px', fontSize:'14px', marginBottom:'16px' }}>{eroare}</div>}
        {mesaj && <div style={{ padding:'12px 14px', background:'#E1F5EE', color:'#0F6E56', borderRadius:'8px', fontSize:'14px', marginBottom:'16px' }}>{mesaj}</div>}

        <div style={{ marginBottom:'16px' }}>
          <label style={{ display:'block', marginBottom:'6px', fontSize:'14px', color:'#333', fontWeight:500 }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="email@exemplu.com"
            style={{ width:'100%', padding:'12px 14px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'15px', outline:'none', background:'#f8f9fa', color:'#111', boxSizing:'border-box' as const }} />
        </div>

        <div style={{ marginBottom:'8px' }}>
          <label style={{ display:'block', marginBottom:'6px', fontSize:'14px', color:'#333', fontWeight:500 }}>Parolă</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Parola ta"
            style={{ width:'100%', padding:'12px 14px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'15px', outline:'none', background:'#f8f9fa', color:'#111', boxSizing:'border-box' as const }} />
        </div>

        <div style={{ textAlign:'right', marginBottom:'20px' }}>
          <span onClick={handleForgotPassword} style={{ fontSize:'13px', color:'#16705a', cursor:'pointer', fontWeight:500 }}>
            Am uitat parola
          </span>
        </div>

        <button onClick={handleLogin} disabled={loading}
          style={{ width:'100%', padding:'13px', background:'#16705a', color:'white', border:'none', borderRadius:'8px', fontSize:'16px', fontWeight:600, cursor:'pointer' }}>
          {loading ? 'Se autentifică...' : 'Autentifică-te'}
        </button>

        <div style={{ textAlign:'center', marginTop:'20px', fontSize:'14px', color:'#888' }}>
          Nu ai cont? <Link href="/register" style={{ color:'#16705a', fontWeight:500 }}>Creează unul</Link>
        </div>
      </div>
    </div>
  )
}