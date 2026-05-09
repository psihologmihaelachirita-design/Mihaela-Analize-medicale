import Link from 'next/link'

export default function Home() {
  return (
    <main style={{fontFamily: 'Arial', maxWidth: '600px', margin: '100px auto', textAlign: 'center'}}>
      <h1 style={{fontSize: '2rem', marginBottom: '1rem'}}>🏥 Analize Medicale</h1>
      <p style={{color: '#666', marginBottom: '2rem'}}>
        Urmărește evoluția analizelor tale medicale în timp
      </p>
      <div style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
        <Link href="/login" style={{background: '#0070f3', color: 'white', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none'}}>
          Intră în cont
        </Link>
        <Link href="/register" style={{background: '#fff', color: '#0070f3', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', border: '1px solid #0070f3'}}>
          Cont nou
        </Link>
      </div>
    </main>
  )
}