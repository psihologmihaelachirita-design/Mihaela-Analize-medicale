import Link from 'next/link'

export default function Pricing() {
  return (
    <main style={{minHeight:'100vh', background:'#f8f9fa', fontFamily:'system-ui,-apple-system,sans-serif'}}>

      {/* Nav */}
      <nav style={{padding:'0 2rem', height:'60px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'0.5px solid #e5e7eb', background:'white'}}>
        <Link href="/" style={{textDecoration:'none', display:'flex', flexDirection:'column'}}>
          <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
            <div style={{width:'28px', height:'28px', background:'#E1F5EE', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color:'#16705a', fontSize:'15px', fontWeight:500}}>✚</div>
            <span style={{fontSize:'16px', fontWeight:500, color:'#111'}}>MedFile</span>
          </div>
          <span style={{fontSize:'10px', color:'#888', marginLeft:'36px'}}>Dosar medical agregat</span>
        </Link>
        <div style={{display:'flex', gap:'12px'}}>
          <Link href="/login" style={{padding:'8px 18px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'14px', color:'#555', textDecoration:'none'}}>Intră în cont</Link>
          <Link href="/register" style={{padding:'8px 18px', background:'#16705a', borderRadius:'8px', fontSize:'14px', color:'white', fontWeight:500, textDecoration:'none'}}>Cont nou</Link>
        </div>
      </nav>

      <div style={{maxWidth:'760px', margin:'0 auto', padding:'4rem 2rem'}}>
        <div style={{textAlign:'center', marginBottom:'3rem'}}>
          <h1 style={{fontSize:'36px', fontWeight:500, color:'#111', marginBottom:'12px'}}>Prețuri simple și transparente</h1>
          <p style={{fontSize:'16px', color:'#888'}}>14 zile gratuit, fără card necesar. Anulezi oricând.</p>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px', marginBottom:'3rem'}}>

          {/* Personal */}
          <div style={{background:'white', border:'0.5px solid #e5e7eb', borderRadius:'16px', padding:'2rem'}}>
            <div style={{fontSize:'13px', fontWeight:500, color:'#888', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'12px'}}>Personal</div>
            <div style={{fontSize:'36px', fontWeight:500, color:'#111', marginBottom:'4px'}}>12 lei<span style={{fontSize:'16px', color:'#888', fontWeight:400}}>/lună</span></div>
            <div style={{fontSize:'14px', color:'#16705a', fontWeight:500, marginBottom:'24px'}}>sau 99 lei/an — economisești 45 lei</div>

            <Link href="/register" style={{display:'block', textAlign:'center', padding:'12px', background:'#f8f9fa', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'14px', color:'#111', fontWeight:500, textDecoration:'none', marginBottom:'24px'}}>
              Începe gratuit 14 zile
            </Link>

            <div style={{fontSize:'14px', color:'#555', lineHeight:2}}>
              <div>✓ 1 dosar medical personal</div>
              <div>✓ Upload nelimitat de PDF-uri</div>
              <div>✓ Extragere automată cu AI</div>
              <div>✓ Vizualizare panoramică</div>
              <div>✓ Intervale de referință standard</div>
              <div>✓ QR cod de urgență</div>
              <div>✓ Export PDF dosar</div>
              <div>✓ Date stocate securizat în Europa</div>
            </div>
          </div>

          {/* Familie */}
          <div style={{background:'white', border:'2px solid #16705a', borderRadius:'16px', padding:'2rem', position:'relative'}}>
            <div style={{position:'absolute', top:'-14px', left:'50%', transform:'translateX(-50%)', background:'#16705a', color:'white', padding:'4px 16px', borderRadius:'20px', fontSize:'12px', fontWeight:500, whiteSpace:'nowrap'}}>
              ✓ Recomandat
            </div>
            <div style={{fontSize:'13px', fontWeight:500, color:'#888', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'12px'}}>Familie</div>
            <div style={{fontSize:'36px', fontWeight:500, color:'#111', marginBottom:'4px'}}>15 lei<span style={{fontSize:'16px', color:'#888', fontWeight:400}}>/lună</span></div>
            <div style={{fontSize:'14px', color:'#16705a', fontWeight:500, marginBottom:'24px'}}>sau 119 lei/an — economisești 61 lei</div>

            <Link href="/register" style={{display:'block', textAlign:'center', padding:'12px', background:'#16705a', borderRadius:'8px', fontSize:'14px', color:'white', fontWeight:500, textDecoration:'none', marginBottom:'24px'}}>
              Începe gratuit 14 zile
            </Link>

            <div style={{fontSize:'14px', color:'#555', lineHeight:2}}>
              <div>✓ 1 dosar adult + 2 dosare copii minori</div>
              <div>✓ Upload nelimitat de PDF-uri</div>
              <div>✓ Extragere automată cu AI</div>
              <div>✓ Vizualizare panoramică</div>
              <div>✓ Intervale de referință standard</div>
              <div>✓ QR cod de urgență per dosar</div>
              <div>✓ Export PDF dosar</div>
              <div>✓ Date stocate securizat în Europa</div>
            </div>
          </div>
        </div>

        {/* FAQ scurt */}
        <div style={{background:'white', border:'0.5px solid #e5e7eb', borderRadius:'16px', padding:'2rem'}}>
          <h2 style={{fontSize:'18px', fontWeight:500, color:'#111', marginBottom:'1.5rem'}}>Întrebări frecvente</h2>
          {[
            {q:'Ce se întâmplă după cele 14 zile gratuite?', a:'Vei fi invitat să alegi un plan. Dacă nu alegi, contul rămâne activ dar nu mai poți uploada PDF-uri noi.'},
            {q:'Pot schimba planul oricând?', a:'Da, poți face upgrade sau downgrade oricând din setările contului.'},
            {q:'Datele mele sunt în siguranță?', a:'Da. Datele sunt stocate criptat în Europa, conform GDPR. Nu le vindem și nu le partajăm cu nimeni.'},
            {q:'Ce laboratoare sunt suportate?', a:'Orice laborator din România și internațional care emite buletine în format PDF — Synevo, Bioclinica, Regina Maria, Medicover, Sanador, spitale de stat și altele.'},
          ].map((item, i) => (
            <div key={i} style={{marginBottom:'1rem', paddingBottom:'1rem', borderBottom: i < 3 ? '0.5px solid #f0f0f0' : 'none'}}>
              <div style={{fontSize:'14px', fontWeight:500, color:'#111', marginBottom:'4px'}}>{item.q}</div>
              <div style={{fontSize:'13px', color:'#888', lineHeight:1.6}}>{item.a}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{borderTop:'0.5px solid #e5e7eb', padding:'1.5rem 2rem', display:'flex', justifyContent:'space-between', alignItems:'center', background:'white'}}>
        <span style={{fontSize:'13px', color:'#888'}}>© 2026 MedFile</span>
        <span style={{fontSize:'13px', color:'#888'}}>GDPR compliant · Date stocate în Europa</span>
      </div>
    </main>
  )
}