import Link from 'next/link'

export default function Pricing() {
  const plans = [
    {
      id: 'individual',
      name: 'Individual',
      price: '9.99',
      period: '/lună',
      description: 'Pentru o singură persoană',
      icon: '👤',
      badge: '1 persoană',
      features: [
        '1 dosar medical personal',
        'Upload nelimitat PDF-uri',
        'Extragere automată cu AI',
        'Vizualizare panoramică',
        'Intervale de referință standard',
        'QR cod de urgență',
        'Export PDF dosar',
        'Date stocate securizat în Europa'
      ],
      popular: false,
      buttonText: 'Alege planul'
    },
    {
      id: 'family1',
      name: 'Family 1',
      price: '15.9',
      period: '/lună',
      description: '1 aparținător (părinte/copil)',
      icon: '👤👶',
      badge: '1 aparținător',
      features: [
        '1 utilizator + 1 aparținător',
        'Upload nelimitat PDF-uri',
        'Extragere automată cu AI',
        'Vizualizare panoramică',
        'Intervale de referință standard',
        'QR cod de urgență per dosar',
        'Export PDF dosar',
        'Date stocate securizat în Europa'
      ],
      popular: false,
      buttonText: 'Alege planul'
    },
    {
      id: 'family2',
      name: 'Family 2',
      price: '22.9',
      period: '/lună',
      description: '2 aparținători (părinte/copil)',
      icon: '👤👶👶',
      badge: '2 aparținători',
      features: [
        '1 utilizator + 2 aparținători',
        'Upload nelimitat PDF-uri',
        'Extragere automată cu AI',
        'Vizualizare panoramică',
        'Intervale de referință standard',
        'QR cod de urgență per dosar',
        'Export PDF dosar',
        'Date stocate securizat în Europa'
      ],
      popular: true,
      buttonText: 'Alege planul'
    },
    {
      id: 'family3',
      name: 'Family 3',
      price: '29.9',
      period: '/lună',
      description: '3 aparținători (părinte/copil)',
      icon: '👤👶👶👶',
      badge: '3 aparținători',
      features: [
        '1 utilizator + 3 aparținători',
        'Upload nelimitat PDF-uri',
        'Extragere automată cu AI',
        'Vizualizare panoramică',
        'Intervale de referință standard',
        'QR cod de urgență per dosar',
        'Export PDF dosar',
        'Date stocate securizat în Europa'
      ],
      popular: false,
      buttonText: 'Alege planul'
    },
    {
      id: 'family4',
      name: 'Family 4',
      price: '34.9',
      period: '/lună',
      description: '4 aparținători (părinte/copil)',
      icon: '👤👶👶👶👶',
      badge: '4 aparținători',
      features: [
        '1 utilizator + 4 aparținători',
        'Upload nelimitat PDF-uri',
        'Extragere automată cu AI',
        'Vizualizare panoramică',
        'Intervale de referință standard',
        'QR cod de urgență per dosar',
        'Export PDF dosar',
        'Date stocate securizat în Europa'
      ],
      popular: false,
      buttonText: 'Alege planul'
    }
  ]

  const color = '#16705a'
  const bgLight = '#E1F5EE'

  return (
    <main style={{minHeight:'100vh', background:'#f8f9fa', fontFamily:'system-ui,-apple-system,sans-serif'}}>

      {/* Nav */}
      <nav style={{padding:'0 2rem', height:'60px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'0.5px solid #e5e7eb', background:'white'}}>
        <Link href="/" style={{textDecoration:'none', display:'flex', flexDirection:'column'}}>
          <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
            <div style={{width:'28px', height:'28px', background: bgLight, borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color: color, fontSize:'15px', fontWeight:500}}>✚</div>
            <span style={{fontSize:'16px', fontWeight:500, color:'#111'}}>MedFile</span>
          </div>
          <span style={{fontSize:'10px', color:'#888', marginLeft:'36px'}}>Dosar medical agregat</span>
        </Link>
        <div style={{display:'flex', gap:'12px'}}>
          <Link href="/login" style={{padding:'8px 18px', border:'0.5px solid #e5e7eb', borderRadius:'8px', fontSize:'14px', color:'#555', textDecoration:'none'}}>Intră în cont</Link>
          <Link href="/register" style={{padding:'8px 18px', background: color, borderRadius:'8px', fontSize:'14px', color:'white', fontWeight:500, textDecoration:'none'}}>Cont nou</Link>
        </div>
      </nav>

      <div style={{maxWidth:'1200px', margin:'0 auto', padding:'3rem 2rem'}}>
        <div style={{textAlign:'center', marginBottom:'2.5rem'}}>
          <h1 style={{fontSize:'36px', fontWeight:500, color:'#111', marginBottom:'12px'}}>Prețuri simple și transparente</h1>
          <p style={{fontSize:'16px', color:'#888'}}>14 zile gratuit, fără card necesar. Anulezi oricând.</p>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:'20px', alignItems:'stretch'}}>
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              style={{
                background:'white', 
                border: plan.popular ? `2px solid ${color}` : '0.5px solid #e5e7eb', 
                borderRadius:'20px', 
                padding:'1.75rem 1.25rem',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: plan.popular ? '0 8px 32px rgba(22, 112, 90, 0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
                transform: plan.popular ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.25s ease'
              }}
            >
              {plan.popular && (
                <div style={{
                  position:'absolute', 
                  top:'-12px', 
                  left:'50%', 
                  transform:'translateX(-50%)', 
                  background: color, 
                  color:'white', 
                  padding:'4px 18px', 
                  borderRadius:'20px', 
                  fontSize:'11px', 
                  fontWeight:600, 
                  whiteSpace:'nowrap',
                  letterSpacing:'0.5px'
                }}>
                  RECOMANDAT
                </div>
              )}

              {/* Icon + Badge */}
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px'}}>
                <span style={{fontSize:'28px'}}>{plan.icon}</span>
                <span style={{
                  background: bgLight,
                  color: color,
                  padding:'4px 12px',
                  borderRadius:'20px',
                  fontSize:'11px',
                  fontWeight:600
                }}>
                  {plan.badge}
                </span>
              </div>
              
              <div style={{fontSize:'13px', fontWeight:500, color:'#888', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'2px'}}>
                {plan.name}
              </div>
              
              <div style={{fontSize:'34px', fontWeight:600, color:'#111', marginBottom:'2px'}}>
                {plan.price} <span style={{fontSize:'14px', color:'#888', fontWeight:400}}>lei</span>
              </div>
              
              <div style={{fontSize:'13px', color:'#999', marginBottom:'16px'}}>
                {plan.period}
              </div>

              <Link 
                href="/register" 
                style={{
                  display:'block', 
                  textAlign:'center', 
                  padding:'12px 16px', 
                  background: plan.popular ? color : '#f8f9fa', 
                  border: plan.popular ? 'none' : '0.5px solid #e5e7eb', 
                  borderRadius:'12px', 
                  fontSize:'14px', 
                  color: plan.popular ? 'white' : '#111', 
                  fontWeight:600, 
                  textDecoration:'none', 
                  marginBottom:'20px',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (plan.popular) {
                    e.currentTarget.style.background = '#0f5a48'
                  } else {
                    e.currentTarget.style.background = '#f0f0f0'
                  }
                }}
                onMouseLeave={(e) => {
                  if (plan.popular) {
                    e.currentTarget.style.background = color
                  } else {
                    e.currentTarget.style.background = '#f8f9fa'
                  }
                }}
              >
                {plan.buttonText}
              </Link>

              <div style={{fontSize:'13px', color:'#555', lineHeight:2.2, flex:1}}>
                {plan.features.map((feature, idx) => (
                  <div key={idx} style={{display:'flex', alignItems:'center', gap:'8px'}}>
                    <span style={{color: color, fontSize:'16px', fontWeight:600}}>✓</span>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Comparație prețuri */}
        <div style={{
          background:'white', 
          border:'0.5px solid #e5e7eb', 
          borderRadius:'16px', 
          padding:'1.5rem 2rem', 
          marginTop:'2.5rem'
        }}>
          <h3 style={{fontSize:'16px', fontWeight:600, color:'#111', marginBottom:'1rem', textAlign:'center'}}>
            Compară rapid
          </h3>
          <div style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:'8px', fontSize:'13px', textAlign:'center'}}>
            {plans.map((plan) => (
              <div key={plan.id} style={{padding:'12px 8px', borderRadius:'12px', background: bgLight}}>
                <div style={{fontSize:'20px'}}>{plan.icon}</div>
                <div style={{fontWeight:600, color: color, marginTop:'4px'}}>{plan.name}</div>
                <div style={{color:'#111', fontSize:'18px', fontWeight:600}}>{plan.price} lei</div>
                <div style={{color:'#888', fontSize:'12px'}}>{plan.period}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{background:'white', border:'0.5px solid #e5e7eb', borderRadius:'16px', padding:'2rem', marginTop:'2rem'}}>
          <h2 style={{fontSize:'18px', fontWeight:500, color:'#111', marginBottom:'1.5rem'}}>Întrebări frecvente</h2>
          {[
            {q:'Ce se întâmplă după cele 14 zile gratuite?', a:'Vei fi invitat să alegi un plan. Dacă nu alegi, contul rămâne activ dar nu mai poți uploada PDF-uri noi.'},
            {q:'Pot schimba planul oricând?', a:'Da, poți face upgrade sau downgrade oricând din setările contului.'},
            {q:'Datele mele sunt în siguranță?', a:'Da. Datele sunt stocate criptat în Europa, conform GDPR. Nu le vindem și nu le partajăm cu nimeni.'},
            {q:'Ce laboratoare sunt suportate?', a:'Orice laborator din România și internațional care emite buletine în format PDF.'},
            {q:'Cum adaug aparținători?', a:'În pagina de profil, secțiunea Aparținători, poți adăuga CNP-ul și relația. Maxim 4 aparținători.'},
          ].map((item, i) => (
            <div key={i} style={{marginBottom:'1rem', paddingBottom:'1rem', borderBottom: i < 4 ? '0.5px solid #f0f0f0' : 'none'}}>
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