'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Topbar from '@/components/Topbar'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SPECIALITATI = [
  'Alergologie și imunologie clinică', 'Anatomie patologică', 'Anestezie și terapie intensivă',
  'Cardiologie', 'Chirurgie cardiovasculară', 'Chirurgie generală', 'Chirurgie orală și maxilo-facială',
  'Chirurgie pediatrică', 'Chirurgie plastică, estetică și microchirurgie', 'Chirurgie toracică',
  'Dermatologie și venerologie', 'Diabet zaharat, nutriție și boli metabolice', 'Endocrinologie',
  'Epidemiologie', 'Gastroenterologie', 'Genetică medicală', 'Geriatrie și gerontologie',
  'Hematologie', 'Hepatologie', 'Igienă și sănătate publică', 'Medicină de familie',
  'Medicină de urgență', 'Medicină fizică și de reabilitare', 'Medicină internă',
  'Medicină legală', 'Medicină muncii', 'Nefrologie', 'Neonatologie', 'Neurochirurgie',
  'Neurologie', 'Neurologie pediatrică', 'Oftalmologie', 'Oncologie medicală',
  'Ortopedie și traumatologie', 'Otorinolaringologie', 'Pediatrie', 'Pneumologie',
  'Psihiatrie', 'Psihiatrie pediatrică', 'Radiologie și imagistică medicală',
  'Radioterapie', 'Reumatologie', 'Urologie', 'Altă specialitate'
]

