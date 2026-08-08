'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useParams } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function UrgentaPublica() {
  const { token } = useParams()
  const [profil, setProfil] = useState<any>(null)
  const [eroare, setEroare] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: qr } = await supabase
        .from('qr_tokens')
        .select('user_id, expires_at')
        .eq('token', token)
        .single()

      if (!qr) { setEroare('QR invalid sau expirat.'); setLoading(false); return }
      if (new Date(qr.expires_at) < new Date()) { setEroare('QR expirat.'); setLoading(false); return }

      const { data } = await supabase
        .from('profiluri')
        .select('prenume, nume, grup_sanguin, alergii_medicamente, alergii_alimentare, boli_cronice, contact_urgenta_nume, contact_urgenta_telefon, medic_familie_nume, medic_familie_telefon')
        .eq('id', qr.user_id)
        .single()

      setProfil(data)
      setLoading(false)
    }
    load()
  }, [token])

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'system-ui' }}><p>Se încarcă...</p></div>
  if (eroare) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'system-ui' }}><p style={{ color:'#E24B4A' }}>{eroare}</p></div>

  return (
    <div style={{ fontFamily:'system-ui', background:'#f8f9fa', minHeight:'100vh', padding:'24px' }}>
      <div style={{ maxWidth:'500px', margin:'0 auto' }}>
        <div style={{ background:'#E24B4A', borderRadius:'12px', padding:'20px', marginBottom:'16px', textAlign:'center' }}>
          <div style={{ fontSize:'32px', marginBottom:'8px' }}>🚨</div>
          <div style={{ fontSize:'22px', fontWeight:700, color:'white' }}>Card de urgență</div>
          <div style={{ fontSize:'16px', color:'rgba(255,255,255,0.9)', marginTop:'4px' }}>{profil?.prenume} {profil?.nume}</div>
        </div>

        {[
          { label:'Grup sanguin', value: profil?.grup_sanguin },
          { label:'Alergii medicamente', value: profil?.alergii_medicamente },
          { label:'Alergii alimentare', value: profil?.alergii_alimentare },
          { label:'Boli cronice', value: profil?.boli_cronice },
          { label:'Contact urgență', value: profil?.contact_urgenta_nume ? `${profil.contact_urgenta_nume} — ${profil.contact_urgenta_telefon}` : null },
          { label:'Medic familie', value: profil?.medic_familie_nume ? `${profil.medic_familie_nume} — ${profil.medic_familie_telefon}` : null },
        ].map(item => item.value ? (
          <div key={item.label} style={{ background:'white', borderRadius:'10px', padding:'16px', marginBottom:'10px', border:'0.5px solid #e5e7eb' }}>
            <div style={{ fontSize:'11px', fontWeight:600, color:'#888', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'4px' }}>{item.label}</div>
            <div style={{ fontSize:'16px', fontWeight:500, color:'#111' }}>{item.value}</div>
          </div>
        ) : null)}

        <div style={{ fontSize:'11px', color:'#aaa', textAlign:'center', marginTop:'16px' }}>
          Panoramic MedLog — Date declarate de titular. Nu constituie diagnostic medical.
        </div>
      </div>
    </div>
  )
}