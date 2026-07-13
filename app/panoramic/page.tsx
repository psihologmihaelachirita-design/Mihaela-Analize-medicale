'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const CATEGORII: Record<string, string[]> = {
  'Hematologie': ['leucocite', 'hemoglobina', 'hematocrit', 'trombocite', 'eritrocite', 'vsh', 'reticulocite', 'volum eritrocitar', 'volum trombocitar', 'concentratie medie', 'hemoglobina eritrocitara', 'largimea', 'granulocite', 'neutrofile', 'limfocite', 'monocite', 'eozinofile', 'bazofile', 'inr', 'aptt', 'fibrinogen', 'protrombina', 'd-dimeri'],
  'Biochimie': ['glucoza', 'glicemie', 'colesterol', 'trigliceride', 'hdl', 'ldl', 'uree', 'creatinina', 'acid uric', 'egfr', 'alt', 'ast', 'tgp', 'tgo', 'ggt', 'bilirubina', 'fosfataza', 'calciu', 'sodiu', 'potasiu', 'magneziu', 'fosfor', 'fier', 'feritina', 'transferina', 'proteina', 'albumina', 'amilaza', 'lipaza'],
  'Endocrinologie': ['tsh', 't3', 't4', 'ft3', 'ft4', 'anti tpo', 'anti-tpo', 'tiroglobulina', 'anti tiroglobulina', 'cortizol', 'dhea', 'pth', 'parathormon', 'insulina', 'homa', 'peptid c', 'vitamina d'],
  'Fertilitate': ['fsh', 'lh', 'estradiol', 'progesteron', 'prolactina', 'amh', 'inhibina', 'testosteron', 'beta-hcg', 'hcg'],
  'Imunologie': ['igg', 'igm', 'iga', 'ige', 'complement', 'ana', 'anca', 'factor reumatoid', 'anti-ccp', 'crp', 'proteina c reactiva', 'anti-ds', 'anticorp'],
  'Alergologie': ['ige specific', 'rast', 'alergen', 'alergie'],
  'Microbiologie': ['cultura', 'antibiograma', 'streptococ', 'exudat', 'urocult', 'coprocult', 'hemocult'],
  'Virologie': ['hepatita', 'hbsag', 'anti-hbs', 'anti-hcv', 'hiv', 'cmv', 'ebv', 'toxoplasma', 'rubeola', 'treponema', 'vdrl', 'virus epstein', 'citomegalovirus', 'anti toxoplasma', 'anti virus'],
  'Markeri tumorali': ['psa', 'cea', 'afp', 'ca125', 'ca19', 'ca15', 'nse', 'cromogranina', 'calcitonina'],
  'Cardiologie': ['troponina', 'bnp', 'nt-probnp', 'ck-mb', 'mioglobina', 'homocisteina'],
  'Nutritie': ['vitamina b12', 'vitamina b', 'folat', 'vitamina a', 'vitamina e', 'vitamina k', 'zinc', 'seleniu', 'cupru'],
  'Biologie moleculara': ['pcr', 'hpv', 'chlamydia', 'gonoree', 'tbc', 'covid', 'sars'],
  'Genetica': ['cariotip', 'brca', 'mthfr', 'factor v leiden', 'mutatie', 'polimorfism', 'genetica', 'fish'],
  'Urina': ['sumar urina', 'sediment', 'proteinurie', 'microalbuminurie', 'densitate urinara'],
  'Imagistica': ['ecografie', 'rmn', 'ct', 'radiografie', 'mamografie', 'scintigrafie'],
  'Anatomie patologica': ['biopsie', 'citologie', 'papanicolaou', 'histopatologie'],
  'Farmacologie': ['digoxina', 'litiu', 'valproat', 'ciclosporina', 'nivel seric', 'plumb', 'mercur'],
}

function getCategorieAnaliza(nume: string): string {
  const numeLower = nume.toLowerCase()
  for (const [cat, termeni] of Object.entries(CATEGORII)) {
    if (termeni.some(t => numeLower.includes(t))) return cat
  }
  return 'Altele'
}

function getStatus(observatii: string, tip_rezultat?: string, rezultat_text?: string): string {
  if (tip_rezultat === 'calitativ') {
    const text = (rezultat_text || '').toLowerCase()
    if (text.includes('negativ') || text.includes('absent') || text.includes('neractiv')) return 'negativ'
    if (text.includes('pozitiv') || text.includes('prezent') || text.includes('reactiv')) return 'pozitiv'
    return 'calitativ'
  }
  if (observatii?.includes('peste')) return 'peste'
  if (observatii?.includes('sub')) return 'sub'
  return 'normal'
}

