'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const CATEGORII: Record<string, string[]> = {
  'Sânge': ['leucocite', 'hemoglobina', 'hematocrit', 'trombocite', 'eritrocite', 'vsh', 'reticulocite', 'volum eritrocitar', 'volum trombocitar', 'concentratie medie', 'hemoglobina eritrocitara', 'largimea', 'granulocite'],
  'Metabolism': ['glicemie', 'glucoza', 'colesterol', 'trigliceride', 'hdl', 'ldl', 'insulina', 'homa', 'amilaza', 'lipaza'],
  'Ficat': ['tgo', 'tgp', 'alt', 'ast', 'ggt', 'bilirubina', 'fosfataza', 'fibrinogen', 'protrombina', 'inr', 'aptt'],
  'Rinichi': ['creatinina', 'uree', 'acid uric', 'egfr', 'sodiu', 'potasiu', 'calciu', 'magneziu', 'fosfor', 'fier'],
  'Tiroidă': ['tsh', 't3', 't4', 'ft3', 'ft4', 'anti tpo', 'anti-tpo', 'tiroglobulina', 'anti tiroglobulina'],
  'Vitamine': ['vitamina', 'feritina', 'b12', 'folat', 'homocisteina'],
  'Hormoni': ['testosteron', 'dhea', 'cortizol', 'insulina', 'pth', 'parathormon'],
  'Imunologie': ['igg', 'igm', 'iga', 'anticorp', 'virus', 'toxoplasma', 'citomegalovirus', 'epstein', 'crp', 'proteina c']
}

function getCategorieAnaliza(nume: string): string {
  const numeLower = nume.toLowerCase()
  for (const [cat, termeni] of Object.entries(CATEGORII)) {
    if (termeni.some(t => numeLower.includes(t))) return cat
  }
  return 'Altele'
}

function getStatus(observatii: string): string {
  if (observatii?.includes('peste')) return 'peste'
  if (observatii?.includes('sub')) return 'sub'
  return 'normal'
}

