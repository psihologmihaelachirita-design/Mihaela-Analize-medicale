'use client'
import { useState, useEffect } from 'react'
import './globals.css'

function CookieBanner() {
  const [vizibil, setVizibil] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('cookiesAcceptate')) setVizibil(true)
  }, [])

  if (!vizibil) return null

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
      <div style={{ background:'white', borderRadius:'16px', padding:'36px', width:'520px', maxWidth:'90vw', textAlign:'center' }}>
        <div style={{ width:'48px', height:'48px', background:'#E1F5EE', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', color:'#0F6E56', fontSize:'22px', fontWeight:600 }}>✚</div>
        <div style={{ fontSize:'20px', fontWeight:600, color:'#111', marginBottom:'8px' }}>Panoramic MedLog</div>
        <div style={{ fontSize:'14px', color:'#555', marginBottom:'24px', lineHeight:1.6 }}>
          Această platformă folosește cookie-uri esențiale pentru funcționare. Nu folosim cookie-uri de tracking sau publicitate.
        </div>
        <div style={{ fontSize:'13px', color:'#888', marginBottom:'24px' }}>
          Prin continuare confirmi că ai citit și ești de acord cu <a href="/confidentialitate" style={{ color:'#16705a', fontWeight:500 }}>Politica de confidențialitate</a>.
        </div>
        <div style={{ display:'flex', gap:'10px', marginTop:'8px' }}>
          <button onClick={() => { localStorage.setItem('cookiesAcceptate', 'nu'); setVizibil(false) }}
            style={{ flex:1, padding:'14px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'10px', fontSize:'15px', fontWeight:500, cursor:'pointer', color:'#111' }}>
            Refuz
          </button>
          <button onClick={() => { localStorage.setItem('cookiesAcceptate', 'da'); setVizibil(false) }}
            style={{ flex:1, padding:'14px', background:'#16705a', color:'white', border:'none', borderRadius:'10px', fontSize:'15px', fontWeight:600, cursor:'pointer' }}>
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body style={{ margin:0, padding:0, fontFamily:'system-ui, -apple-system, sans-serif', background:'#f8f9fa' }}>
        {children}
        <CookieBanner />
        <footer style={{ background:'white', borderTop:'0.5px solid #e5e7eb', padding:'32px 24px 20px', marginTop:'auto' }}>
          <div style={{ maxWidth:'900px', margin:'0 auto' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'32px', marginBottom:'28px' }}>
              <div>
                <div style={{ fontSize:'11px', fontWeight:600, color:'#555', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:'12px' }}>Produs</div>
                <a href="/" style={{ display:'block', fontSize:'13px', color:'#555', textDecoration:'none', marginBottom:'8px' }}>Despre Panoramic MedLog</a>
                <a href="/#functionalitati" style={{ display:'block', fontSize:'13px', color:'#555', textDecoration:'none', marginBottom:'8px' }}>Funcționalități</a>
                <a href="/pricing" style={{ display:'block', fontSize:'13px', color:'#555', textDecoration:'none', marginBottom:'8px' }}>Prețuri</a>
              </div>
              <div>
                <div style={{ fontSize:'11px', fontWeight:600, color:'#555', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:'12px' }}>Confidențialitate</div>
                <a href="/confidentialitate#politica" style={{ display:'block', fontSize:'13px', color:'#555', textDecoration:'none', marginBottom:'8px' }}>Politica de confidențialitate</a>
                <a href="/confidentialitate#termeni" style={{ display:'block', fontSize:'13px', color:'#555', textDecoration:'none', marginBottom:'8px' }}>Termeni și condiții</a>
                <a href="/confidentialitate#gdpr" style={{ display:'block', fontSize:'13px', color:'#555', textDecoration:'none', marginBottom:'8px' }}>GDPR</a>
              </div>
              <div>
                <div style={{ fontSize:'11px', fontWeight:600, color:'#555', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:'12px' }}>Suport</div>
                <a href="/contact" style={{ display:'block', fontSize:'13px', color:'#555', textDecoration:'none', marginBottom:'8px' }}>Contact</a>
                <a href="/faq" style={{ display:'block', fontSize:'13px', color:'#555', textDecoration:'none', marginBottom:'8px' }}>FAQ</a>
                <a href="/contact" style={{ display:'block', fontSize:'13px', color:'#555', textDecoration:'none', marginBottom:'8px' }}>Raportează o problemă</a>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:'20px', borderTop:'0.5px solid #e5e7eb' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <div style={{ width:'24px', height:'24px', background:'#E1F5EE', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color:'#0F6E56', fontSize:'12px', fontWeight:600 }}>✚</div>
                <span style={{ fontSize:'14px', fontWeight:600, color:'#111' }}>Panoramic MedLog</span>
              </div>
              <span style={{ fontSize:'12px', color:'#aaa' }}>© 2026 Panoramic MedLog. Toate drepturile rezervate.</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}