'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IconSearch, IconChevronDown, IconEye, IconDownload, IconFileText, IconUser, IconStethoscope, IconSurgery, IconHospital } from '@tabler/icons-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Raport = {
  id: string
  user_id: string
  cnp_pacient?: string
  tip: 'familie' | 'specialist' | 'interventie' | 'externare'
  data_raport: string
  nume_medic: string
  specialitate: string
  clinica: string
  diagnostic: string
  medicatie?: string
  pdf_url?: string
  created_at: string
}

type Filtre = {
  search: string
  tip: 'toate' | 'familie' | 'specialist' | 'interventie' | 'externare'
  perioada: '30zile' | '3luni' | '1an' | 'toate'
}

export default function Dosar() {
  const [user, setUser] = useState<any>(null)
  const [profil, setProfil] = useState<any>(null)
  const [rapoarte, setRapoarte] = useState<Raport[]>([])
  const [loading, setLoading] = useState(true)
  const [dropdown, setDropdown] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [modalPdf, setModalPdf] = useState<{ open: boolean; url?: string; nume?: string; clinica?: string }>({ open: false })
  const router = useRouter()

  const [filtre, setFiltre] = useState<Filtre>({
    search: '',
    tip: 'toate',
    perioada: '30zile'
  })

  const [sort, setSort] = useState<{ col: keyof Raport; dir: 'asc' | 'desc' }>({ col: 'data_raport', dir: 'desc' })

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      
      const { data: profilData } = await supabase
        .from('profiluri')
        .select('nume, prenume')
        .eq('id', session.user.id)
        .single()
      setProfil(profilData)

      const { data: rapoarteData } = await supabase
        .from('rapoarte_medicale')
        .select('*')
        .eq('user_id', session.user.id)
        .order('data_raport', { ascending: false })
      setRapoarte(rapoarteData || [])
      setLoading(false)
    })
  }, [router])

  function getRapoarteFiltrate(): Raport[] {
    let rezultat = [...rapoarte]

    if (filtre.search.trim() !== '') {
      const q = filtre.search.toLowerCase()
      rezultat = rezultat.filter(r =>
        r.nume_medic.toLowerCase().includes(q) ||
        r.clinica.toLowerCase().includes(q) ||
        r.diagnostic.toLowerCase().includes(q) ||
        r.specialitate.toLowerCase().includes(q)
      )
    }

    if (filtre.tip !== 'toate') {
      rezultat = rezultat.filter(r => r.tip === filtre.tip)
    }

    if (filtre.perioada !== 'toate') {
      const acum = new Date()
      let dataLimita = new Date()
      if (filtre.perioada === '30zile') dataLimita.setDate(acum.getDate() - 30)
      else if (filtre.perioada === '3luni') dataLimita.setMonth(acum.getMonth() - 3)
      else if (filtre.perioada === '1an') dataLimita.setFullYear(acum.getFullYear() - 1)
      rezultat = rezultat.filter(r => new Date(r.data_raport) >= dataLimita)
    }

    rezultat.sort((a, b) => {
      const valA = a[sort.col] || ''
      const valB = b[sort.col] || ''
      if (valA < valB) return sort.dir === 'asc' ? -1 : 1
      if (valA > valB) return sort.dir === 'asc' ? 1 : -1
      return 0
    })

    return rezultat
  }

  const rapoarteFiltrate = getRapoarteFiltrate()

  const stats = {
    familie: rapoarte.filter(r => r.tip === 'familie').length,
    specialist: rapoarte.filter(r => r.tip === 'specialist').length,
    interventie: rapoarte.filter(r => r.tip === 'interventie').length,
    externare: rapoarte.filter(r => r.tip === 'externare').length,
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'system-ui' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTop: '4px solid #16705a', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
        <p style={{ color: '#888', fontSize: '16px' }}>Se încarcă dosarul...</p>
      </div>
    </div>
  )

  const username = profil?.prenume || user?.email?.split('@')[0] || 'Utilizator'

  const navStyle: React.CSSProperties = { padding: '8px 14px', borderRadius: '10px', fontSize: '15px', color: '#111', textDecoration: 'none', fontWeight: 500, transition: 'background 0.15s' }

  const cardConfigs = [
    { key: 'familie' as const, label: 'Medic de familie', count: stats.familie, icon: <IconUser size={24} />, color: '#085041', bg: '#E1F5EE' },
    { key: 'specialist' as const, label: 'Medic specialist', count: stats.specialist, icon: <IconStethoscope size={24} />, color: '#1D4ED8', bg: '#DBEAFE' },
    { key: 'interventie' as const, label: 'Intervenții', count: stats.interventie, icon: <IconSurgery size={24} />, color: '#6B21A5', bg: '#F3E8FF' },
    { key: 'externare' as const, label: 'Externări', count: stats.externare, icon: <IconHospital size={24} />, color: '#B45309', bg: '#FEF3C7' },
  ]

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', background: '#f4f6f8', minHeight: '100vh' }} onClick={() => { setDropdown(false); setMobileMenu(false) }}>

      {/* Topbar */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '0 32px', height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div style={{ width: '40px', height: '40px', background: '#E1F5EE', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F6E56', fontSize: '20px', fontWeight: 600 }}>✚</div>
          <span style={{ fontSize: '22px', fontWeight: 600, color: '#111' }}>MedFile</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="desktop-nav">
          <Link href="/dashboard" style={{ ...navStyle }}>Home</Link>
          <Link href="/panoramic" style={navStyle}>Panoramic</Link>
          <Link href="/urgenta" style={navStyle}>Urgență</Link>
          <Link href="/dosar" style={{ ...navStyle, background: '#E1F5EE', color: '#085041' }}>Dosar</Link>
          <Link href="/upload" style={{ ...navStyle, background: '#16705a', color: 'white', padding: '8px 18px', marginLeft: '4px' }}>+ Adaugă</Link>
          <div style={{ position: 'relative', marginLeft: '12px' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setDropdown(!dropdown)} style={{ padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '15px', color: '#111', background: 'white', cursor: 'pointer', fontWeight: 500 }}>
              {username} ▾
            </button>
            {dropdown && (
              <div style={{ position: 'absolute', right: 0, top: '44px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '6px', minWidth: '160px', boxShadow: '0 8px 24px rgba(0,0,0,0.10)', zIndex: 100 }}>
                <Link href="/profil" style={{ display: 'block', padding: '10px 14px', fontSize: '15px', color: '#111', textDecoration: 'none', borderRadius: '8px' }}>Profil</Link>
                <div onClick={handleLogout} style={{ padding: '10px 14px', fontSize: '15px', color: '#E24B4A', cursor: 'pointer', borderRadius: '8px' }}>Ieșire</div>
              </div>
            )}
          </div>
        </div>

        <button onClick={e => { e.stopPropagation(); setMobileMenu(!mobileMenu) }} style={{ display: 'none', border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }} className="mobile-menu-btn" aria-label="Meniu">
          <div style={{ width: '26px', height: '2px', background: '#111', borderRadius: '2px', marginBottom: '6px' }}></div>
          <div style={{ width: '26px', height: '2px', background: '#111', borderRadius: '2px', marginBottom: '6px' }}></div>
          <div style={{ width: '26px', height: '2px', background: '#111', borderRadius: '2px' }}></div>
        </button>
      </div>

      {mobileMenu && (
        <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px', position: 'sticky', top: '68px', zIndex: 9 }}>
          <Link href="/dashboard" style={{ padding: '12px 14px', fontSize: '16px', color: '#111', textDecoration: 'none', fontWeight: 500, borderRadius: '8px' }}>Home</Link>
          <Link href="/panoramic" style={{ padding: '12px 14px', fontSize: '16px', color: '#111', textDecoration: 'none', fontWeight: 500, borderRadius: '8px' }}>Panoramic</Link>
          <Link href="/urgenta" style={{ padding: '12px 14px', fontSize: '16px', color: '#111', textDecoration: 'none', fontWeight: 500, borderRadius: '8px' }}>Urgență</Link>
          <Link href="/dosar" style={{ padding: '12px 14px', fontSize: '16px', color: '#111', textDecoration: 'none', fontWeight: 500, borderRadius: '8px', background: '#E1F5EE' }}>Dosar</Link>
          <Link href="/upload" style={{ padding: '12px 14px', fontSize: '16px', color: 'white', textDecoration: 'none', fontWeight: 500, borderRadius: '8px', background: '#16705a', textAlign: 'center', marginTop: '4px' }}>+ Adaugă</Link>
          <Link href="/profil" style={{ padding: '12px 14px', fontSize: '16px', color: '#111', textDecoration: 'none', fontWeight: 500, borderRadius: '8px' }}>Cont</Link>
          <div onClick={handleLogout} style={{ padding: '12px 14px', fontSize: '16px', color: '#E24B4A', cursor: 'pointer', fontWeight: 500, borderRadius: '8px' }}>Ieșire</div>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; flex-direction: column; }
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Header pagină */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#111', margin: 0, marginBottom: '4px' }}>Dosarul meu medical</h1>
          <p style={{ fontSize: '16px', color: '#888', margin: 0 }}>{rapoarte.length} rapoarte în total</p>
        </div>

        {/* 4 casete premium */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px', marginBottom: '28px' }}>
          {cardConfigs.map((card) => (
            <div
              key={card.key}
              onClick={() => setFiltre(prev => ({ ...prev, tip: prev.tip === card.key ? 'toate' : card.key }))}
              style={{
                background: 'white',
                border: filtre.tip === card.key ? `2px solid ${card.color}` : '1px solid #e5e7eb',
                borderRadius: '16px',
                padding: '20px 22px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: filtre.tip === card.key ? `0 4px 16px ${card.color}20` : '0 2px 8px rgba(0,0,0,0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
                  {card.icon}
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 500, color: '#555' }}>{card.label}</div>
                  <div style={{ fontSize: '30px', fontWeight: 700, color: '#111', lineHeight: 1.2 }}>{card.count}</div>
                </div>
              </div>
              <div style={{ fontSize: '14px', color: card.color, fontWeight: 600 }}>
                {filtre.tip === card.key ? '✓ Activ' : '↗'}
              </div>
            </div>
          ))}
        </div>

        {/* Bara filtre premium */}
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '18px 24px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', background: '#f8f9fa', borderRadius: '10px', padding: '0 14px', border: '1px solid #e5e7eb' }}>
              <IconSearch size={18} color="#888" />
              <input
                type="text"
                placeholder="Caută medic, clinică, diagnostic..."
                value={filtre.search}
                onChange={e => setFiltre(prev => ({ ...prev, search: e.target.value }))}
                style={{ width: '100%', padding: '12px 12px', border: 'none', background: 'transparent', fontSize: '16px', outline: 'none', color: '#111' }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <select
                value={filtre.tip}
                onChange={e => setFiltre(prev => ({ ...prev, tip: e.target.value as any }))}
                style={{ padding: '12px 40px 12px 16px', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#f8f9fa', fontSize: '15px', appearance: 'none', cursor: 'pointer', color: '#111' }}
              >
                <option value="toate">Toate categoriile</option>
                <option value="familie">Medic de familie</option>
                <option value="specialist">Medic specialist</option>
                <option value="interventie">Intervenții</option>
                <option value="externare">Externări</option>
              </select>
              <IconChevronDown size={16} color="#888" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>

            <div style={{ position: 'relative' }}>
              <select
                value={filtre.perioada}
                onChange={e => setFiltre(prev => ({ ...prev, perioada: e.target.value as any }))}
                style={{ padding: '12px 40px 12px 16px', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#f8f9fa', fontSize: '15px', appearance: 'none', cursor: 'pointer', color: '#111' }}
              >
                <option value="30zile">Ultimele 30 zile</option>
                <option value="3luni">Ultimele 3 luni</option>
                <option value="1an">Ultimul an</option>
                <option value="toate">Toate</option>
              </select>
              <IconChevronDown size={16} color="#888" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>

            <button
              onClick={() => setFiltre({ search: '', tip: 'toate', perioada: '30zile' })}
              style={{ padding: '10px 20px', border: '1px solid #e5e7eb', borderRadius: '10px', background: 'white', fontSize: '15px', cursor: 'pointer', color: '#555', fontWeight: 500 }}
            >
              Resetează
            </button>

            <div style={{ marginLeft: 'auto', fontSize: '15px', color: '#888', fontWeight: 500 }}>
              {rapoarteFiltrate.length} rapoarte
            </div>
          </div>
        </div>

        {/* Tabel premium */}
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          {rapoarteFiltrate.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
              <div style={{ fontSize: '20px', fontWeight: 600, color: '#111', marginBottom: '8px' }}>Nu există rapoarte</div>
              <div style={{ fontSize: '16px', color: '#888', marginBottom: '20px' }}>
                {filtre.tip !== 'toate' ? 'Nicio înregistrare în această categorie.' : 'Încarcă primul tău raport medical.'}
              </div>
              <Link href="/upload" style={{ display: 'inline-block', padding: '14px 32px', background: '#16705a', color: 'white', borderRadius: '12px', fontSize: '16px', fontWeight: 600, textDecoration: 'none' }}>
                + Adaugă raport
              </Link>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #e5e7eb' }}>
                    {[
                      { label: 'Dată', key: 'data_raport' },
                      { label: 'Tip', key: 'tip' },
                      { label: 'Medic', key: 'nume_medic' },
                      { label: 'Specialitate', key: 'specialitate' },
                      { label: 'Unitate medicală', key: 'clinica' },
                      { label: 'Diagnostic', key: 'diagnostic' },
                      { label: '', key: '' },
                    ].map((col, idx) => (
                      <th
                        key={idx}
                        onClick={() => col.key && setSort(prev => ({ col: col.key as any, dir: prev.dir === 'asc' ? 'desc' : 'asc' }))}
                        style={{
                          padding: '16px 20px',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#555',
                          whiteSpace: 'nowrap',
                          cursor: col.key ? 'pointer' : 'default',
                          fontSize: '13px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.3px',
                        }}
                      >
                        {col.label}
                        {col.key && sort.col === col.key && (
                          <span style={{ marginLeft: '6px', fontSize: '12px' }}>{sort.dir === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rapoarteFiltrate.map((r, idx) => (
                    <tr
                      key={r.id}
                      onClick={() => r.pdf_url && setModalPdf({ open: true, url: r.pdf_url, nume: r.nume_medic, clinica: r.clinica })}
                      style={{
                        borderBottom: idx < rapoarteFiltrate.length - 1 ? '1px solid #f0f0f0' : 'none',
                        cursor: r.pdf_url ? 'pointer' : 'default',
                        transition: 'background 0.15s ease',
                        background: idx % 2 === 0 ? 'white' : '#fafafa',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f0f7f4'}
                      onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'white' : '#fafafa'}
                    >
                      <td style={{ padding: '16px 20px', color: '#111', fontWeight: 500 }}>{new Date(r.data_raport).toLocaleDateString('ro-RO')}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 14px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: r.tip === 'familie' ? '#E1F5EE' : r.tip === 'specialist' ? '#DBEAFE' : r.tip === 'interventie' ? '#F3E8FF' : '#FEF3C7',
                          color: r.tip === 'familie' ? '#085041' : r.tip === 'specialist' ? '#1D4ED8' : r.tip === 'interventie' ? '#6B21A5' : '#B45309'
                        }}>
                          {r.tip === 'familie' ? 'Familie' : r.tip === 'specialist' ? 'Specialist' : r.tip === 'interventie' ? 'Intervenție' : 'Externare'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', color: '#111', fontWeight: 500 }}>{r.nume_medic}</td>
                      <td style={{ padding: '16px 20px', color: '#555' }}>{r.specialitate}</td>
                      <td style={{ padding: '16px 20px', color: '#555' }}>{r.clinica}</td>
                      <td style={{ padding: '16px 20px', color: '#111', fontWeight: 500 }}>{r.diagnostic}</td>
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        {r.pdf_url ? (
                          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <IconEye size={20} color="#16705a" style={{ cursor: 'pointer' }} title="Vizualizează PDF" />
                            <IconDownload size={20} color="#555" style={{ cursor: 'pointer' }} title="Descarcă PDF" onClick={(e) => { e.stopPropagation(); window.open(r.pdf_url, '_blank') }} />
                          </div>
                        ) : (
                          <span style={{ fontSize: '13px', color: '#ccc' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal PDF premium */}
      {modalPdf.open && modalPdf.url && (
        <div
          onClick={() => setModalPdf({ open: false })}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '860px',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 24px 64px rgba(0,0,0,0.20)',
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: '#111' }}>{modalPdf.nume || 'Raport medical'}</div>
                <div style={{ fontSize: '14px', color: '#888' }}>{modalPdf.clinica || ''}</div>
              </div>
              <button onClick={() => setModalPdf({ open: false })} style={{ border: 'none', background: 'none', fontSize: '22px', cursor: 'pointer', color: '#111', padding: '4px 8px' }}>✕</button>
            </div>
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#f8f9fa' }}>
              <iframe src={modalPdf.url} style={{ width: '100%', height: '650px', border: 'none', borderRadius: '12px', background: 'white' }} />
            </div>
          </div>
        </div>
      )}

    </div>
  )
}