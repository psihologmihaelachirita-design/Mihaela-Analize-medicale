'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nume, setNume] = useState('')
  const [loading, setLoading] = useState(false)
  const [eroare, setEroare] = useState('')
  const [mesaj, setMesaj] = useState('')
  const router = useRouter()

  async function handleRegister() {
    setLoading(true)
    setEroare('')
    setMesaj('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'https://mihaela-analize-medicale.vercel.app/dashboard'
      }
    })
    if (error) {
      setEroare(error.message)
    } else {
      setMesaj('Cont creat! Verifică emailul pentru confirmare.')
    }
    setLoading(false)
  }

  return (
    <div style={{fontFamily:'system-ui,-apple-system,sans-serif', minHeight:'100vh', background:'#f8f9fa', display:'flex', flexDirection:'column'}}>

      {/* Topbar */}
      <div style={{background:'white', borderBottom:'0.5px solid #e5e7eb', padding:'0 24px', height:'52px', display:'flex', alignItems:'center'}}>
        <Link href="/" style={{textDecoration:'none', display:'flex', flexDirection:'column'}}>
          <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
            <div style={{width:'26px', height:'26px', background:'#E1F5EE', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color:'#16705a', fontSize:'14px', fontWeight:500}}>✚</div>
            <span style={{fontSize:'18px', fontWeight:500, color:'#111'}}>MedFile</span>
          </div>
          <span style={{fontSize:'11px', color:'#888', marginLeft:'34px', marginTop:'1px'}}>Dosar medical agregat</span>
        </Link>
      </div>

      {/* Form */}
      <div style={{flex:1, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'3rem 2rem 2rem'}}>
        <div style={{background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', padding:'2.5rem', width:'100%', maxWidth:'440px'}}>

          <h1 style={{fontSize:'28px', fontWeight:500, color:'#111', marginBottom:'2rem', textAlign:'center'}}>Creează cont</h1>

          <div style={{marginBottom:'16px'}}>
            <label style={{display:'block', marginBottom:'6px', fontSize:'15px', color:'#333', fontWeight:500}}>Nume complet</label>
            <input
              type="text"
              value={nume}
              onChange={e => setNume(e.target.value)}
              placeholder="Numele tău"
              style={{width:'100%', padding:'12px 14px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'15px', outline:'none', background:'#f8f9fa', color:'#111'}}
            />
          </div>

          <div style={{marginBottom:'16px'}}>
            <label style={{display:'block', marginBottom:'6px', fontSize:'15px', color:'#333', fontWeight:500}}>Adresă email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRegister()}
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
              onKeyDown={e => e.key === 'Enter' && handleRegister()}
              placeholder="••••••••"
              style={{width:'100%', padding:'12px 14px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'15px', outline:'none', background:'#f8f9fa', color:'#111'}}
            />
          </div>

          {eroare && (
            <p style={{fontSize:'14px', marginBottom:'16px', marginTop:'12px', padding:'10px 14px', borderRadius:'8px', background:'#FCEBEB', color:'#A32D2D'}}>
              {eroare}
            </p>
          )}

          {mesaj && (
            <p style={{fontSize:'14px', marginBottom:'16px', marginTop:'12px', padding:'10px 14px', borderRadius:'8px', background:'#E1F5EE', color:'#0F6E56'}}>
              {mesaj}
            </p>
          )}

          <button
            onClick={handleRegister}
            disabled={loading}
            style={{width:'100%', padding:'17px', background:'#16705a', color:'white', border:'none', borderRadius:'8px', fontSize:'18px', fontWeight:500, cursor:'pointer', marginTop:'20px', marginBottom:'20px'}}>
            {loading ? 'Se creează contul...' : 'Creează cont'}
          </button>

          <p style={{textAlign:'center', fontSize:'15px', color:'#888'}}>
            Ai deja cont?{' '}
            <Link href="/login" style={{color:'#16705a', fontWeight:500}}>Intră în cont</Link>
          </p>
        </div>
      </div>
    </div>
  )
}