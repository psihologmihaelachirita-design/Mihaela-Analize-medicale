'use client'
import Link from 'next/link'
import { useState } from 'react'

interface TopbarProps {
  username: string
  activePage: 'home' | 'panoramic' | 'urgenta' | 'dosar'
  onLogout: () => void
}

export default function Topbar({ username, activePage, onLogout }: TopbarProps) {
  const [dropdown, setDropdown] = useState(false)

  const linkStyle = (page: string) => ({
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '15px',
    color: activePage === page ? '#085041' : '#111',
    textDecoration: 'none',
    fontWeight: 500,
    background: activePage === page ? '#E1F5EE' : 'transparent',
  })

  return (
    <div
      style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '0 32px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            background: '#E1F5EE',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0F6E56',
            fontSize: '18px',
            fontWeight: 600,
          }}
        >
          ✚
        </div>
        <span style={{ fontSize: '20px', fontWeight: 600, color: '#111' }}>MediPanel</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Link href="/dashboard" style={linkStyle('home')}>Home</Link>
        <Link href="/panoramic" style={linkStyle('panoramic')}>Panoramic</Link>
        <Link href="/urgenta" style={linkStyle('urgenta')}>Urgență</Link>
        <Link href="/dosar" style={linkStyle('dosar')}>Dosar</Link>
        <Link
          href="/upload"
          style={{
            padding: '8px 16px',
            background: '#16705a',
            borderRadius: '8px',
            fontSize: '15px',
            color: 'white',
            fontWeight: 500,
            textDecoration: 'none',
            marginLeft: '4px',
          }}
        >
          + Adaugă
        </Link>
        <div style={{ position: 'relative', marginLeft: '12px' }}>
          <button
            onClick={() => setDropdown(!dropdown)}
            style={{
              padding: '8px 14px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '15px',
              color: '#111',
              background: 'white',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            {username} ▾
          </button>
          {dropdown && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '40px',
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                padding: '6px',
                minWidth: '150px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                zIndex: 100,
              }}
            >
              <Link
                href="/profil"
                style={{ display: 'block', padding: '10px 14px', fontSize: '14px', color: '#111', textDecoration: 'none', borderRadius: '6px' }}
              >
                Profil
              </Link>
              <div
                onClick={onLogout}
                style={{ padding: '10px 14px', fontSize: '14px', color: '#E24B4A', cursor: 'pointer', borderRadius: '6px' }}
              >
                Ieșire
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}