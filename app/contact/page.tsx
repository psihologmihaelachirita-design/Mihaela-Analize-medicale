'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function Contact() {
  const [nume, setNume] = useState('')
  const [email, setEmail] = useState('')
  const [mesaj, setMesaj] = useState('')
  const [trimis, setTrimis] = useState(false)

  const inp: React.CSSProperties = { width:'100%', padding:'9px 13px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#111', background:'white', outline:'none', fontFamily:'system-ui', boxSizing:'border-box' as const }
  const lbl: React.CSSProperties = { display:'block', fontSize:'12px', fontWeight:500, color:'#555', marginBottom:'5px' }

  return (
    <div style={{ fontFamily:'system-ui,-apple-system,sans-serif', background:'#f8f9fa', minHeight:'100vh' }}>

      {/* Topbar */}
      <div style={{ background:'white', borderBottom:'0.5px solid #e5e7eb', padding:'0 24px', height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:'10px', textDecoration:'none' }}>
          <div style={{ width:'32px', height:'32px', background:'#E1F5EE', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', color:'#0F6E56', fontSize:'16px', fontWeight:600 }}>✚</div>
          <span style={{ fontSize:'18px', fontWeight:600, color:'#111' }}>MedFile</span>
        </Link>
      </div>

      <div style={{ maxWidth:'720px', margin:'0 auto', padding:'48px 24px' }}>

        <h1 style={{ fontSize:'28px', fontWeight:600, color:'#111', marginBottom:'8px' }}>Suport</h1>
        <p style={{ fontSize:'14px', color:'#555', marginBottom:'48px' }}>Suntem aici să te ajutăm.</p>

        {/* Contact */}
        <div id="contact" style={{ marginBottom:'48px' }}>
          <h2 style={{ fontSize:'20px', fontWeight:600, color:'#111', marginBottom:'16px', paddingTop:'16px', borderTop:'0.5px solid #e5e7eb' }}>Contact</h2>
          {trimis ? (
            <div style={{ padding:'16px', background:'#E1F5EE', borderRadius:'8px', fontSize:'14px', color:'#085041' }}>
              ✓ Mesajul tău a fost trimis. Te vom contacta în cel mai scurt timp.
            </div>
          ) : (
            <div>
              <div style={{ marginBottom:'14px' }}>
                <label style={lbl}>Nume</label>
                <input value={nume} onChange={e => setNume(e.target.value)} placeholder="Numele tău" style={inp} />
              </div>
              <div style={{ marginBottom:'14px' }}>
                <label style={lbl}>Email</label>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemplu.ro" style={inp} />
              </div>
              <div style={{ marginBottom:'14px' }}>
                <label style={lbl}>Mesaj</label>
                <textarea value={mesaj} onChange={e => setMesaj(e.target.value)} placeholder="Cum te putem ajuta?" style={{ ...inp, height:'120px', resize:'none' as const }} />
              </div>
              <button onClick={() => setTrimis(true)} style={{ padding:'10px 24px', background:'#16705a', color:'white', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:500, cursor:'pointer' }}>Trimite mesaj</button>
            </div>
          )}
        </div>

        {/* FAQ */}
        <div id="faq" style={{ marginBottom:'48px' }}>
          <h2 style={{ fontSize:'20px', fontWeight:600, color:'#111', marginBottom:'16px', paddingTop:'16px', borderTop:'0.5px solid #e5e7eb' }}>Întrebări frecvente</h2>

          {[
            { q:'Ce este MedFile?', r:'MedFile este un agregator independent de date medicale personale. Poți uploada buletine de analize, vizualiza evoluția lor în timp și crea un card de urgență medical.' },
            { q:'Datele mele sunt în siguranță?', r:'Da. Datele sunt stocate securizat pe servere în UE, cu autentificare și RLS activat. Nu vindem și nu partajăm datele tale cu terți.' },
            { q:'Pot exporta datele mele?', r:'Da, din pagina Profil → Export date poți descărca un PDF complet cu dosarul tău medical.' },
            { q:'MedFile înlocuiește medicul?', r:'Nu. MedFile este un instrument de organizare personală. Orice decizie medicală aparține exclusiv medicului curant.' },
            { q:'Cum șterg contul?', r:'Din pagina Profil → Confidențialitate → Ștergere cont. Toate datele tale vor fi șterse permanent.' },
          ].map((item, i) => (
            <div key={i} style={{ marginBottom:'20px' }}>
              <div style={{ fontSize:'14px', fontWeight:600, color:'#111', marginBottom:'6px' }}>{item.q}</div>
              <div style={{ fontSize:'14px', color:'#555', lineHeight:1.8 }}>{item.r}</div>
            </div>
          ))}
        </div>

        {/* Raport */}
        <div id="raport" style={{ marginBottom:'48px' }}>
          <h2 style={{ fontSize:'20px', fontWeight:600, color:'#111', marginBottom:'16px', paddingTop:'16px', borderTop:'0.5px solid #e5e7eb' }}>Raportează o problemă</h2>
          <p style={{ fontSize:'14px', color:'#555', lineHeight:1.8, marginBottom:'16px' }}>
            Ai întâlnit o eroare sau un comportament neașteptat? Trimite-ne un raport și vom rezolva problema cât mai repede.
          </p>
          <a href="mailto:contact@medfile.ro?subject=Raport problemă MedFile" style={{ display:'inline-flex', padding:'10px 24px', background:'white', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#111', textDecoration:'none', fontWeight:500 }}>
            ✉ Trimite raport
          </a>
        </div>

      </div>
    </div>
  )
}