export default function Raport() {
  const [user, setUser] = useState<any>(null)
  const [profil, setProfil] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [salvare, setSalvare] = useState(false)
  const [mesaj, setMesaj] = useState('')
  const [mesajValidare, setMesajValidare] = useState('')
  const router = useRouter()

  const [fisier, setFisier] = useState<File | null>(null)
  const [categorie, setCategorie] = useState('')
  const [dataRaport, setDataRaport] = useState('')
  const [medic, setMedic] = useState('')
  const [specialitate, setSpecialitate] = useState('')
  const [altaSpecialitate, setAltaSpecialitate] = useState('')
  const [unitate, setUnitate] = useState('')
  const [diagnostic, setDiagnostic] = useState('')
  const [extragere, setExtragere] = useState(false)
  const [dropSpecialitate, setDropSpecialitate] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      const { data } = await supabase.from('profiluri').select('prenume, nume').eq('id', session.user.id).single()
      setProfil(data)
      setLoading(false)
    })
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  async function handleSalvare() {
    setMesajValidare('')
    const specialitateFinal = specialitate === 'Altă specialitate' ? altaSpecialitate : specialitate
    if (!categorie) { setMesajValidare('Selectează categoria raportului.'); return }
    if (!dataRaport) { setMesajValidare('Completează data raportului.'); return }
    if (!medic) { setMesajValidare('Completează numele medicului.'); return }
    if (!specialitateFinal) { setMesajValidare('Completează specialitatea.'); return }
    if (!unitate) { setMesajValidare('Completează clinica sau spitalul.'); return }
    if (!diagnostic) { setMesajValidare('Completează diagnosticul.'); return }
    setSalvare(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setSalvare(false); return }

    let pdfUrl = null
    let pdfNume = null
    if (fisier) {
      const cale = `${session.user.id}/rapoarte/${Date.now()}_${fisier.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage.from('documente').upload(cale, fisier, { contentType: 'application/pdf' })
      if (!uploadError && uploadData) { pdfUrl = cale; pdfNume = fisier.name }
    }

    const { error } = await supabase.from('rapoarte').insert({
      user_id: session.user.id,
      apartinator_id: typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('profilActiv') || '{}')?.tip === 'apartinator' ? JSON.parse(localStorage.getItem('profilActiv') || '{}')?.id : null) : null,
      categorie,
      data_raport: dataRaport || null,
      medic: medic || null,
      specialitate: specialitateFinal || null,
      unitate: unitate || null,
      diagnostic: diagnostic || null,
      pdf_url: pdfUrl,
      pdf_nume: pdfNume,
    })

    if (error) { setMesajValidare('Eroare: ' + error.message); setSalvare(false); return }
    router.push('/dosar')
  }

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}><p>Se încarcă...</p></div>

  const username = profil?.prenume || user?.email?.split('@')[0]
  const inp: React.CSSProperties = { width:'100%', padding:'9px 13px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#111', background:'white', outline:'none', fontFamily:'system-ui', boxSizing:'border-box' as const }
  const inpDinamic = (val: string): React.CSSProperties => ({ ...inp, fontWeight: val ? 600 : 400 })
  const lbl: React.CSSProperties = { display:'block', fontSize:'12px', fontWeight:500, color:'#555', marginBottom:'5px' }
  const g2: React.CSSProperties = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'14px' }

  const categorii = [
    { key:'familie', label:'Medic de familie' },
    { key:'specialist', label:'Medic specialist' },
    { key:'interventie', label:'Raport intervenție medicală' },
    { key:'externare', label:'Scrisoare de externare' },
  ]

  return (
    <div style={{ fontFamily:'system-ui,-apple-system,sans-serif', background:'#f8f9fa', minHeight:'100vh' }}>
      <Topbar username={username} onLogout={handleLogout} />

      <div style={{ maxWidth:'680px', margin:'0 auto', padding:'32px 24px' }}>

        <div style={{ fontSize:'20px', fontWeight:500, color:'#111', marginBottom:'24px' }}>Adaugă raport medical</div>

        {mesaj && (
          <div style={{ padding:'12px 16px', borderRadius:'8px', marginBottom:'16px', background: mesaj.includes('Eroare') ? '#FCEBEB' : '#E1F5EE', color: mesaj.includes('Eroare') ? '#A32D2D' : '#0F6E56', fontSize:'13px' }}>
            {mesaj}
          </div>
        )}

        {/* Upload PDF */}
        <div style={{ background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', overflow:'hidden', marginBottom:'14px' }}>
          <div style={{ background:'#16705a', padding:'14px 20px' }}>
            <div style={{ fontSize:'14px', fontWeight:500, color:'white' }}>1. Upload PDF (opțional)</div>
            <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.75)', marginTop:'1px' }}>AI va extrage automat datele din raport</div>
          </div>
          <div style={{ padding:'20px' }}>
            <div onClick={() => document.getElementById('pdf-raport')?.click()}
              style={{ border:'1.5px dashed #e5e7eb', borderRadius:'10px', padding:'24px', textAlign:'center', cursor:'pointer', background:'#f8f9fa' }}>
              <input id="pdf-raport" type="file" accept=".pdf" style={{ display:'none' }} onChange={async e => {
                const f = e.target.files?.[0]
                if (f) {
                  setFisier(f)
                  setExtragere(true)
                  setMesaj('Se extrag datele din PDF...')
                  try {
                    const base64 = await new Promise<string>((resolve, reject) => {
                      const reader = new FileReader()
                      reader.onload = () => resolve((reader.result as string).split(',')[1])
                      reader.onerror = reject
                      reader.readAsDataURL(f)
                    })
                    const response = await fetch('/api/extrage-raport', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ pdf: base64 })
                    })
                    const result = await response.json()
                    if (result.medic) setMedic(result.medic)
                    if (result.specialitate) {
                      if (SPECIALITATI.includes(result.specialitate)) {
                        setSpecialitate(result.specialitate)
                      } else {
                        setSpecialitate('Altă specialitate')
                        setAltaSpecialitate(result.specialitate)
                      }
                    }
                    if (result.unitate) setUnitate(result.unitate)
                    if (result.diagnostic) setDiagnostic(result.diagnostic)
                    if (result.data_raport) setDataRaport(result.data_raport)
                    setMesaj('Date extrase cu succes. Verifică și completează.')
                  } catch {
                    setMesaj('Extragerea a eșuat — completează manual.')
                  }
                  setExtragere(false)
                }
              }} />
              {extragere ? (
                <div style={{ fontSize:'13px', color:'#16705a', fontWeight:500 }}>⏳ Se extrag datele...</div>
              ) : fisier ? (
                <div style={{ fontSize:'13px', color:'#16705a', fontWeight:500 }}>✓ {fisier.name}</div>
              ) : (
                <>
                  <div style={{ fontSize:'14px', fontWeight:500, color:'#111', marginBottom:'4px' }}>Trage PDF-ul aici sau apasă pentru a selecta</div>
                  <div style={{ fontSize:'12px', color:'#888' }}>PDF, max 10 MB</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Categorie */}
        <div style={{ background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', overflow:'hidden', marginBottom:'14px' }}>
          <div style={{ background:'#16705a', padding:'14px 20px' }}>
            <div style={{ fontSize:'14px', fontWeight:500, color:'white' }}>2. Selectează categoria</div>
            <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.75)', marginTop:'1px' }}>Alege tipul raportului medical</div>
          </div>
          <div style={{ padding:'20px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
              {categorii.map(c => (
                <div key={c.key} onClick={() => setCategorie(c.key)}
                  style={{ padding:'12px 14px', border: categorie === c.key ? '2px solid #16705a' : '0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color: categorie === c.key ? '#085041' : '#111', background: categorie === c.key ? '#E1F5EE' : 'white', cursor:'pointer', fontWeight: categorie === c.key ? 500 : 400 }}>
                  {c.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Date raport */}
        <div style={{ background:'white', border:'0.5px solid #e5e7eb', borderRadius:'12px', overflow:'hidden', marginBottom:'14px' }}>
          <div style={{ background:'#16705a', padding:'14px 20px' }}>
            <div style={{ fontSize:'14px', fontWeight:500, color:'white' }}>3. Date raport</div>
            <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.75)', marginTop:'1px' }}>Completează sau verifică datele extrase</div>
          </div>
          <div style={{ padding:'20px' }}>
            <div style={g2}>
              <div>
                <label style={lbl}>Data raportului</label>
                <input type="date" value={dataRaport} onChange={e => setDataRaport(e.target.value)} style={inpDinamic(dataRaport)} />
              </div>
              <div>
                <label style={lbl}>Medic</label>
                <input value={medic} onChange={e => setMedic(e.target.value)} style={inpDinamic(medic)} />
              </div>
            </div>
            <div style={g2}>
              {/* Specialitate lista vizibila */}
              <div>,
                <label style={lbl}>Specialitate</label>
                <div style={{ border:'0.5px solid #e5e7eb', borderRadius:'8px', maxHeight:'180px', overflowY:'auto', background:'white', padding:'4px 0' }}>
                    {SPECIALITATI.map(s => {
                      const isSelected = specialitate === s
                      return (
                        <div
                          key={s}
                          onClick={() => { setSpecialitate(s); if (s !== 'Altă specialitate') setAltaSpecialitate('') }}
                          style={{
                            padding: '10px 14px',
                            fontSize: '13px',
                            cursor: 'pointer',
                            backgroundColor: isSelected ? '#E1F5EE' : 'white',
                            color: isSelected ? '#085041' : '#111',
                            fontWeight: isSelected ? 600 : 400,
                            transition: 'background 0.1s ease'
                          }}
                          onMouseEnter={e => {
                            if (!isSelected) e.currentTarget.style.backgroundColor = '#f8f9fa'
                          }}
                          onMouseLeave={e => {
                            if (!isSelected) e.currentTarget.style.backgroundColor = 'white'
                          }}
                        >
                          {s}
                        </div>
                      )
                    })}
                  </div>
                )}
                {specialitate === 'Altă specialitate' && (
                  <input
                    value={altaSpecialitate}
                    onChange={e => setAltaSpecialitate(e.target.value)}
                    placeholder="Introdu specialitatea personalizată"
                    style={{
                      ...inpDinamic(altaSpecialitate),
                      marginTop: '8px',
                      borderColor: altaSpecialitate ? '#16705a' : '#e5e7eb',
                    }}
                    autoFocus
                  />
                )}
              </div>
              {/* Clinica / Spital */}
              <div>
                <label style={lbl}>Clinică / Spital</label>
                <input value={unitate} onChange={e => setUnitate(e.target.value)} style={inpDinamic(unitate)} />
              </div>
            </div>
            <div>
              <label style={lbl}>Diagnostic</label>
              <input value={diagnostic} onChange={e => setDiagnostic(e.target.value)} style={inpDinamic(diagnostic)} />
            </div>
          </div>
        </div>

        {mesajValidare && (
          <div style={{ padding:'12px 16px', borderRadius:'8px', marginBottom:'12px', background:'#FCEBEB', color:'#A32D2D', fontSize:'13px' }}>
            {mesajValidare}
          </div>
        )}

        <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
          <Link href="/dosar" style={{ padding:'10px 18px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#111', textDecoration:'none', fontWeight:500 }}>Anulează</Link>
          <button onClick={handleSalvare} disabled={salvare}
            style={{ padding:'10px 24px', background:'#16705a', color:'white', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:500, cursor:'pointer' }}>
            {salvare ? 'Se salvează...' : 'Salvează raport'}
          </button>
        </div>

      </div>
    </div>
  )
}