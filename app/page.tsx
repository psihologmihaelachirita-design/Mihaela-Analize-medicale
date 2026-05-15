import Link from 'next/link'

export default function Home() {
  return (
    <div style={{fontFamily:'system-ui,-apple-system,sans-serif', minHeight:'100vh', background:'white', display:'flex', flexDirection:'column'}}>
      <nav style={{padding:'0 24px', height:'60px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'0.5px solid #e5e7eb'}}>
        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
          <div style={{width:'28px', height:'28px', background:'#E1F5EE', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color:'#0F6E56', fontSize:'15px', fontWeight:500}}>✚</div>
          <span style={{fontSize:'18px', fontWeight:500, color:'#111'}}>MedFile</span>
        </div>
        <div style={{display:'flex', gap:'10px'}}>
          <Link href="/login" style={{padding:'8px 18px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'14px', color:'#111', textDecoration:'none', fontWeight:500}}>
            Intră în cont
          </Link>
          <Link href="/register" style={{padding:'8px 18px', background:'#1D9E75', borderRadius:'8px', fontSize:'14px', color:'white', textDecoration:'none', fontWeight:500}}>
            Cont nou
          </Link>
        </div>
      </nav>

      <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'4rem 2rem', textAlign:'center'}}>
        <div style={{display:'inline-flex', alignItems:'center', gap:'6px', background:'#E1F5EE', color:'#0F6E56', padding:'6px 14px', borderRadius:'20px', fontSize:'13px', fontWeight:500, marginBottom:'2rem'}}>
          ✓ Agregator independent de date medicale
        </div>
        <h1 style={{fontSize:'44px', fontWeight:500, lineHeight:1.2, marginBottom:'1.5rem', maxWidth:'680px', color:'#111'}}>
          Toate analizele tale,<br/>
          <span style={{color:'#1D9E75'}}>într-o singură privire</span>
        </h1>
        <p style={{fontSize:'17px', color:'#555', maxWidth:'520px', lineHeight:1.7, marginBottom:'2.5rem'}}>
          Uploadează orice buletin din orice laborator. Platforma extrage automat valorile și le vizualizează panoramic cu evoluție în timp.
        </p>
        <div style={{display:'flex', gap:'12px', marginBottom:'4rem'}}>
          <Link href="/register" style={{padding:'13px 28px', background:'#1D9E75', color:'white', borderRadius:'10px', fontSize:'15px', fontWeight:500, textDecoration:'none'}}>
            Începe gratuit
          </Link>
          <Link href="/login" style={{padding:'13px 28px', border:'0.5px solid #e5e7eb', color:'#111', borderRadius:'10px', fontSize:'15px', textDecoration:'none', fontWeight:500}}>
            Am deja cont
          </Link>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', maxWidth:'780px', width:'100%'}}>
          {[
            {icon:'📄', titlu:'Orice laborator', desc:'Synevo, Bioclinica, Regina Maria, spitale de stat — orice PDF'},
            {icon:'📊', titlu:'Vizualizare panoramică', desc:'Toate analizele pe o axă temporală unică cu lacunele vizibile'},
            {icon:'🔒', titlu:'Date securizate', desc:'Stocat în Europa, acces doar al tău, GDPR compliant'},
          ].map((f,i) => (
            <div key={i} style={{background:'#f8f9fa', border:'0.5px solid #e5e7eb', borderRadius:'12px', padding:'1.5rem', textAlign:'left'}}>
              <div style={{fontSize:'24px', marginBottom:'8px'}}>{f.icon}</div>
              <div style={{fontSize:'14px', fontWeight:500, marginBottom:'6px', color:'#111'}}>{f.titlu}</div>
              <div style={{fontSize:'13px', color:'#888', lineHeight:1.6}}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}