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
    if (error) setEroare(error.message)
    else setMesaj('Cont creat! Verifică emailul pentru confirmare.')
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
          <h1 style={{fontSize:'20px', fontWeight:500, color:'#111', marginBottom:'6px'}}>Cont nou</h1>
          <p style={{fontSize:'13px', color:'#888', marginBottom:'1.5rem'}}>Creează-ți dosarul medical personal</p>

          <div style={{marginBottom:'1rem'}}>
            <label style={{display:'block', marginBottom:'4px', fontSize:'13px', color:'#555', fontWeight:500}}>Nume complet</label>
            <input type="text" value={nume} onChange={e => setNume(e.target.value)} placeholder="ex: Maria Ionescu"
              style={{width:'100%', padding:'10px 12px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'14px', outline:'none', background:'#f8f9fa'}} />
          </div>

          <div style={{marginBottom:'1rem'}}>
            <label style={{display:'block', marginBottom:'4px', fontSize:'13px', color:'#555', fontWeight:500}}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemplu.com"
              style={{width:'100%', padding:'10px 12px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'14px', outline:'none', background:'#f8f9fa'}} />
          </div>

          <div style={{marginBottom:'1.5rem'}}>
            <label style={{display:'block', marginBottom:'4px', fontSize:'13px', color:'#555', fontWeight:500}}>Parolă</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="minimum 6 caractere"
              style={{width:'100%', padding:'10px 12px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'14px', outline:'none', background:'#f8f9fa'}} />
          </div>

          {eroare && <p style={{color:'#E24B4A', marginBottom:'1rem', fontSize:'13px'}}>{eroare}</p>}
          {mesaj && <p style={{color:'#1D9E75', marginBottom:'1rem', fontSize:'13px', fontWeight:500}}>{mesaj}</p>}

          <button onClick={handleRegister} disabled={loading}
            style={{width:'100%', padding:'11px', background:'#1D9E75', color:'white', border:'none', borderRadius:'8px', fontSize:'15px', fontWeight:500, cursor:'pointer', marginBottom:'12px'}}>
            {loading ? 'Se creează contul...' : 'Creează cont'}
          </button>

          <p style={{textAlign:'center', fontSize:'13px', color:'#888'}}>
            Ai deja cont?{' '}
            <Link href="/login" style={{color:'#0F6E56', fontWeight:500}}>Intră în cont</Link>
          </p>
        </div>
      </div>
    </div>
  )
}