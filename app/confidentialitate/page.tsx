'use client'
import Link from 'next/link'

export default function Confidentialitate() {
  return (
    <div style={{ fontFamily:'system-ui,-apple-system,sans-serif', background:'#f8f9fa', minHeight:'100vh' }}>

      {/* Topbar */}
      <div style={{ background:'white', borderBottom:'0.5px solid #e5e7eb', padding:'0 24px', height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:'10px', textDecoration:'none' }}>
          <div style={{ width:'32px', height:'32px', background:'#E1F5EE', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', color:'#0F6E56', fontSize:'16px', fontWeight:600 }}>✚</div>
          <span style={{ fontSize:'18px', fontWeight:600, color:'#111' }}>Panoramic MedLog</span>
        </Link>
      </div>

      <div style={{ maxWidth:'720px', margin:'0 auto', padding:'48px 24px' }}>

        <h1 style={{ fontSize:'28px', fontWeight:600, color:'#111', marginBottom:'8px' }}>Confidențialitate și termeni</h1>
        <p style={{ fontSize:'14px', color:'#555', marginBottom:'48px' }}>Ultima actualizare: iulie 2025</p>

        {/* Politica de confidențialitate */}
        <div id="politica" style={{ marginBottom:'48px' }}>
          <h2 style={{ fontSize:'20px', fontWeight:600, color:'#111', marginBottom:'16px', paddingTop:'16px', borderTop:'0.5px solid #e5e7eb' }}>Politica de confidențialitate</h2>
          <p style={{ fontSize:'14px', color:'#333', lineHeight:1.8, marginBottom:'16px' }}>
            Panoramic MedLog este un agregator independent de date medicale personale. Datele tale sunt stocate securizat și nu sunt partajate cu terți fără consimțământul tău explicit.
          </p>
          <p style={{ fontSize:'14px', color:'#333', lineHeight:1.8, marginBottom:'16px' }}>
            Colectăm următoarele date: adresa de email pentru autentificare, datele medicale pe care le introduci sau le uploadezi (analize, diagnostice, date de urgență). Aceste date sunt necesare pentru funcționarea platformei.
          </p>
          <p style={{ fontSize:'14px', color:'#333', lineHeight:1.8 }}>
            Nu vindem, nu transferăm și nu procesăm datele tale în alte scopuri decât cele declarate. Datele sunt stocate pe servere securizate în Uniunea Europeană.
          </p>
        </div>

        {/* Termeni și condiții */}
        <div id="termeni" style={{ marginBottom:'48px' }}>
          <h2 style={{ fontSize:'20px', fontWeight:600, color:'#111', marginBottom:'16px', paddingTop:'16px', borderTop:'0.5px solid #e5e7eb' }}>Termeni și condiții</h2>
          <p style={{ fontSize:'14px', color:'#333', lineHeight:1.8, marginBottom:'16px' }}>
            Prin utilizarea Panoramic MedLog, ești de acord cu acești termeni. Panoramic MedLog este un instrument de organizare personală a datelor medicale — nu oferă consultanță medicală și nu înlocuiește medicul curant.
          </p>
          <p style={{ fontSize:'14px', color:'#333', lineHeight:1.8, marginBottom:'16px' }}>
            Datele introduse în platformă sunt în răspunderea exclusivă a utilizatorului. Panoramic MedLog nu verifică, nu validează și nu certifică nicio informație medicală.
          </p>
          <p style={{ fontSize:'14px', color:'#333', lineHeight:1.8 }}>
            Ne rezervăm dreptul de a modifica termenii și condițiile cu notificare prealabilă prin email.
          </p>
        </div>

        {/* GDPR */}
        <div id="gdpr" style={{ marginBottom:'48px' }}>
          <h2 style={{ fontSize:'20px', fontWeight:600, color:'#111', marginBottom:'16px', paddingTop:'16px', borderTop:'0.5px solid #e5e7eb' }}>GDPR — Drepturile tale</h2>
          <p style={{ fontSize:'14px', color:'#333', lineHeight:1.8, marginBottom:'16px' }}>
            Conform Regulamentului General privind Protecția Datelor (GDPR), ai următoarele drepturi:
          </p>
          <ul style={{ fontSize:'14px', color:'#333', lineHeight:2, paddingLeft:'20px', marginBottom:'16px' }}>
            <li><strong>Dreptul de acces</strong> — poți solicita o copie a datelor tale</li>
            <li><strong>Dreptul la rectificare</strong> — poți corecta datele incorecte</li>
            <li><strong>Dreptul la ștergere</strong> — poți solicita ștergerea contului și a datelor</li>
            <li><strong>Dreptul la portabilitate</strong> — poți exporta datele tale în format PDF</li>
            <li><strong>Dreptul de opoziție</strong> — poți opune procesării datelor tale</li>
          </ul>
          <p style={{ fontSize:'14px', color:'#333', lineHeight:1.8 }}>
            Pentru orice solicitare legată de datele tale, ne poți contacta la <a href="mailto:contact@panoramic-medlog.ro" style={{ color:'#16705a' }}>contact@panoramic-medlog.ro</a>.
          </p>
        </div>

      </div>
    </div>
  )
}