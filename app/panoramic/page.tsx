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

export default function Panoramic() {
  const [analize, setAnalize] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [categoriiActive, setCategoriiActive] = useState<string[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const hoverTimeout = useRef<any>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      const { data } = await supabase
        .from('analize')
        .select('*')
        .eq('user_id', session.user.id)
        .order('data_analiza', { ascending: true })
      setAnalize(data || [])
      setLoading(false)
    })
  }, [])

  if (loading) return <p style={{fontFamily:'Arial', padding:'2rem'}}>Se încarcă...</p>

  const grupate: Record<string, any[]> = {}
  analize.forEach(a => {
    if (!grupate[a.nume_analiza]) grupate[a.nume_analiza] = []
    grupate[a.nume_analiza].push(a)
  })

  const toateDatele = [...new Set(analize.map(a => a.data_analiza))].sort()
  const toateCategoriile = [...Object.keys(CATEGORII), 'Altele']

  function toggleCategorie(cat: string) {
    setCategoriiActive(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  function selectAll() { setCategoriiActive([]) }

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

  return (
    <main style={{fontFamily:'Arial', padding:'0.75rem'}}>
      {/* Header */}
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.75rem'}}>
        <div style={{display:'flex', alignItems:'center', gap:'0.75rem'}}>
          <Link href="/dashboard" style={{color:'#0070f3', textDecoration:'none', fontSize:'13px'}}>← Dosar</Link>
          <span style={{fontSize:'1rem', fontWeight:500}}>📊 Panoramic</span>
        </div>
      </div>

      {/* Search + Filtre pe acelasi rand */}
      <div style={{display:'flex', gap:'8px', marginBottom:'0.5rem', alignItems:'center'}}>
        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Caută analiză..."
          style={{flex:1, padding:'7px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:13, outline:'none'}}
        />

        {/* Filtre cu hover */}
        <div
          ref={dropdownRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{position:'relative', flexShrink:0}}>
          <div style={{
            padding:'7px 12px',
            borderRadius:8,
            border:'1px solid #ddd',
            fontSize:13,
            background:'white',
            cursor:'pointer',
            display:'flex',
            alignItems:'center',
            gap:6,
            whiteSpace:'nowrap'
          }}>
            {/* Categorii active vizibile */}
            {categoriiActive.length === 0 ? (
              <span style={{color:'#555'}}>Filtre ▼</span>
            ) : (
              <>
                {categoriiActive.slice(0, 2).map(cat => (
                  <span key={cat} style={{background:'#0070f3', color:'white', padding:'2px 8px', borderRadius:12, fontSize:11}}>
                    {cat}
                  </span>
                ))}
                {categoriiActive.length > 2 && (
                  <span style={{background:'#eee', color:'#555', padding:'2px 8px', borderRadius:12, fontSize:11}}>
                    +{categoriiActive.length - 2}
                  </span>
                )}
                <span style={{color:'#555'}}>▼</span>
              </>
            )}
          </div>

          {/* Panel cu grid categorii */}
          {dropdownOpen && (
            <div style={{
              position:'absolute',
              top:'100%',
              right:0,
              background:'white',
              border:'1px solid #ddd',
              borderRadius:8,
              boxShadow:'0 4px 16px rgba(0,0,0,0.12)',
              zIndex:20,
              padding:'10px',
              marginTop:4,
              minWidth:420
            }}>
              {/* Toate */}
              <div
                onClick={selectAll}
                style={{padding:'5px 8px', cursor:'pointer', display:'flex', alignItems:'center', gap:6, borderBottom:'1px solid #eee', marginBottom:8, fontWeight:500, fontSize:12}}>
                <span style={{width:14, height:14, border:'1px solid #ddd', borderRadius:3, display:'inline-flex', alignItems:'center', justifyContent:'center', background: categoriiActive.length === 0 ? '#0070f3' : 'white', color:'white', fontSize:10, flexShrink:0}}>
                  {categoriiActive.length === 0 ? '✓' : ''}
                </span>
                Toate categoriile
              </div>

              {/* Grid 3 coloane */}
              <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'3px'}}>
                {toateCategoriile.map(cat => (
                  <div
                    key={cat}
                    onClick={() => toggleCategorie(cat)}
                    style={{
                      padding:'5px 8px',
                      cursor:'pointer',
                      display:'flex',
                      alignItems:'center',
                      gap:6,
                      fontSize:12,
                      borderRadius:6,
                      background: categoriiActive.includes(cat) ? '#f0f7ff' : 'transparent'
                    }}>
                    <span style={{
                      width:14, height:14,
                      border:'1px solid #ddd',
                      borderRadius:3,
                      display:'inline-flex',
                      alignItems:'center',
                      justifyContent:'center',
                      background: categoriiActive.includes(cat) ? '#0070f3' : 'white',
                      color:'white',
                      fontSize:10,
                      flexShrink:0
                    }}>
                      {categoriiActive.includes(cat) ? '✓' : ''}
                    </span>
                    {cat}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legenda */}
      <div style={{display:'flex', gap:'1rem', marginBottom:'0.5rem', fontSize:'11px', flexWrap:'wrap'}}>
        <span><span style={{display:'inline-block', width:10, height:10, background:'#1D9E75', borderRadius:2, marginRight:3, verticalAlign:'middle'}}></span>Normal/Negativ</span>
        <span><span style={{display:'inline-block', width:10, height:10, background:'#E24B4A', borderRadius:2, marginRight:3, verticalAlign:'middle'}}></span>Peste/Pozitiv</span>
        <span><span style={{display:'inline-block', width:10, height:10, background:'#EF9F27', borderRadius:2, marginRight:3, verticalAlign:'middle'}}></span>Sub limită</span>
        <span><span style={{display:'inline-block', width:10, height:10, background:'#f0f0f0', border:'1px dashed #ccc', borderRadius:2, marginRight:3, verticalAlign:'middle'}}></span>Lipsă</span>
      </div>

      {/* Tabel */}
      <div style={{overflow:'auto', maxHeight:'calc(100vh - 160px)'}}>
        <table style={{borderCollapse:'collapse', tableLayout:'fixed'}}>
          <colgroup>
            <col style={{width:LABEL_WIDTH}} />
            {toateDatele.map(d => (
              <col key={d} style={{width:COL_WIDTH}} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th style={{width:LABEL_WIDTH, position:'sticky', top:0, left:0, zIndex:3, background:'white', borderBottom:'2px solid #eee'}}></th>
              {toateDatele.map(d => (
                <th key={d} style={{width:COL_WIDTH, fontSize:11, color:'#555', textAlign:'center', fontWeight:'500', paddingBottom:4, paddingTop:4, position:'sticky', top:0, zIndex:2, background:'white', borderBottom:'2px solid #eee', whiteSpace:'nowrap'}}>
                  {d ? `${d.slice(8)}/${d.slice(5,7)}/${d.slice(2,4)}` : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {numeAfisate.length === 0 ? (
              <tr><td colSpan={toateDatele.length + 1} style={{textAlign:'center', padding:'2rem', color:'#888'}}>Nicio analiză găsită.</td></tr>
            ) : (
              numeAfisate.map(nume => {
                const analizeNume = grupate[nume]
                const mapData: Record<string, any> = {}
                analizeNume.forEach(a => { mapData[a.data_analiza] = a })

                return (
                  <tr key={nume}>
                    <td style={{width:LABEL_WIDTH, fontSize:11, color:'#333', textAlign:'right', paddingRight:8, whiteSpace:'normal', wordWrap:'break-word', lineHeight:1.3, verticalAlign:'middle', position:'sticky', left:0, zIndex:1, background:'white', borderRight:'1px solid #eee'}} title={nume}>
                      {nume}
                    </td>
                    {toateDatele.map(data => {
                      const a = mapData[data]
                      if (!a) return (
                        <td key={data} style={{padding:2}}>
                          <div style={{height:ROW_HEIGHT, background:'#f0f0f0', border:'1px dashed #ddd', borderRadius:4}}></div>
                        </td>
                      )
                      const status = getStatus(a.observatii, a.tip_rezultat, a.rezultat_text)
                      const culoare = status === 'normal' || status === 'negativ' ? '#1D9E75' :
                                     status === 'peste' || status === 'pozitiv' ? '#E24B4A' :
                                     status === 'sub' ? '#EF9F27' : '#888'
                      const afisaj = a.tip_rezultat === 'calitativ'
                        ? (a.rezultat_text?.slice(0, 3)?.toUpperCase() || '?')
                        : a.valoare

                      return (
                        <td key={data} style={{padding:2}}>
                          <div
                            onClick={() => setSelected(selected?.id === a.id ? null : a)}
                            style={{height:ROW_HEIGHT, background:culoare, borderRadius:4, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity: selected?.id === a.id ? 0.7 : 1}}
                            title={`${nume}: ${a.tip_rezultat === 'calitativ' ? a.rezultat_text : a.valoare + ' ' + (a.unitate || '')} (${data})`}>
                            <span style={{fontSize:12, color:'white', fontWeight:'bold'}}>{afisaj}</span>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div style={{position:'fixed', bottom:20, right:20, background:'white', border:'1px solid #ddd', borderRadius:12, padding:'1rem', minWidth:220, boxShadow:'0 4px 20px rgba(0,0,0,0.1)', zIndex:100}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
            <strong style={{fontSize:13}}>{selected.nume_analiza}</strong>
            <button onClick={() => setSelected(null)} style={{border:'none', background:'none', cursor:'pointer', fontSize:16}}>×</button>
          </div>
          <div style={{fontSize:12, color:'#555'}}>
            {selected.tip_rezultat === 'calitativ' ? (
              <div>Rezultat: <strong>{selected.rezultat_text}</strong></div>
            ) : (
              <>
                <div>Valoare: <strong>{selected.valoare} {selected.unitate}</strong></div>
                {selected.referinta_min && selected.referinta_max && (
                  <div style={{color:'#888'}}>Ref: {selected.referinta_min} — {selected.referinta_max} {selected.unitate}</div>
                )}
              </>
            )}
            <div>Data: {selected.data_analiza}</div>
            <div style={{marginTop:6, fontWeight:500, color:
              ['normal','negativ'].includes(getStatus(selected.observatii, selected.tip_rezultat, selected.rezultat_text)) ? '#1D9E75' : '#E24B4A'}}>
              {getStatus(selected.observatii, selected.tip_rezultat, selected.rezultat_text) === 'normal' ? '✓ Normal' :
               getStatus(selected.observatii, selected.tip_rezultat, selected.rezultat_text) === 'negativ' ? '✓ Negativ' :
               getStatus(selected.observatii, selected.tip_rezultat, selected.rezultat_text) === 'pozitiv' ? '⚠ Pozitiv' :
               getStatus(selected.observatii, selected.tip_rezultat, selected.rezultat_text) === 'peste' ? '↑ Peste limită' :
               getStatus(selected.observatii, selected.tip_rezultat, selected.rezultat_text) === 'sub' ? '↓ Sub limită' : '— Necunoscut'}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}