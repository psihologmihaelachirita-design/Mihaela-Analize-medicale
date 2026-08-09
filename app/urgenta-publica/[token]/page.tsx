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
      const { data: qr } = await supabase.from('qr_tokens').select('user_id, expires_at').eq('token', token).single()
      if (!qr) { setEroare('QR invalid sau expirat.'); setLoading(false); return }
      if (new Date(qr.expires_at) < new Date()) { setEroare('QR expirat.'); setLoading(false); return }
      const { data } = await supabase.from('profiluri').select('prenume, nume, cnp, data_nasterii, sex, grup_sanguin, alergii_medicamente, alergii_alimentare, boli_cronice, fumator, greutate, inaltime, diagnostice_json, implanturi_json, interventii_json, contact_urgenta_nume, contact_urgenta_telefon, medic_familie_nume, medic_familie_telefon, asigurat_cnas').eq('id', qr.user_id).single()
      setProfil(data)
      setLoading(false)
    }
    load()
  }, [token])

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'system-ui' }}><p>Se încarcă...</p></div>
  if (eroare) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'system-ui' }}><p style={{ color:'#E24B4A', fontSize:'16px' }}>{eroare}</p></div>

  const card = (label: string, value: any) => value ? (
    <div key={label} style={{ background:'white', borderRadius:'10px', padding:'14px 16px', marginBottom:'10px', border:'0.5px solid #e5e7eb' }}>
      <div style={{ fontSize:'11px', fontWeight:600, color:'#888', textTransform:'uppercase' as const, letterSpacing:'0.5px', marginBottom:'4px' }}>{label}</div>
      <div style={{ fontSize:'15px', fontWeight:500, color:'#111' }}>{value}</div>
    </div>
  ) : null

  let diagnostice = []
  let implanturi = []
  let interventii = []
  try { diagnostice = JSON.parse(profil?.diagnostice_json || '[]') } catch {}
  try { implanturi = JSON.parse(profil?.implanturi_json || '[]') } catch {}
  try { interventii = JSON.parse(profil?.interventii_json || '[]') } catch {}

  return (
    <div style={{ fontFamily:'system-ui', background:'#f8f9fa', minHeight:'100vh', padding:'24px' }}>
      <div style={{ maxWidth:'500px', margin:'0 auto' }}>
        <div style={{ background:'#E24B4A', borderRadius:'12px', padding:'20px', marginBottom:'16px', textAlign:'center' }}>
          <div style={{ fontSize:'32px', marginBottom:'8px' }}>🚨</div>
          <div style={{ fontSize:'22px', fontWeight:700, color:'white' }}>Card de urgență</div>
          <div style={{ fontSize:'16px', color:'rgba(255,255,255,0.9)', marginTop:'4px' }}>{profil?.prenume} {profil?.nume}</div>
        </div>

        {card('Grup sanguin', profil?.grup_sanguin)}
        {card('Sex', profil?.sex === 'F' ? 'Feminin' : profil?.sex === 'M' ? 'Masculin' : null)}
        {card('Data nașterii', profil?.data_nasterii)}
        {card('Greutate', profil?.greutate ? `${profil.greutate} kg` : null)}
        {card('Înălțime', profil?.inaltime ? `${profil.inaltime} cm` : null)}
        {card('Fumător', profil?.fumator ? 'Da' : profil?.fumator === false ? 'Nu' : null)}
        {card('Alergii medicamente', profil?.alergii_medicamente)}
        {card('Alergii alimentare', profil?.alergii_alimentare)}
        {card('Boli cronice', profil?.boli_cronice)}
        {card('Asigurat CNAS', profil?.asigurat_cnas ? 'Da' : 'Nu')}

        {diagnostice.length > 0 && (
          <div style={{ background:'white', borderRadius:'10px', padding:'14px 16px', marginBottom:'10px', border:'0.5px solid #e5e7eb' }}>
            <div style={{ fontSize:'11px', fontWeight:600, color:'#888', textTransform:'uppercase' as const, letterSpacing:'0.5px', marginBottom:'8px' }}>Diagnostice</div>
            {diagnostice.map((d: any, i: number) => <div key={i} style={{ fontSize:'14px', color:'#111', marginBottom:'4px' }}>• {d.nume || d}</div>)}
          </div>
        )}

        {implanturi.length > 0 && (
          <div style={{ background:'white', borderRadius:'10px', padding:'14px 16px', marginBottom:'10px', border:'0.5px solid #e5e7eb' }}>
            <div style={{ fontSize:'11px', fontWeight:600, color:'#888', textTransform:'uppercase' as const, letterSpacing:'0.5px', marginBottom:'8px' }}>Implanturi</div>
            {implanturi.map((d: any, i: number) => <div key={i} style={{ fontSize:'14px', color:'#111', marginBottom:'4px' }}>• {d.tip || d}</div>)}
          </div>
        )}

        {interventii.length > 0 && (
          <div style={{ background:'white', borderRadius:'10px', padding:'14px 16px', marginBottom:'10px', border:'0.5px solid #e5e7eb' }}>
            <div style={{ fontSize:'11px', fontWeight:600, color:'#888', textTransform:'uppercase' as const, letterSpacing:'0.5px', marginBottom:'8px' }}>Intervenții</div>
            {interventii.map((d: any, i: number) => <div key={i} style={{ fontSize:'14px', color:'#111', marginBottom:'4px' }}>• {d.tip || d}</div>)}
          </div>
        )}

        {card('Contact urgență', profil?.contact_urgenta_nume ? `${profil.contact_urgenta_nume} — ${profil.contact_urgenta_telefon}` : null)}
        {card('Medic familie', profil?.medic_familie_nume ? `${profil.medic_familie_nume} — ${profil.medic_familie_telefon}` : null)}

        <div style={{ fontSize:'11px', color:'#aaa', textAlign:'center', marginTop:'16px', lineHeight:1.6 }}>
          Panoramic MedLog — Date declarate de titular.<br/>Nu constituie diagnostic medical.
        </div>
      </div>
    </div>
  )
}