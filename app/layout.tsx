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
        <div style={{ display:'flex', gap:'10px' }}>
          <button onClick={() => { window.location.href = 'https://www.google.com' }}
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
        <footer style={{ background:'#16705a', padding:'24px 24px 16px', marginTop:'auto' }}>
          <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:'32px', marginBottom:'40px' }}>
              <div>
                <div style={{ fontSize:'11px', fontWeight:600, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'16px' }}>Produs</div>
                <ul style={{ listStyle:'none', margin:0, padding:0 }}>
                  <li style={{ marginBottom:'10px' }}><a href="/" style={{ color:'rgba(255,255,255,0.85)', textDecoration:'none', fontSize:'14px' }}>Despre Panoramic MedLog</a></li>
                  <li style={{ marginBottom:'10px' }}><a href="/#functionalitati" style={{ color:'rgba(255,255,255,0.85)', textDecoration:'none', fontSize:'14px' }}>Funcționalități</a></li>
                  <li style={{ marginBottom:'10px' }}><a href="/pricing" style={{ color:'rgba(255,255,255,0.85)', textDecoration:'none', fontSize:'14px' }}>Prețuri</a></li>
                </ul>
              </div>
              <div>
                <div style={{ fontSize:'11px', fontWeight:600, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'16px' }}>Confidențialitate</div>
                <ul style={{ listStyle:'none', margin:0, padding:0 }}>
                  <li style={{ marginBottom:'10px' }}><a href="/confidentialitate#politica" style={{ color:'rgba(255,255,255,0.85)', textDecoration:'none', fontSize:'14px' }}>Politica de confidențialitate</a></li>
                  <li style={{ marginBottom:'10px' }}><a href="/confidentialitate#termeni" style={{ color:'rgba(255,255,255,0.85)', textDecoration:'none', fontSize:'14px' }}>Termeni și condiții</a></li>
                  <li style={{ marginBottom:'10px' }}><a href="/confidentialitate#gdpr" style={{ color:'rgba(255,255,255,0.85)', textDecoration:'none', fontSize:'14px' }}>GDPR</a></li>
                </ul>
              </div>
              <div>
                <div style={{ fontSize:'11px', fontWeight:600, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'16px' }}>Suport</div>
                <ul style={{ listStyle:'none', margin:0, padding:0 }}>
                  <li style={{ marginBottom:'10px' }}><a href="/contact" style={{ color:'rgba(255,255,255,0.85)', textDecoration:'none', fontSize:'14px' }}>Contact</a></li>
                  <li style={{ marginBottom:'10px' }}><a href="/faq" style={{ color:'rgba(255,255,255,0.85)', textDecoration:'none', fontSize:'14px' }}>FAQ</a></li>
                  <li style={{ marginBottom:'10px' }}><a href="/contact" style={{ color:'rgba(255,255,255,0.85)', textDecoration:'none', fontSize:'14px' }}>Raportează o problemă</a></li>
                </ul>
              </div>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
                  <div style={{ width:'36px', height:'36px', background:'rgba(255,255,255,0.15)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', color:'white', fontWeight:600 }}>✚</div>
                  <span style={{ fontSize:'18px', fontWeight:600, color:'white' }}>Panoramic MedLog</span>
                </div>
              </div>
            </div>
            <div style={{ borderTop:'0.5px solid rgba(255,255,255,0.1)', paddingTop:'20px', fontSize:'13px', color:'rgba(255,255,255,0.5)' }}>
              © 2026 Panoramic MedLog. Toate drepturile rezervate.
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}