import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Panoramic MedLog — Dosarul meu medical',
  description: 'Agregator independent de date medicale',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body style={{margin:0, padding:0, fontFamily:'system-ui, -apple-system, sans-serif', background:'#f8f9fa'}}>
        {children}
        <footer style={{background:'white', borderTop:'0.5px solid #e5e7eb', padding:'32px 24px 20px', marginTop:'auto'}}>
          <div style={{maxWidth:'900px', margin:'0 auto'}}>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'32px', marginBottom:'28px'}}>
              <div>
                <div style={{fontSize:'11px', fontWeight:600, color:'#555', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:'12px'}}>Produs</div>
                <a href="/" style={{display:'block', fontSize:'13px', color:'#555', textDecoration:'none', marginBottom:'8px'}}>Despre Panoramic MedLog</a>
                <a href="/#functionalitati" style={{display:'block', fontSize:'13px', color:'#555', textDecoration:'none', marginBottom:'8px'}}>Funcționalități</a>
                <a href="/pricing" style={{display:'block', fontSize:'13px', color:'#555', textDecoration:'none', marginBottom:'8px'}}>Prețuri</a>
              </div>
              <div>
                <div style={{fontSize:'11px', fontWeight:600, color:'#555', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:'12px'}}>Confidențialitate</div>
                <a href="/confidentialitate#politica" style={{display:'block', fontSize:'13px', color:'#555', textDecoration:'none', marginBottom:'8px'}}>Politica de confidențialitate</a>
                <a href="/confidentialitate#termeni" style={{display:'block', fontSize:'13px', color:'#555', textDecoration:'none', marginBottom:'8px'}}>Termeni și condiții</a>
                <a href="/confidentialitate#gdpr" style={{display:'block', fontSize:'13px', color:'#555', textDecoration:'none', marginBottom:'8px'}}>GDPR</a>
              </div>
              <div>
                <div style={{fontSize:'11px', fontWeight:600, color:'#555', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:'12px'}}>Suport</div>
                <a href="/contact" style={{display:'block', fontSize:'13px', color:'#555', textDecoration:'none', marginBottom:'8px'}}>Contact</a>
                <a href="/faq" style={{display:'block', fontSize:'13px', color:'#555', textDecoration:'none', marginBottom:'8px'}}>FAQ</a>
                <a href="/raport" style={{display:'block', fontSize:'13px', color:'#555', textDecoration:'none', marginBottom:'8px'}}>Raportează o problemă</a>
              </div>
            </div>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:'20px', borderTop:'0.5px solid #e5e7eb'}}>
              <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                <div style={{width:'24px', height:'24px', background:'#E1F5EE', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color:'#0F6E56', fontSize:'12px', fontWeight:600}}>✚</div>
                <span style={{fontSize:'14px', fontWeight:600, color:'#111'}}>Panoramic MedLog</span>
              </div>
              <span style={{fontSize:'12px', color:'#aaa'}}>© 2026 Panoramic MedLog. Toate drepturile rezervate.</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}