export default function Panoramic() {
  const [analize, setAnalize] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [categorieActiva, setCategorieActiva] = useState('Toate')
  const [selected, setSelected] = useState<any>(null)
  const [filtreVisible, setFiltreVisible] = useState(true)
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
  const toateCategoriile = ['Toate', ...Object.keys(CATEGORII), 'Altele']

  const numeAfisate = Object.keys(grupate).filter(nume => {
    if (categorieActiva === 'Toate') return true
    return getCategorieAnaliza(nume) === categorieActiva
  })

  const COL_WIDTH = 85
  const ROW_HEIGHT = 23
  const LABEL_WIDTH = 140

  return (
    <main style={{fontFamily:'Arial', padding:'0.75rem'}}>
      {/* Header compact */}
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.75rem'}}>
        <div style={{display:'flex', alignItems:'center', gap:'0.75rem'}}>
          <Link href="/dashboard" style={{color:'#0070f3', textDecoration:'none', fontSize:'13px'}}>← Dosar</Link>
          <span style={{fontSize:'1rem', fontWeight:500}}>📊 Panoramic</span>
        </div>
        <button
          onClick={() => setFiltreVisible(!filtreVisible)}
          style={{fontSize:'12px', padding:'4px 10px', border:'1px solid #ddd', borderRadius:20, background:'white', cursor:'pointer', color:'#555'}}>
          {filtreVisible ? '▲ Ascunde filtre' : '▼ Filtre'}
        </button>
      </div>

      {/* Filtre colapsabile */}
      {filtreVisible && (
        <div>
          <div style={{display:'flex', gap:'1rem', marginBottom:'0.5rem', fontSize:'12px', flexWrap:'wrap'}}>
            <span><span style={{display:'inline-block', width:12, height:12, background:'#1D9E75', borderRadius:2, marginRight:4, verticalAlign:'middle'}}></span>Normal</span>
            <span><span style={{display:'inline-block', width:12, height:12, background:'#E24B4A', borderRadius:2, marginRight:4, verticalAlign:'middle'}}></span>Peste</span>
            <span><span style={{display:'inline-block', width:12, height:12, background:'#EF9F27', borderRadius:2, marginRight:4, verticalAlign:'middle'}}></span>Sub</span>
            <span><span style={{display:'inline-block', width:12, height:12, background:'#f0f0f0', border:'1px dashed #ddd', borderRadius:2, marginRight:4, verticalAlign:'middle'}}></span>Lipsă</span>
          </div>
          <div style={{display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'0.75rem'}}>
            {toateCategoriile.map(cat => (
              <button key={cat} onClick={() => setCategorieActiva(cat)}
                style={{padding:'3px 10px', borderRadius:20, fontSize:12, border:'1px solid #ddd', cursor:'pointer',
                  background: categorieActiva === cat ? '#0070f3' : 'white',
                  color: categorieActiva === cat ? 'white' : '#555'}}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabel cu freeze */}
      <div style={{overflow:'auto', maxHeight: filtreVisible ? 'calc(100vh - 220px)' : 'calc(100vh - 100px)'}}>
        <table style={{borderCollapse:'collapse', tableLayout:'fixed'}}>
          <colgroup>
            <col style={{width:LABEL_WIDTH}} />
            {toateDatele.map(d => (
              <col key={d} style={{width:COL_WIDTH}} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th style={{
                width:LABEL_WIDTH,
                position:'sticky',
                top:0,
                left:0,
                zIndex:3,
                background:'white',
                borderBottom:'2px solid #eee'
              }}></th>
              {toateDatele.map(d => (
                <th key={d} style={{
                  width:COL_WIDTH,
                  fontSize:11,
                  color:'#555',
                  textAlign:'center',
                  fontWeight:'500',
                  paddingBottom:4,
                  paddingTop:4,
                  position:'sticky',
                  top:0,
                  zIndex:2,
                  background:'white',
                  borderBottom:'2px solid #eee',
                  whiteSpace:'nowrap'
                }}>
                  {d ? `${d.slice(8)}/${d.slice(5,7)}/${d.slice(2,4)}` : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {numeAfisate.length === 0 ? (
              <tr><td colSpan={toateDatele.length + 1} style={{textAlign:'center', padding:'2rem', color:'#888'}}>Nicio analiză în această categorie.</td></tr>
            ) : (
              numeAfisate.map(nume => {
                const analizeNume = grupate[nume]
                const mapData: Record<string, any> = {}
                analizeNume.forEach(a => { mapData[a.data_analiza] = a })

                return (
                  <tr key={nume}>
                    <td style={{
                      width:LABEL_WIDTH,
                      fontSize:11,
                      color:'#333',
                      textAlign:'right',
                      paddingRight:8,
                      whiteSpace:'normal',
                      wordWrap:'break-word',
                      lineHeight:1.3,
                      verticalAlign:'middle',
                      position:'sticky',
                      left:0,
                      zIndex:1,
                      background:'white',
                      borderRight:'1px solid #eee'
                    }} title={nume}>
                      {nume}
                    </td>
                    {toateDatele.map(data => {
                      const a = mapData[data]
                      if (!a) return (
                        <td key={data} style={{padding:2}}>
                          <div style={{height:ROW_HEIGHT, background:'#f0f0f0', border:'1px dashed #ddd', borderRadius:4}}></div>
                        </td>
                      )
                      const status = getStatus(a.observatii)
                      const culoare = status === 'normal' ? '#1D9E75' : status === 'peste' ? '#E24B4A' : '#EF9F27'
                      return (
                        <td key={data} style={{padding:2}}>
                          <div
                            onClick={() => setSelected(selected?.id === a.id ? null : a)}
                            style={{height:ROW_HEIGHT, background:culoare, borderRadius:4, cursor:'pointer',
                              display:'flex', alignItems:'center', justifyContent:'center',
                              opacity: selected?.id === a.id ? 0.7 : 1}}
                            title={`${nume}: ${a.valoare} ${a.unitate} (${data})`}>
                            <span style={{fontSize:12, color:'white', fontWeight:'bold'}}>{a.valoare}</span>
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
            <div>Valoare: <strong>{selected.valoare} {selected.unitate}</strong></div>
            <div>Data: {selected.data_analiza}</div>
            <div style={{marginTop:6, color: getStatus(selected.observatii) === 'normal' ? '#1D9E75' : getStatus(selected.observatii) === 'peste' ? '#E24B4A' : '#EF9F27', fontWeight:500}}>
              {getStatus(selected.observatii) === 'normal' ? '✓ Normal' : getStatus(selected.observatii) === 'peste' ? '↑ Peste limită' : '↓ Sub limită'}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}