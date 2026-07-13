import Link from 'next/link'

export default function Pricing() {
  const plans = [
    {
      id: 'individual',
      name: 'Individual',
      price: '9.99',
      period: '/lună',
      description: 'Pentru o singură persoană',
      features: [
        '1 dosar medical personal',
        'Upload nelimitat PDF-uri',
        'Extragere automată cu AI',
        'Vizualizare panoramică',
        'Intervale de referință din laboratorul tău',
        'QR cod de urgență',
        'Export PDF dosar',
        'Date stocate securizat în Europa'
      ],
      popular: false,
      buttonText: 'Începe gratuit 14 zile',
      buttonVariant: 'outline'
    },
    {
      id: 'family1',
      name: 'Family 1',
      price: '16.99',
      period: '/lună',
      description: 'Tu + 1 aparținător (părinte/copil/bunic)',
      features: [
        '2 dosare medicale',
        'Upload nelimitat PDF-uri',
        'Extragere automată cu AI',
        'Vizualizare panoramică per dosar',
        'Intervale de referință din laboratorul tău',
        'QR cod de urgență per dosar',
        'Export PDF dosar',
        'Date stocate securizat în Europa'
      ],
      popular: false,
      buttonText: 'Începe gratuit 14 zile',
      buttonVariant: 'outline'
    },
    {
      id: 'family2',
      name: 'Family 2',
      price: '22.99',
      period: '/lună',
      description: 'Tu + 2 aparținători (părinte/copil/bunic)',
      features: [
        '3 dosare medicale',
        'Upload nelimitat PDF-uri',
        'Extragere automată cu AI',
        'Vizualizare panoramică per dosar',
        'Intervale de referință din laboratorul tău',
        'QR cod de urgență per dosar',
        'Export PDF dosar',
        'Date stocate securizat în Europa'
      ],
      popular: true,
      buttonText: 'Începe gratuit 14 zile',
      buttonVariant: 'primary'
    },
    {
      id: 'family3',
      name: 'Family 3',
      price: '27.99',
      period: '/lună',
      description: 'Tu + 3 aparținători (părinte/copil/bunic)',
      features: [
        '4 dosare medicale',
        'Upload nelimitat PDF-uri',
        'Extragere automată cu AI',
        'Vizualizare panoramică per dosar',
        'Intervale de referință din laboratorul tău',
        'QR cod de urgență per dosar',
        'Export PDF dosar',
        'Date stocate securizat în Europa'
      ],
      popular: false,
      buttonText: 'Începe gratuit 14 zile',
      buttonVariant: 'outline'
    },
    {
      id: 'family4',
      name: 'Family 4',
      price: '32.99',
      period: '/lună',
      description: 'Tu + 4 aparținători (părinte/copil/bunic)',
      features: [
        '5 dosare medicale',
        'Upload nelimitat PDF-uri',
        'Extragere automată cu AI',
        'Vizualizare panoramică per dosar',
        'Intervale de referință din laboratorul tău',
        'QR cod de urgență per dosar',
        'Export PDF dosar',
        'Date stocate securizat în Europa'
      ],
      popular: false,
      buttonText: 'Începe gratuit 14 zile',
      buttonVariant: 'outline'
    }
  ]

  return (
    <main style={{minHeight:'100vh', background:'#f8f9fa', fontFamily:'system-ui,-apple-system,sans-serif'}}>

      {/* Nav */}
      <nav style={{padding:'0 2rem', height:'60px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'0.5px solid #e5e7eb', background:'white'}}>
        <Link href="/" style={{textDecoration:'none', display:'flex', flexDirection:'column'}}>
          <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
            <div style={{width:'28px', height:'28px', background:'#E1F5EE', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color:'#16705a', fontSize:'15px', fontWeight:500}}>✚</div>
            <span style={{fontSize:'16px', fontWeight:500, color:'#111'}}>MediPanel</span>
          </div>
          <span style={{fontSize:'10px', color:'#888', marginLeft:'36px'}}>Dosar medical agregat</span>
        </Link>
        <div style={{display:'flex', gap:'12px'}}>
          <Link href="/login" style={{padding:'8px 18px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'14px', color:'#555', textDecoration:'none'}}>Intră în cont</Link>
          <Link href="/register" style={{padding:'8px 18px', background:'#16705a', borderRadius:'8px', fontSize:'14px', color:'white', fontWeight:500, textDecoration:'none'}}>Cont nou</Link>
        </div>
      </nav>

      <div style={{maxWidth:'1100px', margin:'0 auto', padding:'3rem 2rem'}}>
        <div style={{textAlign:'center', marginBottom:'2.5rem'}}>
          <h1 style={{fontSize:'36px', fontWeight:500, color:'#111', marginBottom:'12px'}}>Alege câți membri ai familiei incluzi</h1>
          <p style={{fontSize:'16px', color:'#888'}}>14 zile gratuit, fără card necesar. Anulezi oricând.</p>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:'16px'}}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              style={{
                background:'white',
                border: plan.popular ? '2px solid #16705a' : '0.5px solid #e5e7eb',
                borderRadius:'16px',
                padding:'1.5rem',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {plan.popular && (
                <div style={{
                  position:'absolute',
                  top:'-14px',
                  left:'50%',
                  transform:'translateX(-50%)',
                  background:'#16705a',
                  color:'white',
                  padding:'4px 16px',
                  borderRadius:'20px',
                  fontSize:'12px',
                  fontWeight:500,
                  whiteSpace:'nowrap'
                }}>
                  ✓ Cel mai ales
                </div>
              )}

              <div style={{fontSize:'13px', fontWeight:500, color:'#888', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'8px'}}>
                {plan.name}
              </div>

              <div style={{fontSize:'32px', fontWeight:500, color:'#111', marginBottom:'2px'}}>
                {plan.price} lei<span style={{fontSize:'14px', color:'#888', fontWeight:400}}>{plan.period}</span>
              </div>

              <div style={{fontSize:'13px', color:'#16705a', fontWeight:500, marginBottom:'16px', minHeight:'40px'}}>
                {plan.description}
              </div>

              <Link
                href="/register"
                style={{
                  display:'block',
                  textAlign:'center',
                  padding:'12px',
                  background: plan.popular ? '#16705a' : '#f8f9fa',
                  border: plan.popular ? 'none' : '0.5px solid #e5e7eb',
                  borderRadius:'8px',
                  fontSize:'14px',
                  color: plan.popular ? 'white' : '#111',
                  fontWeight:500,
                  textDecoration:'none',
                  marginBottom:'20px'
                }}
              >
                {plan.buttonText}
              </Link>

              <div style={{fontSize:'13px', color:'#555', lineHeight:2, flex:1}}>
                {plan.features.map((feature, idx) => (
                  <div key={idx}>✓ {feature}</div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{background:'white', border:'0.5px solid #e5e7eb', borderRadius:'16px', padding:'2rem', marginTop:'2rem'}}>
          <h2 style={{fontSize:'18px', fontWeight:500, color:'#111', marginBottom:'1.5rem'}}>Întrebări frecvente</h2>
          {[
            {q:'Ce se întâmplă după cele 14 zile gratuite?', a:'Vei fi invitat să alegi un plan. Dacă nu alegi, contul rămâne activ dar nu mai poți uploada PDF-uri noi.'},
            {q:'Pot schimba planul oricând?', a:'Da, poți face upgrade sau downgrade oricând din setările contului.'},
            {q:'Datele mele sunt în siguranță?', a:'Da. Datele sunt stocate criptat în Europa, conform GDPR. Nu le vindem și nu le partajăm cu nimeni.'},
            {q:'Ce laboratoare sunt suportate?', a:'Orice laborator din România și internațional care emite buletine în format PDF — Synevo, Bioclinica, Regina Maria, Medicover, Sanador, spitale de stat și altele.'},
            {q:'Cum adaug aparținători?', a:'În pagina de profil, secțiunea Aparținători, poți adăuga CNP-ul și relația. Numărul disponibil depinde de planul ales (maxim 4 aparținători).'},
            {q:'Cine poate fi aparținător?', a:'Aparținătorii pot fi copii, părinți sau bunici. Platforma nu permite adăugarea soțului/soției — fiecare adult poate avea propriul cont.'},
          ].map((item, i) => (
            <div key={i} style={{marginBottom:'1rem', paddingBottom:'1rem', borderBottom: i < 5 ? '0.5px solid #f0f0f0' : 'none'}}>
              <div style={{fontSize:'14px', fontWeight:500, color:'#111', marginBottom:'4px'}}>{item.q}</div>
              <div style={{fontSize:'13px', color:'#888', lineHeight:1.6}}>{item.a}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{borderTop:'0.5px solid #e5e7eb', padding:'1.5rem 2rem', display:'flex', justifyContent:'space-between', alignItems:'center', background:'white'}}>
        <span style={{fontSize:'13px', color:'#888'}}>© 2026 MediPanel</span>
        <span style={{fontSize:'13px', color:'#888'}}>GDPR compliant · Date stocate în Europa</span>
      </div>
    </main>
  )
}