function getLaborator(observatii: string): string {
  const match = observatii?.match(/Laborator: ([^|]+)/)
  return match ? match[1].trim() : 'necunoscut'
}

export default function Panoramic() {
  const [analize, setAnalize] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [categoriiActive, setCategoriiActive] = useState<string[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [dropdown, setDropdown] = useState(false)
  const [username, setUsername] = useState('')
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const hoverTimeout = useRef<any>(null)
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      const { data: profilData } = await supabase.from('profiluri').select('nume, prenume').eq('id', session.user.id).single()
      const numeComplet = profilData?.nume || ''
      const prenume = numeComplet.split(' ').slice(1).join(' ')
      setUsername(prenume || session.user.email?.split('@')[0] || '')
      const { data } = await supabase
        .from('analize')
        .select('*')
        .eq('user_id', session.user.id)
        .order('data_analiza', { ascending: true })
      setAnalize(data || [])
      setLoading(false)
    })
  }, [])

  async function deschidePDF(pdfUrl: string) {
    const { data } = await supabase.storage.from('documente').createSignedUrl(pdfUrl, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  if (loading) return <p style={{fontFamily:'system-ui', padding:'2rem', color:'#888'}}>Se încarcă...</p>

  const grupate: Record<string, any[]> = {}
  analize.forEach(a => {
    if (!grupate[a.nume_analiza]) grupate[a.nume_analiza] = []
    grupate[a.nume_analiza].push(a)
  })

  const toateDatele = [...new Set(analize.map(a => a.data_analiza))].sort()
  const toateCategoriile = [...Object.keys(CATEGORII), 'Altele']

  function toggleCategorie(cat: string) {
    setCategoriiActive(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])
  }

  function handleMouseEnter() {
    clearTimeout(hoverTimeout.current)
    setDropdownOpen(true)
  }

  function handleMouseLeave() {
    hoverTimeout.current = setTimeout(() => setDropdownOpen(false), 300)
  }

  const numeAfisate = Object.keys(grupate).filter(nume => {
    const catOk = categoriiActive.length === 0 || categoriiActive.includes(getCategorieAnaliza(nume))
    const searchOk = search === '' || nume.toLowerCase().includes(search.toLowerCase())
    return catOk && searchOk
  })

  const COL_WIDTH = 85
  const ROW_HEIGHT = 23
  const LABEL_WIDTH = 140

  const selectedStatus = selected ? getStatus(selected.observatii, selected.tip_rezultat, selected.rezultat_text) : ''
  const selectedLab = selected ? getLaborator(selected.observatii) : ''
  const evolutieSelectata = selected ? (grupate[selected.nume_analiza] || [])
    .filter((a: any) => a.tip_rezultat !== 'calitativ' && a.valoare)
    .sort((a: any, b: any) => a.data_analiza.localeCompare(b.data_analiza)) : []
  const maxVal = Math.max(...evolutieSelectata.map((a: any) => parseFloat(a.valoare) || 0))

  return (
    <div style={{fontFamily:'system-ui,-apple-system,sans-serif', background:'#f8f9fa', height:'100vh', display:'flex', flexDirection:'column'}}>

      {/* Topbar */}
      <div style={{background:'white', borderBottom:'0.5px solid #e5e7eb', padding:'0 24px', height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0}}>
        <Link href="/dashboard" style={{display:'flex', alignItems:'center', gap:'10px', textDecoration:'none'}}>
          <div style={{width:'32px', height:'32px', background:'#E1F5EE', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', color:'#0F6E56', fontSize:'16px', fontWeight:600}}>✚</div>
          <span style={{fontSize:'18px', fontWeight:600, color:'#111'}}>MedFile</span>
        </Link>
        <div style={{display:'flex', alignItems:'center', gap:'4px'}}>
          <Link href="/dashboard" style={{padding:'6px 10px', borderRadius:'8px', fontSize:'13px', color:'#111', textDecoration:'none', fontWeight:500}}>Home</Link>
          <Link href="/panoramic" style={{padding:'6px 10px', borderRadius:'8px', fontSize:'13px', color:'#085041', textDecoration:'none', fontWeight:500, background:'#E1F5EE'}}>Panoramic</Link>
          <Link href="/urgenta" style={{padding:'6px 10px', borderRadius:'8px', fontSize:'13px', color:'#111', textDecoration:'none', fontWeight:500}}>Urgență</Link>
          <Link href="/dosar" style={{padding:'6px 10px', borderRadius:'8px', fontSize:'13px', color:'#111', textDecoration:'none', fontWeight:500}}>Dosar</Link>
          <Link href="/upload" style={{padding:'6px 14px', background:'#16705a', color:'white', borderRadius:'8px', fontSize:'13px', fontWeight:500, textDecoration:'none', marginLeft:'4px'}}>+ Adaugă</Link>
          <div style={{position:'relative', marginLeft:'8px'}}>
            <button onClick={() => setDropdown(!dropdown)} style={{padding:'6px 12px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#111', background:'white', cursor:'pointer', fontWeight:500}}>{username} ▾</button>
            {dropdown && (
              <div style={{position:'absolute', right:0, top:'36px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', padding:'4px', minWidth:'140px', boxShadow:'0 4px 12px rgba(0,0,0,0.08)', zIndex:100}}>
                <Link href="/profil" style={{display:'block', padding:'8px 12px', fontSize:'13px', color:'#111', textDecoration:'none', borderRadius:'6px'}}>Profil</Link>
                <div onClick={handleLogout} style={{padding:'8px 12px', fontSize:'13px', color:'#E24B4A', cursor:'pointer', borderRadius:'6px'}}>Ieșire</div>
              </div>
            )}
          </div>
          </div>
      </div>

      {/* Toolbar */}
      <div style={{background:'white', borderBottom:'0.5px solid #e5e7eb', padding:'8px 24px', display:'flex', alignItems:'center', gap:'10px', flexShrink:0}}>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Caută analiză..."
          style={{flex:1, maxWidth:'260px', padding:'7px 12px', borderRadius:'8px', border:'0.5px solid #e5e7eb', fontSize:'13px', outline:'none', background:'#f8f9fa'}}
        />

        {/* Filtre hover */}
        <div ref={dropdownRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} style={{position:'relative'}}>
          <div style={{padding:'7px 14px', borderRadius:'8px', border:'0.5px solid #e5e7eb', fontSize:'13px', background:'white', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px', color:'#111'}}>
            {categoriiActive.length === 0 ? 'Filtre' : `${categoriiActive.length} selectate`}
            <span style={{fontSize:'10px', color:'#888'}}>▼</span>
          </div>

          {dropdownOpen && (
            <div style={{position:'absolute', top:'100%', left:0, background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', boxShadow:'0 4px 16px rgba(0,0,0,0.08)', zIndex:20, padding:'10px', marginTop:'4px', minWidth:'420px'}}>
              <div onClick={() => setCategoriiActive([])} style={{padding:'5px 8px', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', borderBottom:'0.5px solid #e5e7eb', marginBottom:'8px', fontWeight:500, fontSize:'13px', color:'#111'}}>
                <span style={{width:'14px', height:'14px', border:'0.5px solid #e5e7eb', borderRadius:'3px', display:'inline-flex', alignItems:'center', justifyContent:'center', background: categoriiActive.length === 0 ? '#1D9E75' : 'white', color:'white', fontSize:'10px', flexShrink:0}}>
                  {categoriiActive.length === 0 ? '✓' : ''}
                </span>
                Toate categoriile
              </div>
              <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'2px'}}>
                {toateCategoriile.map(cat => (
                  <div key={cat} onClick={() => toggleCategorie(cat)} style={{padding:'5px 8px', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', fontSize:'12px', borderRadius:'6px', background: categoriiActive.includes(cat) ? '#f0fdf8' : 'transparent', color:'#333'}}>
                    <span style={{width:'14px', height:'14px', border:'0.5px solid #e5e7eb', borderRadius:'3px', display:'inline-flex', alignItems:'center', justifyContent:'center', background: categoriiActive.includes(cat) ? '#1D9E75' : 'white', color:'white', fontSize:'10px', flexShrink:0}}>
                      {categoriiActive.includes(cat) ? '✓' : ''}
                    </span>
                    {cat}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Legenda */}
        <div style={{marginLeft:'auto', display:'flex', gap:'16px', fontSize:'13px', color:'#111', fontWeight:500}}>
          <span><span style={{display:'inline-block', width:'11px', height:'11px', background:'#1D9E75', borderRadius:'2px', marginRight:'5px', verticalAlign:'middle'}}></span>Normal/Negativ</span>
          <span><span style={{display:'inline-block', width:'11px', height:'11px', background:'#E24B4A', borderRadius:'2px', marginRight:'5px', verticalAlign:'middle'}}></span>Peste/Pozitiv</span>
          <span><span style={{display:'inline-block', width:'11px', height:'11px', background:'#EF9F27', borderRadius:'2px', marginRight:'5px', verticalAlign:'middle'}}></span>Sub</span>
          <span><span style={{display:'inline-block', width:'11px', height:'11px', background:'#f0f0f0', border:'0.5px dashed #ccc', borderRadius:'2px', marginRight:'5px', verticalAlign:'middle'}}></span>Lipsă</span>
        </div>
      </div>

      {/* Continut */}
      <div style={{flex:1, display:'flex', overflow:'hidden'}}>

        {/* Tabel */}
        <div style={{flex:1, overflow:'auto'}}>
          <table style={{borderCollapse:'collapse', tableLayout:'fixed'}}>
            <colgroup>
              <col style={{width:LABEL_WIDTH}} />
              {toateDatele.map(d => <col key={d} style={{width:COL_WIDTH}} />)}
            </colgroup>
            <thead>
              <tr>
                <th style={{width:LABEL_WIDTH, position:'sticky', top:0, left:0, zIndex:3, background:'white', borderBottom:'0.5px solid #e5e7eb', borderRight:'0.5px solid #e5e7eb'}}></th>
                {toateDatele.map(d => (
                  <th key={d} style={{width:COL_WIDTH, fontSize:'11px', color:'#222', textAlign:'center', fontWeight:500, padding:'8px 4px', position:'sticky', top:0, zIndex:2, background:'white', borderBottom:'0.5px solid #e5e7eb', whiteSpace:'nowrap'}}>
                    {d ? `${d.slice(8)}/${d.slice(5,7)}/${d.slice(2,4)}` : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {numeAfisate.length === 0 ? (
                <tr><td colSpan={toateDatele.length + 1} style={{textAlign:'center', padding:'3rem', color:'#888', fontSize:'13px'}}>Nicio analiză găsită.</td></tr>
              ) : numeAfisate.map(nume => {
                const mapData: Record<string, any> = {}
                grupate[nume].forEach(a => { mapData[a.data_analiza] = a })

                return (
                  <tr key={nume} style={{borderBottom:'0.5px solid #f0f0f0'}}>
                    <td style={{width:LABEL_WIDTH, fontSize:'11px', color:'#222', textAlign:'right', paddingRight:'10px', whiteSpace:'normal', wordWrap:'break-word', lineHeight:1.3, verticalAlign:'middle', position:'sticky', left:0, zIndex:1, background:'white', borderRight:'0.5px solid #e5e7eb'}} title={nume}>
                      {nume}
                    </td>
                    {toateDatele.map(data => {
                      const a = mapData[data]
                      if (!a) return (
                        <td key={data} style={{padding:'2px'}}>
                          <div style={{height:ROW_HEIGHT, background:'#f8f9fa', border:'0.5px dashed #e5e7eb', borderRadius:'4px'}}></div>
                        </td>
                      )
                      const status = getStatus(a.observatii, a.tip_rezultat, a.rezultat_text)
                      const culoare = status === 'normal' || status === 'negativ' ? '#1D9E75' :
                                     status === 'peste' || status === 'pozitiv' ? '#E24B4A' :
                                     status === 'sub' ? '#EF9F27' : '#888'
                      const afisaj = a.tip_rezultat === 'calitativ'
                        ? (a.rezultat_text?.slice(0,3)?.toUpperCase() || '?')
                        : a.valoare

                      return (
                        <td key={data} style={{padding:'2px'}}>
                          <div
                            onClick={() => setSelected(selected?.id === a.id ? null : a)}
                            style={{height:ROW_HEIGHT, background:culoare, borderRadius:'4px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity: selected?.id === a.id ? 0.75 : 1}}
                            title={`${nume}: ${a.tip_rezultat === 'calitativ' ? a.rezultat_text : a.valoare + ' ' + (a.unitate || '')} (${data})`}>
                            <span style={{fontSize:'11px', color:'white', fontWeight:500}}>{afisaj}</span>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Panel detalii */}
        {selected && (
          <div style={{width:'260px', background:'white', borderLeft:'0.5px solid #e5e7eb', padding:'1.25rem', flexShrink:0, overflowY:'auto'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1rem'}}>
              <h3 style={{fontSize:'13px', fontWeight:500, color:'#111', lineHeight:1.4}}>{selected.nume_analiza}</h3>
              <button onClick={() => setSelected(null)} style={{border:'none', background:'none', cursor:'pointer', fontSize:'16px', color:'#888', flexShrink:0}}>×</button>
            </div>

            <div style={{marginBottom:'1rem'}}>
              <span style={{
                display:'inline-flex', padding:'3px 10px', borderRadius:'12px', fontSize:'12px', fontWeight:500,
                background: selectedStatus === 'normal' || selectedStatus === 'negativ' ? '#E1F5EE' : selectedStatus === 'peste' || selectedStatus === 'pozitiv' ? '#FCEBEB' : '#FAEEDA',
                color: selectedStatus === 'normal' || selectedStatus === 'negativ' ? '#085041' : selectedStatus === 'peste' || selectedStatus === 'pozitiv' ? '#A32D2D' : '#854F0B'
              }}>
                {selectedStatus === 'normal' ? '✓ Normal' : selectedStatus === 'negativ' ? '✓ Negativ' : selectedStatus === 'pozitiv' ? '⚠ Pozitiv' : selectedStatus === 'peste' ? '↑ Peste limită' : '↓ Sub limită'}
              </span>
            </div>

            <div style={{marginBottom:'12px'}}>
              <div style={{fontSize:'11px', color:'#888', marginBottom:'3px'}}>Valoare</div>
              <div style={{fontSize:'18px', fontWeight:500, color:'#111'}}>
                {selected.tip_rezultat === 'calitativ' ? selected.rezultat_text : `${selected.valoare} ${selected.unitate || ''}`}
              </div>
            </div>

            {selected.referinta_min && selected.referinta_max && (
              <div style={{marginBottom:'12px'}}>
                <div style={{fontSize:'11px', color:'#888', marginBottom:'3px'}}>Interval normal</div>
                <div style={{fontSize:'13px', color:'#333'}}>{selected.referinta_min} — {selected.referinta_max} {selected.unitate || ''}</div>
                {selectedLab !== 'necunoscut' && (
                  <div style={{fontSize:'11px', color:'#EF9F27', marginTop:'4px'}}>⚠ Interval specific {selectedLab}</div>
                )}
              </div>
            )}

            <div style={{marginBottom:'12px'}}>
              <div style={{fontSize:'11px', color:'#888', marginBottom:'3px'}}>Data · Laborator</div>
              <div style={{fontSize:'12px', color:'#333'}}>{selected.data_analiza}</div>
              <div style={{fontSize:'12px', color:'#555'}}>{selectedLab}</div>
            </div>

            {evolutieSelectata.length > 1 && (
              <div style={{marginBottom:'12px'}}>
                <div style={{fontSize:'11px', color:'#888', marginBottom:'6px'}}>Evoluție ({evolutieSelectata.length} valori)</div>
                <div style={{display:'flex', alignItems:'flex-end', gap:'3px', height:'48px'}}>
                  {evolutieSelectata.map((a: any, i: number) => {
                    const val = parseFloat(a.valoare) || 0
                    const h = maxVal > 0 ? Math.max(4, (val / maxVal) * 48) : 4
                    const s = getStatus(a.observatii, a.tip_rezultat, a.rezultat_text)
                    const c = s === 'normal' ? '#1D9E75' : s === 'peste' ? '#E24B4A' : '#EF9F27'
                    return <div key={i} style={{flex:1, height:`${h}px`, background:c, borderRadius:'2px 2px 0 0'}} title={`${a.valoare} · ${a.data_analiza}`}></div>
                  })}
                </div>
              </div>
            )}

            {selected.pdf_url && (
              <button onClick={() => deschidePDF(selected.pdf_url)} style={{width:'100%', padding:'8px', background:'#f8f9fa', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'12px', color:'#0F6E56', cursor:'pointer', textAlign:'center', fontWeight:500}}>
                📄 Vezi buletinul original
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}