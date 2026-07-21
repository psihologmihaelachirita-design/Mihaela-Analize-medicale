'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Topbar from '@/components/Topbar'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function NotaInformare() {
  const [user, setUser] = useState<any>(null)
  const [profil, setProfil] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      setUser(session.user)
      const { data } = await supabase.from('profiluri').select('prenume, nume').eq('id', session.user.id).single()
      setProfil(data)
    })
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const username = profil?.prenume || user?.email?.split('@')[0] || ''

  return (
    <div style={{ fontFamily:'system-ui,-apple-system,sans-serif', background:'#f8f9fa', minHeight:'100vh' }}>
      <Topbar username={username} onLogout={handleLogout} />

      <div style={{ maxWidth:'780px', margin:'0 auto', padding:'40px 24px' }}>
        <Link href="javascript:history.back()" style={{ fontSize:'13px', color:'#16705a', fontWeight:500, textDecoration:'none', display:'inline-block', marginBottom:'16px' }}>← Înapoi</Link>
        <h1 style={{ fontSize:'24px', fontWeight:600, color:'#111', marginBottom:'8px' }}>Notă de informare cu privire la prelucrarea datelor cu caracter personal</h1>
        <p style={{ fontSize:'14px', color:'#555', marginBottom:'32px' }}>Procesul de asociere a unui aparținător la contul dumneavoastră Panoramic MedLog</p>

        <div style={{ background:'#E1F5EE', borderRadius:'10px', padding:'16px 20px', marginBottom:'32px' }}>
          <p style={{ fontSize:'14px', color:'#085041', lineHeight:1.7 }}>
            În această notă de informare vă explicăm modul în care are loc prelucrarea datelor cu caracter personal referitoare la dumneavoastră și la aparținătorul dumneavoastră de către Panoramic MedLog, dacă optați să parcurgeți procesul de asociere online a acestuia la contul dumneavoastră. Această notă conține informații importante. Vă încurajăm să acordați timpul necesar pentru a o citi în întregime și cu atenție.
          </p>
        </div>

        {[
          {
            titlu: '1. Despre această notă de informare',
            continut: `În această notă de informare vă explicăm modul în care are loc prelucrarea datelor cu caracter personal referitoare la dumneavoastră și la aparținătorul dumneavoastră de către Panoramic MedLog, dacă optați să parcurgeți procesul de asociere online a acestuia la contul dumneavoastră Panoramic MedLog.

Această notă conține informații importante. Vă încurajăm să acordați timpul necesar pentru a o citi în întregime și cu atenție și să vă asigurați că o înțelegeți pe deplin. Nu ezitați să ne comunicați orice nelămuriri ați avea.

Conținutul acestei note de informare este pur informativ și nu afectează drepturile pe care vi le oferă legislația. Vom face tot posibilul pentru a vă facilita exercitarea acestora.`
          },
          {
            titlu: '2. Cine suntem noi',
            continut: `Panoramic MedLog este o platformă digitală de stocare și organizare a datelor medicale personale, operată de Chirita Mihaela Cabinet Individual de Psihologie.

Datele de contact:
Email: contact@panoramic-medlog.ro

Datele de contact ale responsabilului cu protecția datelor:
Email: dpo@panoramic-medlog.ro`
          },
          {
            titlu: '3. Categorii de date prelucrate',
            continut: `Pentru asocierea aparținătorului la contul dumneavoastră Panoramic MedLog, vom prelucra o serie de date pe care le vom colecta exclusiv de la dumneavoastră în cursul acestui proces:

- Imaginea actului de identitate al aparținătorului și datele cuprinse în acesta: nume, prenume, CNP, seria și numărul actului de identitate, cetățenia, data nașterii, domiciliul.
- Relația de rudenie declarată de dumneavoastră (copil, părinte, bunic).

Imaginea actului de identitate nu se stochează permanent — este utilizată exclusiv pentru extragerea datelor de identificare și este ștearsă imediat după procesare.

De asemenea, vom prelucra informații cu privire la dispozitivele folosite de dumneavoastră: adresa IP și sistemul de operare.`
          },
          {
            titlu: '4. Temeiurile și scopurile prelucrării',
            continut: `Vom prelucra datele cu caracter personal referitoare la dumneavoastră și aparținătorul dumneavoastră în temeiul consimțământului dumneavoastră, conform art. 6 alin. 1 lit. a) din Regulamentul (UE) nr. 2016/679, pentru următoarele scopuri specifice: verificarea identității și legăturii de rudenie, pentru asocierea aparținătorului la contul dumneavoastră Panoramic MedLog.

De asemenea, prelucrăm datele cu caracter personal pe care ni le puneți la dispoziție în temeiul obligației noastre legale de a ne asigura că acordăm acces la datele aparținătorului persoanei îndreptățite, în baza calității sale de reprezentant legal sau de rudă, conform art. 6 alin. 1 lit. c) din Regulamentul (UE) nr. 2016/679.`
          },
          {
            titlu: '5. Cui vom divulga datele dumneavoastră',
            continut: `Panoramic MedLog este operatorul datelor dumneavoastră cu caracter personal. Aceste date vor putea fi dezvăluite către contractori sau furnizori de servicii ai Panoramic MedLog, care vor acționa în calitate de persoane împuternicite, cu respectarea legislației aplicabile privind prelucrarea datelor cu caracter personal.

Nu vom vinde, închiria sau transfera datele dumneavoastră către terți în scopuri de marketing.`
          },
          {
            titlu: '6. Unde prelucrăm datele',
            continut: `Datele dumneavoastră vor fi prelucrate exclusiv pe teritoriul Uniunii Europene, prin infrastructura Supabase (Dublin, Irlanda). În cazul în care în viitor va fi necesară transferarea acestora către o țară terță, transferul se va face cu respectarea prevederilor aplicabile din Capitolul V al Regulamentului (UE) nr. 2016/679.`
          },
          {
            titlu: '7. Durata prelucrării',
            continut: `Datele colectate în scopul asocierii aparținătorului la contul dumneavoastră Panoramic MedLog vor fi prelucrate pe parcursul procesului de verificare a identității și relației de rudenie. Imaginea actului de identitate este ștearsă imediat după extragerea datelor. Datele de identificare extrase sunt stocate pe durata existenței asocierii și șterse definitiv la dezasocierea aparținătorului sau la ștergerea contului.`
          },
          {
            titlu: '8. Securitatea datelor dumneavoastră',
            continut: `Depunem eforturi speciale pentru protejarea datelor pe care le prelucrăm de accesul neautorizat și de modificarea, divulgarea sau distrugerea neautorizată a acestora.

Am implementat următoarele măsuri tehnice și organizatorice:
- Criptarea datelor în tranzit și în repaus (SSL/TLS, AES-256)
- Controlul accesului prin Row Level Security (RLS) în baza de date
- Autentificare securizată cu posibilitate de 2FA
- Back-upuri regulate și audituri de securitate
- Acces la date strict limitat la utilizatorul titular al contului`
          },
          {
            titlu: '9. Care sunt drepturile dumneavoastră și cum le puteți exercita',
            continut: `În calitate de persoană vizată, aveți următoarele drepturi în ceea ce privește datele dumneavoastră cu caracter personal:

(i) Dreptul la retragerea consimțământului — puteți retrage consimțământul în orice moment prin dezasocierea aparținătorului din contul dumneavoastră.
(ii) Dreptul de a solicita accesul la datele cu caracter personal.
(iii) Dreptul de a solicita rectificarea datelor cu caracter personal.
(iv) Dreptul de a solicita ștergerea datelor cu caracter personal.
(v) Dreptul la restricționarea prelucrării.
(vi) Dreptul de a vă opune prelucrării.
(vii) Dreptul de a depune o plângere în fața Autorității Naționale de Supraveghere a Prelucrării Datelor cu Caracter Personal: www.dataprotection.ro

Pentru exercitarea acestor drepturi, vă rugăm să ne contactați la: dpo@panoramic-medlog.ro`
          },
        ].map((sectiune, i) => (
          <div key={i} style={{ marginBottom:'28px' }}>
            <h2 style={{ fontSize:'16px', fontWeight:600, color:'#111', marginBottom:'10px' }}>{sectiune.titlu}</h2>
            <div style={{ fontSize:'14px', color:'#444', lineHeight:1.8, whiteSpace:'pre-line' }}>{sectiune.continut}</div>
          </div>
        ))}

        <div style={{ borderTop:'1px solid #e5e7eb', paddingTop:'24px', marginTop:'16px' }}>
          <p style={{ fontSize:'13px', color:'#888' }}>Ultima actualizare: Iulie 2026 · Panoramic MedLog · contact@panoramic-medlog.ro</p>
        </div>
      </div>
    </div>
  )
}