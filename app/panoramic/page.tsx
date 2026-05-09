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
  'Sânge': ['leucocite', 'hemoglobina', 'hematocrit', 'trombocite', 'eritrocite', 'vsh'],
  'Metabolism': ['glicemie', 'glucoza', 'colesterol', 'trigliceride', 'hdl', 'ldl'],
  'Ficat': ['tgo', 'tgp', 'ggt', 'bilirubina', 'fosfataza'],
  'Rinichi': ['creatinina', 'uree', 'acid uric'],
  'Tiroidă': ['tsh', 't3', 't4', 'ft3', 'ft4', 'anti tpo'],
  'Vitamine': ['vitamina', 'fier', 'feritina', 'b12', 'folat'],
  'Hormoni': ['testosteron', 'dhea', 'cortizol', 'insulina', 'pth'],
  'Imunologie': ['igg', 'igm', 'iga', 'anticorp', 'virus', 'toxoplasma', 'citomegalovirus']
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

  const COL_WIDTH = 70
  const ROW_HEIGHT = 24
  const LABEL_WIDTH = 220

  return (
    <main style={{fontFamily:'Arial', padding:'1.5rem', overflowX:'auto'}}>
      <div style={{display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.5rem'}}>
        <Link href="/dashboard" style={{color:'#0070f3', textDecoration:'none', fontSize:'14px'}}>← Dosar</Link>
        <h1 style={{fontSize:'1.4rem', margin:0}}>📊 Vizualizare panoramică</h1>
      </div>

      <div style={{display:'flex', gap:'1.5rem', marginBottom:'1rem', fontSize:'13px', flexWrap:'wrap'}}>
        <span><span style={{display:'inline-block', width:14, height:14, background:'#1D9E75', borderRadius:3, marginRight:5, verticalAlign:'middle'}}></span>Normal</span>
        <span><span style={{display:'inline-block', width:14, height:14, background:'#E24B4A', borderRadius:3, marginRight:5, verticalAlign:'middle'}}></span>Peste limită</span>
        <span><span style={{display:'inline-block', width:14, height:14, background:'#EF9F27', borderRadius:3, marginRight:5, verticalAlign:'middle'}}></span>Sub limită</span>
        <span><span style={{display:'inline-block', width:14, height:14, background:'#eee', border:'1px dashed #ccc', borderRadius:3, marginRight:5, verticalAlign:'middle'}}></span>Lipsă</span>
      </div>

      <div style={{display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'1.5rem'}}>
        {toateCategoriile.map(cat => (
          <button key={cat} onClick={() => setCategorieActiva(cat)}
            style={{padding:'5px 14px', borderRadius:20, fontSize:13, border:'1px solid #ddd', cursor:'pointer',
              background: categorieActiva === cat ? '#0070f3' : 'white',
              color: categorieActiva === cat ? 'white' : '#555'}}>
            {cat}
          </button>
        ))}
      </div>

      {/* Header date */}
      <div style={{display:'flex', marginBottom:4, marginLeft:LABEL_WIDTH}}>
        {toateDatele.map(d => (
          <div key={d} style={{width:COL_WIDTH, fontSize:11, color:'#555', textAlign:'center', flexShrink:0, fontWeight:'500'}}>
            {d ? `${d.slice(8)}/${d.slice(5,7)}/${d.slice(0,4)}` : ''}
          </div>
        ))}
      </div>

      {/* Grid */}
      {numeAfisate.length === 0 ? (
        <p style={{color:'#888', textAlign:'center', padding:'2rem'}}>Nicio analiză în această categorie.</p>
      ) : (
        numeAfisate.map(nume => {
          const analizeNume = grupate[nume]
          const mapData: Record<string, any> = {}
          analizeNume.forEach(a => { mapData[a.data_analiza] = a })

          return (
            <div key={nume} style={{display:'flex', alignItems:'center', marginBottom:4}}>
              <div style={{width:LABEL_WIDTH, fontSize:12, color:'#333', textAlign:'right', paddingRight:12, flexShrink:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}} title={nume}>
                {nume}
              </div>
              {toateDatele.map(data => {
                const a = mapData[data]
                if (!a) return (
                  <div key={data} style={{width:COL_WIDTH, height:ROW_HEIGHT, background:'#f0f0f0', border:'1px dashed #ddd', borderRadius:4, marginRight:3, flexShrink:0}}></div>
                )
                const status = getStatus(a.observatii)
                const culoare = status === 'normal' ? '#1D9E75' : status === 'peste' ? '#E24B4A' : '#EF9F27'
                return (
                  <div key={data}
                    onClick={() => setSelected(selected?.id === a.id ? null : a)}
                    style={{width:COL_WIDTH, height:ROW_HEIGHT, background:culoare, borderRadius:4, cursor:'pointer', marginRight:3, flexShrink:0,
                      display:'flex', alignItems:'center', justifyContent:'center', opacity: selected?.id === a.id ? 0.7 : 1}}
                    title={`${nume}: ${a.valoare} ${a.unitate} (${data})`}>
                    <span style={{fontSize:12, color:'white', fontWeight:'bold'}}>{a.valoare}</span>
                  </div>
                )
              })}
            </div>
          )
        })
      )}

      {selected && (
        <div style={{position:'fixed', bottom:20, right:20, background:'white', border:'1px solid #ddd', borderRadius:12, padding:'1.2rem', minWidth:240, boxShadow:'0 4px 20px rgba(0,0,0,0.1)', zIndex:100}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
            <strong style={{fontSize:14}}>{selected.nume_analiza}</strong>
            <button onClick={() => setSelected(null)} style={{border:'none', background:'none', cursor:'pointer', fontSize:16}}>×</button>
          </div>
          <div style={{fontSize:13, color:'#555'}}>
            <div>Valoare: <strong>{selected.valoare} {selected.unitate}</strong></div>
            <div>Data: {selected.data_analiza}</div>
            <div style={{marginTop:6, color: getStatus(selected.observatii) === 'normal' ? '#1D9E75' : getStatus(selected.observatii) === 'peste' ? '#E24B4A' : '#EF9F27', fontWeight:500}}>
              {getStatus(selected.observatii) === 'normal' ? '✓ În limite normale' : getStatus(selected.observatii) === 'peste' ? '↑ Peste limită' : '↓ Sub limită'}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}