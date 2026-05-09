'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Upload() {
  const [fisier, setFisier] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [salvare, setSalvare] = useState(false)
  const [rezultat, setRezultat] = useState<any[]>([])
  const [eroare, setEroare] = useState('')
  const [mesaj, setMesaj] = useState('')
  const [laborator, setLaborator] = useState('')
  const [dataBuletin, setDataBuletin] = useState('')
  const router = useRouter()

  function handleFisier(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f && f.type === 'application/pdf') {
      setFisier(f)
      setEroare('')
      setRezultat([])
    } else {
      setEroare('Te rugăm să selectezi un fișier PDF.')
    }
  }

  async function handleUpload() {
    if (!fisier) { setEroare('Selectează un fișier PDF mai întâi.'); return }
    setLoading(true)
    setEroare('')
    setMesaj('')
    setRezultat([])

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const formData = new FormData()
      formData.append('pdf', fisier)
      formData.append('userId', session.user.id)

      const res = await fetch('/api/extract', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (data.error) {
        setEroare(data.error)
      } else {
        setRezultat(data.analize || [])
        setLaborator(data.laborator || '')
        setDataBuletin(data.data_buletin || '')
        setMesaj(`S-au extras ${data.analize?.length || 0} analize din PDF!`)
      }
    } catch (e) {
      setEroare('A apărut o eroare. Încearcă din nou.')
    }
    setLoading(false)
  }

  async function handleSalvare() {
    setSalvare(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const inserts = rezultat.map(a => ({
        user_id: session.user.id,
        nume_analiza: a.nume,
        valoare: parseFloat(a.valoare) || 0,
        unitate: a.unitate || '',
        data_analiza: dataBuletin || a.data || new Date().toISOString().split('T')[0],
        observatii: `Laborator: ${laborator || 'necunoscut'} | Status: ${a.status}`
      }))

      const { error } = await supabase.from('analize').insert(inserts)

      if (error) {
        setEroare('Eroare la salvare: ' + error.message)
      } else {
        router.push('/dashboard')
      }
    } catch (e) {
      setEroare('A apărut o eroare la salvare.')
    }
    setSalvare(false)
  }

  return (
    <main style={{fontFamily:'Arial', maxWidth:'700px', margin:'0 auto', padding:'2rem 1rem'}}>
      <div style={{marginBottom:'2rem'}}>
        <Link href="/dashboard" style={{color:'#0070f3', textDecoration:'none', fontSize:'14px'}}>← Înapoi la dosar</Link>
      </div>

      <h1 style={{fontSize:'1.8rem', marginBottom:'0.5rem'}}>Adaugă analize</h1>
      <p style={{color:'#666', marginBottom:'2rem', fontSize:'14px'}}>
        Uploadează buletinul de analize în format PDF — platforma va extrage automat toate valorile
      </p>

      <div style={{border:'2px dashed #ddd', borderRadius:'12px', padding:'3rem', textAlign:'center', marginBottom:'1.5rem', background: fisier ? '#f0fff4' : '#fafafa'}}>
        {fisier ? (
          <div>
            <div style={{fontSize:'2rem', marginBottom:'0.5rem'}}>✅</div>
            <p style={{fontWeight:'500'}}>{fisier.name}</p>
            <p style={{color:'#666', fontSize:'13px'}}>{(fisier.size / 1024).toFixed(0)} KB</p>
            <button onClick={() => { setFisier(null); setRezultat([]) }} style={{marginTop:'1rem', padding:'6px 14px', border:'1px solid #ddd', borderRadius:'6px', background:'white', cursor:'pointer', fontSize:'13px'}}>
              Schimbă fișierul
            </button>
          </div>
        ) : (
          <div>
            <div style={{fontSize:'3rem', marginBottom:'1rem'}}>📄</div>
            <p style={{marginBottom:'1rem', color:'#444'}}>Selectează buletinul de analize PDF</p>
            <label style={{padding:'10px 20px', background:'#0070f3', color:'white', borderRadius:'6px', cursor:'pointer', fontSize:'14px'}}>
              Alege fișier PDF
              <input type="file" accept=".pdf" onChange={handleFisier} style={{display:'none'}} />
            </label>
          </div>
        )}
      </div>

      {eroare && <p style={{color:'red', marginBottom:'1rem', fontSize:'14px'}}>{eroare}</p>}
      {mesaj && <p style={{color:'green', marginBottom:'1rem', fontSize:'14px', fontWeight:'500'}}>{mesaj}</p>}

      {fisier && !loading && rezultat.length === 0 && (
        <button onClick={handleUpload} style={{width:'100%', padding:'14px', background:'#0070f3', color:'white', border:'none', borderRadius:'8px', fontSize:'16px', cursor:'pointer', marginBottom:'1.5rem'}}>
          Extrage analizele din PDF
        </button>
      )}

      {loading && (
        <div style={{textAlign:'center', padding:'2rem'}}>
          <p style={{color:'#0070f3', fontSize:'16px'}}>⏳ Se procesează PDF-ul...</p>
          <p style={{color:'#666', fontSize:'13px', marginTop:'0.5rem'}}>Extragerea poate dura 10-30 secunde</p>
        </div>
      )}

      {rezultat.length > 0 && (
        <div>
          <h2 style={{fontSize:'1.2rem', marginBottom:'1rem'}}>Analize extrase — {rezultat.length} valori găsite</h2>
          {laborator && <p style={{color:'#666', fontSize:'13px', marginBottom:'1rem'}}>Laborator: {laborator} {dataBuletin && `· Data: ${dataBuletin}`}</p>}
          <div style={{border:'1px solid #eee', borderRadius:'8px', overflow:'hidden', marginBottom:'1.5rem'}}>
            <div style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', background:'#f5f5f5', padding:'10px 16px', fontSize:'13px', fontWeight:'500', color:'#555'}}>
              <span>Analiză</span><span>Valoare</span><span>Unitate</span><span>Status</span>
            </div>
            {rezultat.map((a, i) => (
              <div key={i} style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', padding:'10px 16px', fontSize:'14px', borderTop:'1px solid #eee', background: i % 2 === 0 ? 'white' : '#fafafa'}}>
                <span>{a.nume}</span>
                <span style={{fontWeight:'500'}}>{a.valoare}</span>
                <span style={{color:'#666'}}>{a.unitate}</span>
                <span style={{color: a.status === 'normal' ? '#00a854' : a.status === 'peste' ? '#f5222d' : '#fa8c16', fontWeight:'500'}}>
                  {a.status === 'normal' ? '✓ Normal' : a.status === 'peste' ? '↑ Peste' : a.status === 'sub' ? '↓ Sub' : '—'}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={handleSalvare}
            disabled={salvare}
            style={{width:'100%', padding:'14px', background:'#00a854', color:'white', border:'none', borderRadius:'8px', fontSize:'16px', cursor:'pointer'}}
          >
            {salvare ? 'Se salvează...' : 'Salvează în dosar →'}
          </button>
        </div>
      )}
    </main>
  )
}
