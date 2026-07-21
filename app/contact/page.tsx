'use client'
import { useState } from 'react'
import Link from 'next/link'

const inp: React.CSSProperties = { width:'100%', padding:'9px 13px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', color:'#111', background:'white', outline:'none', fontFamily:'system-ui', boxSizing:'border-box' as const }
const lbl: React.CSSProperties = { display:'block', fontSize:'12px', fontWeight:500, color:'#555', marginBottom:'5px' }

function ContactForm() {
  const [nume, setNume] = useState('')
  const [email, setEmail] = useState('')
  const [mesaj, setMesaj] = useState('')
  const [trimis, setTrimis] = useState(false)

  if (trimis) return (
    <div style={{ padding:'16px', background:'#E1F5EE', borderRadius:'8px', fontSize:'14px', color:'#085041' }}>
      ✓ Mesajul tău a fost trimis. Te vom contacta în cel mai scurt timp.
    </div>
  )

  return (
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
  )
}

function RaportForm() {
  const [nume, setNume] = useState('')
  const [email, setEmail] = useState('')
  const [descriere, setDescriere] = useState('')
  const [fisier, setFisier] = useState<File | null>(null)
  const [trimis, setTrimis] = useState(false)
  const [eroare, setEroare] = useState('')

  if (trimis) return (
    <div style={{ padding:'16px', background:'#E1F5EE', borderRadius:'8px', fontSize:'14px', color:'#085041' }}>
      ✓ Raportul tău a fost trimis. Mulțumim!
    </div>
  )

  return (
    <div>
      {eroare && <div style={{ padding:'12px 16px', background:'#FCEBEB', borderRadius:'8px', fontSize:'13px', color:'#A32D2D', marginBottom:'14px' }}>{eroare}</div>}
      <div style={{ marginBottom:'14px' }}>
        <label style={lbl}>Nume</label>
        <input value={nume} onChange={e => setNume(e.target.value)} placeholder="Numele tău" style={inp} />
      </div>
      <div style={{ marginBottom:'14px' }}>
        <label style={lbl}>Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemplu.ro" style={inp} />
      </div>
      <div style={{ marginBottom:'14px' }}>
        <label style={lbl}>Descriere problemă</label>
        <textarea value={descriere} onChange={e => setDescriere(e.target.value)} placeholder="Descrie ce s-a întâmplat..." style={{ ...inp, height:'120px', resize:'none' as const }} />
      </div>
      <div style={{ marginBottom:'14px' }}>
        <label style={lbl}>Atașament (screenshot, PDF)</label>
        <div style={{ border:'0.5px dashed #e5e7eb', borderRadius:'8px', padding:'16px', textAlign:'center' as const, cursor:'pointer', background:'white' }}
          onClick={() => document.getElementById('file-raport')?.click()}>
          <input id="file-raport" type="file" accept="image/*,.pdf" style={{ display:'none' }} onChange={e => setFisier(e.target.files?.[0] || null)} />
          {fisier ? (
            <div style={{ fontSize:'13px', color:'#16705a', fontWeight:500 }}>✓ {fisier.name}</div>
          ) : (
            <div style={{ fontSize:'13px', color:'#aaa' }}>Click pentru a atașa un fișier</div>
          )}
        </div>
      </div>
      <button onClick={() => {
        const azi = new Date().toDateString()
        const key = 'raport_count_' + azi
        const count = parseInt(localStorage.getItem(key) || '0')
        if (count >= 5) { setEroare('Ai atins limita de 5 rapoarte pe zi.'); return }
        localStorage.setItem(key, String(count + 1))
        setTrimis(true)
      }} style={{ padding:'10px 24px', background:'#16705a', color:'white', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:500, cursor:'pointer' }}>Trimite raport</button>
    </div>
  )
}

export default function Contact() {
  return (
    <div style={{ fontFamily:'system-ui,-apple-system,sans-serif', background:'#f8f9fa', minHeight:'100vh' }}>

      <div style={{ background:'white', borderBottom:'0.5px solid #e5e7eb', padding:'0 24px', height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:'10px', textDecoration:'none' }}>
          <div style={{ width:'32px', height:'32px', background:'#E1F5EE', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', color:'#0F6E56', fontSize:'16px', fontWeight:600 }}>✚</div>
          <span style={{ fontSize:'18px', fontWeight:600, color:'#111' }}>Panoramic MedLog</span>
        </Link>
      </div>

      <div style={{ maxWidth:'720px', margin:'0 auto', padding:'48px 24px' }}>

        <h1 style={{ fontSize:'28px', fontWeight:600, color:'#111', marginBottom:'8px' }}>Suport</h1>
        <p style={{ fontSize:'14px', color:'#555', marginBottom:'48px' }}>Suntem aici să te ajutăm.</p>

        <div id="contact" style={{ marginBottom:'48px' }}>
          <h2 style={{ fontSize:'20px', fontWeight:600, color:'#111', marginBottom:'16px', paddingTop:'16px', borderTop:'0.5px solid #e5e7eb' }}>Contact</h2>
          <ContactForm />
        </div>

        <div id="faq" style={{ marginBottom:'48px' }}>
          <h2 style={{ fontSize:'20px', fontWeight:600, color:'#111', marginBottom:'16px', paddingTop:'16px', borderTop:'0.5px solid #e5e7eb' }}>Întrebări frecvente</h2>
          {[
            { q:'Ce este Panoramic MedLog?', r:'Panoramic MedLog este un agregator independent de date medicale personale. Poți uploada buletine de analize, vizualiza evoluția lor în timp și crea un card de urgență medical.' },
            { q:'Datele mele sunt în siguranță?', r:'Da. Datele sunt stocate securizat pe servere în UE, cu autentificare și RLS activat. Nu vindem și nu partajăm datele tale cu terți.' },
            { q:'Pot exporta datele mele?', r:'Da, din pagina Profil → Export date poți descărca un PDF complet cu dosarul tău medical.' },
            { q:'Panoramic MedLog înlocuiește medicul?', r:'Nu. Panoramic MedLog este un instrument de organizare personală. Orice decizie medicală aparține exclusiv medicului curant.' },
            { q:'Cum șterg contul?', r:'Din pagina Profil → Confidențialitate → Ștergere cont. Toate datele tale vor fi șterse permanent.' },
          ].map((item, i) => (
            <div key={i} style={{ marginBottom:'20px' }}>
              <div style={{ fontSize:'14px', fontWeight:600, color:'#111', marginBottom:'6px' }}>{item.q}</div>
              <div style={{ fontSize:'14px', color:'#555', lineHeight:1.8 }}>{item.r}</div>
            </div>
          ))}
        </div>

        <div id="raport" style={{ marginBottom:'48px' }}>
          <h2 style={{ fontSize:'20px', fontWeight:600, color:'#111', marginBottom:'16px', paddingTop:'16px', borderTop:'0.5px solid #e5e7eb' }}>Raportează o problemă</h2>
          <p style={{ fontSize:'14px', color:'#555', lineHeight:1.8, marginBottom:'16px' }}>
            Ai întâlnit o eroare sau un comportament neașteptat? Descrie problema și atașează un screenshot dacă e posibil.
          </p>
          <RaportForm />
        </div>

      </div>
    </div>
  )
}