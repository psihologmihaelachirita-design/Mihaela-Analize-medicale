'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IconSearch, IconChevronDown, IconEye, IconDownload, IconUser, IconStethoscope, IconSurgery, IconHospital } from '@tabler/icons-react'

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

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; flex-direction: column; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Topbar - același cod ca mai sus, doar că am mutat <style> mai sus */}
      {/* ... restul codului identic ... */}
    </div>
  )
}