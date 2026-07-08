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
  const [duplicat, setDuplicat] = useState(false)
  const [insertsTemp, setInsertsTemp] = useState<any[]>([])
  const [mesaj, setMesaj] = useState('')
  const [laborator, setLaborator] = useState('')
  const [orasLaborator, setOrasLaborator] = useState('')
  const [taraLaborator, setTaraLaborator] = useState('')
  const [dataBuletin, setDataBuletin] = useState('')
  const router = useRouter()

  function handleFisier(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f && f.type === 'application/pdf') { setFisier(f); setEroare(''); setRezultat([]) }
    else setEroare('Te rugăm să selectezi un fișier PDF.')
  }

  async function handleUpload() {
    if (!fisier) { setEroare('Selectează un fișier PDF mai întâi.'); return }
    setLoading(true); setEroare(''); setMesaj(''); setRezultat([])
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const formData = new FormData()
      formData.append('pdf', fisier)
      formData.append('userId', session.user.id)
          const res = await fetch('/api/extract', { method: 'POST', body: formData, headers: { 'Authorization': `Bearer ${session.access_token}` } })
      const data = await res.json()
      if (data.error) setEroare(data.error)
      else { setRezultat(data.analize || []); setLaborator(data.laborator || ''); setDataBuletin(data.data_buletin || ''); setOrasLaborator(data.oras_laborator || ''); setTaraLaborator(data.tara_laborator || ''); setMesaj(`S-au extras ${data.analize?.length || 0} analize din PDF!`) }
    } catch { setEroare('A apărut o eroare. Încearcă din nou.') }
    setLoading(false)
  }

  async function handleSalvare() {
    setSalvare(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      let pdfUrl = null
      let pdfNume = null
      if (fisier) {
        const cale = `${session.user.id}/${Date.now()}_${fisier.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage.from('documente').upload(cale, fisier, { contentType: 'application/pdf' })
        if (!uploadError && uploadData) { pdfUrl = cale; pdfNume = fisier.name }
      }

      const inserts = rezultat.map(a => ({
        user_id: session.user.id,
        oras_laborator: orasLaborator || null,
        tara_laborator: taraLaborator || null,
        nume_analiza: a.nume,
        valoare: a.tip_rezultat === 'calitativ' ? null : (parseFloat(a.valoare) || 0),
        unitate: a.unitate || '',
        data_analiza: dataBuletin || a.data || new Date().toISOString().split('T')[0],
        observatii: `Laborator: ${laborator || 'necunoscut'} | Status: ${a.status}`,
        referinta_min: a.referinta_min ? parseFloat(a.referinta_min) : null,
        referinta_max: a.referinta_max ? parseFloat(a.referinta_max) : null,
        tip_rezultat: a.tip_rezultat || 'numeric',
        rezultat_text: a.rezultat_text || null,
        pdf_url: pdfUrl,
        pdf_nume: pdfNume
      }))

      const { data: existente } = await supabase.from('analize').select('id').eq('user_id', session.user.id).eq('pdf_nume', fisier?.name || '').limit(1)
      if (existente && existente.length > 0) {
        setInsertsTemp(inserts)
        setDuplicat(true)
        setSalvare(false)
        return
      }
      const { error } = await supabase.from('analize').insert(inserts)
      if (error) setEroare('Eroare la salvare: ' + error.message)
      else router.push('/dashboard')
    } catch { setEroare('A apărut o eroare la salvare.') }
    setSalvare(false)
  }

  return (
    <div style={{fontFamily:'system-ui,-apple-system,sans-serif', background:'#f8f9fa', minHeight:'100vh'}}>
      <div style={{background:'white', borderBottom:'0.5px solid #e5e7eb', padding:'0 24px', height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <Link href="/dashboard" style={{display:'flex', alignItems:'center', gap:'8px', textDecoration:'none'}}>
          <div style={{width:'32px', height:'32px', background:'#E1F5EE', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', color:'#0F6E56', fontSize:'16px', fontWeight:600}}>✚</div>
          <span style={{fontSize:'18px', fontWeight:600, color:'#111'}}>MedFile</span>
        </Link>
      </div>

      <div style={{maxWidth:'680px', margin:'0 auto', padding:'2rem 1.5rem'}}>
        <h1 style={{fontSize:'20px', fontWeight:500, color:'#111', marginBottom:'6px'}}>Adaugă analize</h1>
        <p style={{color:'#888', marginBottom:'2rem', fontSize:'13px'}}>Uploadează buletinul de analize în format PDF — platforma va extrage automat toate valorile</p>

        <div style={{border: fisier ? '1.5px solid #1D9E75' : '1.5px dashed #e5e7eb', borderRadius:'12px', padding:'2.5rem', textAlign:'center', marginBottom:'1.5rem', background: fisier ? '#f0fdf8' : 'white'}}>
          {fisier ? (
            <div>
              <div style={{fontSize:'32px', marginBottom:'8px'}}>✅</div>
              <p style={{fontWeight:500, fontSize:'14px', color:'#111'}}>{fisier.name}</p>
              <p style={{color:'#888', fontSize:'12px', marginTop:'4px'}}>{(fisier.size/1024).toFixed(0)} KB</p>
              <button onClick={() => { setFisier(null); setRezultat([]) }} style={{marginTop:'12px', padding:'6px 14px', border:'0.5px solid #e5e7eb', borderRadius:'8px', background:'white', cursor:'pointer', fontSize:'12px', color:'#555'}}>
                Schimbă fișierul
              </button>
            </div>
          ) : (
            <div>
              <div style={{fontSize:'32px', marginBottom:'12px'}}>📄</div>
              <p style={{marginBottom:'16px', color:'#555', fontSize:'14px'}}>Selectează buletinul de analize PDF</p>
              <label style={{padding:'9px 20px', background:'#1D9E75', color:'white', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:500}}>
                Alege fișier PDF
                <input type="file" accept=".pdf" onChange={handleFisier} style={{display:'none'}} />
              </label>
            </div>
          )}
        </div>

        {duplicat && (
          <div style={{background:'#FCEBEB', border:'0.5px solid #E24B4A', borderRadius:'8px', padding:'16px', marginBottom:'16px'}}>
            <div style={{fontSize:'13px', fontWeight:500, color:'#A32D2D', marginBottom:'12px'}}>Buletinul "{fisier?.name}" există deja în dosar. Ce vrei să faci?</div>
            <div style={{display:'flex', gap:'8px'}}>
              <button onClick={async () => {
                setSalvare(true)
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) return
                await supabase.from('analize').delete().eq('user_id', session.user.id).eq('pdf_nume', fisier?.name || '')
                const { error } = await supabase.from('analize').insert(insertsTemp)
                if (error) setEroare('Eroare la salvare: ' + error.message)
                else router.push('/dashboard')
                setDuplicat(false)
                setSalvare(false)
              }} style={{padding:'8px 16px', background:'#16705a', color:'white', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:500, cursor:'pointer'}}>Suprascriere</button>
              <button onClick={() => setDuplicat(false)} style={{padding:'8px 16px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#111', cursor:'pointer', fontWeight:500}}>Anulează</button>
            </div>
          </div>
        )}
        {eroare && <p style={{color:'#E24B4A', marginBottom:'1rem', fontSize:'13px'}}>{eroare}</p>}
        {mesaj && <p style={{color:'#1D9E75', marginBottom:'1rem', fontSize:'13px', fontWeight:500}}>{mesaj}</p>}

        {fisier && !loading && rezultat.length === 0 && (
          <button onClick={handleUpload} style={{width:'100%', padding:'12px', background:'#1D9E75', color:'white', border:'none', borderRadius:'8px', fontSize:'15px', fontWeight:500, cursor:'pointer', marginBottom:'1rem'}}>
            Extrage analizele din PDF
          </button>
        )}

        {loading && (
          <div style={{textAlign:'center', padding:'2rem', background:'white', borderRadius:'12px', border:'0.5px solid #e5e7eb'}}>
            <p style={{color:'#1D9E75', fontSize:'14px', fontWeight:500}}>⏳ Se procesează PDF-ul...</p>
            <p style={{color:'#888', fontSize:'12px', marginTop:'6px'}}>Extragerea poate dura 10-30 secunde</p>
          </div>
        )}

        {rezultat.length > 0 && (
          <div>
            <div style={{background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', overflow:'hidden', marginBottom:'1rem'}}>
              <div style={{padding:'12px 16px', borderBottom:'0.5px solid #e5e7eb', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <span style={{fontSize:'13px', fontWeight:500, color:'#111'}}>Analize extrase — {rezultat.length} valori</span>
                {laborator && <span style={{fontSize:'12px', color:'#888'}}>{laborator} · {dataBuletin}</span>}
              </div>
              <div style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', padding:'8px 16px', background:'#f8f9fa', borderBottom:'0.5px solid #e5e7eb'}}>
                {['Analiză','Valoare','Unitate','Status'].map(h => (
                  <span key={h} style={{fontSize:'10px', color:'#888', fontWeight:500, textTransform:'uppercase', letterSpacing:'0.5px'}}>{h}</span>
                ))}
              </div>
              {rezultat.map((a, i) => (
                <div key={i} style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', padding:'9px 16px', fontSize:'13px', borderBottom: i < rezultat.length-1 ? '0.5px solid #f0f0f0' : 'none', alignItems:'center'}}>
                  <span style={{color:'#111'}}>{a.nume}</span>
                  <span style={{fontWeight:500, color:'#111'}}>{a.tip_rezultat === 'calitativ' ? a.rezultat_text : a.valoare}</span>
                  <span style={{color:'#888'}}>{a.unitate || '—'}</span>
                  <span style={{display:'inline-flex', padding:'2px 8px', borderRadius:'12px', fontSize:'11px', fontWeight:500, width:'fit-content',
                    background: a.status === 'normal' || a.status === 'negativ' ? '#E1F5EE' : a.status === 'peste' || a.status === 'pozitiv' ? '#FCEBEB' : '#FAEEDA',
                    color: a.status === 'normal' || a.status === 'negativ' ? '#085041' : a.status === 'peste' || a.status === 'pozitiv' ? '#A32D2D' : '#854F0B'}}>
                    {a.status === 'normal' ? '✓ Normal' : a.status === 'negativ' ? '✓ Negativ' : a.status === 'peste' ? '↑ Peste' : a.status === 'pozitiv' ? '⚠ Pozitiv' : '↓ Sub'}
                  </span>
                </div>
              ))}
            </div>
            <button onClick={handleSalvare} disabled={salvare}
              style={{width:'100%', padding:'12px', background:'#1D9E75', color:'white', border:'none', borderRadius:'8px', fontSize:'15px', fontWeight:500, cursor:'pointer'}}>
              {salvare ? 'Se salvează...' : 'Salvează în dosar →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}