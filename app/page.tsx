import Link from 'next/link'

export default function Home() {
  return (
    <main style={{minHeight:'100vh', background:'white', display:'flex', flexDirection:'column', fontFamily:'system-ui,-apple-system,sans-serif'}}>

      {/* Nav */}
      <nav style={{padding:'0 2rem', height:'60px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'0.5px solid #e5e7eb', position:'sticky', top:0, background:'white', zIndex:10}}>
        <Link href="/" style={{textDecoration:'none', display:'flex', flexDirection:'column'}}>
          <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
            <div style={{width:'28px', height:'28px', background:'#E1F5EE', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color:'#16705a', fontSize:'15px', fontWeight:500}}>✚</div>
            <span style={{fontSize:'16px', fontWeight:500, color:'#111'}}>MedFile</span>
          </div>
          <span style={{fontSize:'10px', color:'#888', marginLeft:'36px'}}>Dosar medical agregat</span>
        </Link>
        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
          <Link href="/pricing" style={{fontSize:'14px', color:'#555', textDecoration:'none', fontWeight:500}}>Prețuri</Link>
          <Link href="/login" style={{padding:'8px 18px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'14px', color:'#555', textDecoration:'none'}}>
            Intră în cont
          </Link>
          <Link href="/register" style={{padding:'8px 18px', background:'#16705a', borderRadius:'8px', fontSize:'14px', color:'white', fontWeight:500, textDecoration:'none'}}>
            Cont nou
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'5rem 2rem 3rem', textAlign:'center'}}>
        <div style={{display:'inline-flex', alignItems:'center', gap:'6px', background:'#E1F5EE', color:'#16705a', padding:'6px 14px', borderRadius:'20px', fontSize:'13px', fontWeight:500, marginBottom:'2rem'}}>
          ✓ Agregator independent de date medicale
        </div>
        <h1 style={{fontSize:'48px', fontWeight:500, lineHeight:1.2, marginBottom:'1.5rem', maxWidth:'700px', color:'#111'}}>
          Toate analizele tale,<br/>
          <span style={{color:'#16705a'}}>într-o singură privire</span>
        </h1>
        <p style={{fontSize:'18px', color:'#555', maxWidth:'560px', lineHeight:1.7, marginBottom:'2.5rem'}}>
          Uploadează orice buletin din orice laborator. Platforma extrage automat valorile și le vizualizează panoramic cu evoluție în timp.
        </p>
        <div style={{display:'flex', gap:'12px', marginBottom:'5rem'}}>
          <Link href="/register" style={{padding:'14px 28px', background:'#16705a', color:'white', borderRadius:'10px', fontSize:'15px', fontWeight:500, textDecoration:'none'}}>
            Începe gratuit
          </Link>
          <Link href="/login" style={{padding:'14px 28px', border:'0.5px solid #e5e7eb', color:'#555', borderRadius:'10px', fontSize:'15px', textDecoration:'none'}}>
            Am deja cont
          </Link>
        </div>

        {/* Features */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'16px', maxWidth:'800px', width:'100%', marginBottom:'5rem'}}>
          {[
            {icon:'📄', titlu:'Orice laborator', desc:'Synevo, Bioclinica, Regina Maria, spitale de stat — orice PDF'},
            {icon:'📊', titlu:'Vizualizare panoramică', desc:'Toate analizele pe o axă temporală unică cu lacunele vizibile'},
            {icon:'🔒', titlu:'Date securizate', desc:'Stocat în Europa, acces doar al tău, GDPR compliant'},
          ].map((f, i) => (
            <div key={i} style={{background:'#f8f9fa', border:'0.5px solid #e5e7eb', borderRadius:'12px', padding:'1.5rem', textAlign:'left'}}>
              <div style={{fontSize:'24px', marginBottom:'8px'}}>{f.icon}</div>
              <div style={{fontSize:'14px', fontWeight:500, marginBottom:'6px', color:'#111'}}>{f.titlu}</div>
              <div style={{fontSize:'13px', color:'#888', lineHeight:1.6}}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Preturi scurte */}
        <div style={{maxWidth:'600px', width:'100%', marginBottom:'2rem'}}>
          <h2 style={{fontSize:'24px', fontWeight:500, color:'#111', marginBottom:'8px'}}>Prețuri simple și transparente</h2>
          <p style={{fontSize:'14px', color:'#888', marginBottom:'2rem'}}>14 zile gratuit, fără card necesar</p>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'1.5rem'}}>
            <div style={{background:'#f8f9fa', border:'0.5px solid #e5e7eb', borderRadius:'12px', padding:'1.5rem', textAlign:'left'}}>
              <div style={{fontSize:'13px', fontWeight:500, color:'#888', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.5px'}}>Personal</div>
              <div style={{fontSize:'28px', fontWeight:500, color:'#111', marginBottom:'4px'}}>12 lei<span style={{fontSize:'14px', color:'#888', fontWeight:400}}>/lună</span></div>
              <div style={{fontSize:'13px', color:'#16705a', marginBottom:'16px'}}>sau 99 lei/an</div>
              <div style={{fontSize:'13px', color:'#555', lineHeight:1.8}}>
                ✓ 1 dosar medical<br/>
                ✓ Upload nelimitat PDF<br/>
                ✓ Vizualizare panoramică<br/>
                ✓ QR cod urgență
              </div>
            </div>

            <div style={{background:'white', border:'1.5px solid #16705a', borderRadius:'12px', padding:'1.5rem', textAlign:'left', position:'relative'}}>
              <div style={{position:'absolute', top:'-12px', left:'50%', transform:'translateX(-50%)', background:'#16705a', color:'white', padding:'3px 12px', borderRadius:'12px', fontSize:'12px', fontWeight:500, whiteSpace:'nowrap'}}>
                Recomandat
              </div>
              <div style={{fontSize:'13px', fontWeight:500, color:'#888', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.5px'}}>Familie</div>
              <div style={{fontSize:'28px', fontWeight:500, color:'#111', marginBottom:'4px'}}>15 lei<span style={{fontSize:'14px', color:'#888', fontWeight:400}}>/lună</span></div>
              <div style={{fontSize:'13px', color:'#16705a', marginBottom:'16px'}}>sau 119 lei/an</div>
              <div style={{fontSize:'13px', color:'#555', lineHeight:1.8}}>
                ✓ 1 dosar adult + 2 copii<br/>
                ✓ Upload nelimitat PDF<br/>
                ✓ Vizualizare panoramică<br/>
                ✓ QR cod urgență
              </div>
            </div>
          </div>

          <Link href="/pricing" style={{display:'inline-block', fontSize:'14px', color:'#16705a', fontWeight:500, textDecoration:'none'}}>
            Vezi toate detaliile planurilor →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div style={{borderTop:'0.5px solid #e5e7eb', padding:'1.5rem 2rem', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <span style={{fontSize:'13px', color:'#888'}}>© 2026 MedFile</span>
        <span style={{fontSize:'13px', color:'#888'}}>GDPR compliant · Date stocate în Europa</span>
      </div>
    </main>
  )
}