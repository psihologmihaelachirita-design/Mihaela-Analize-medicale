import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Neautorizat.' }, { status: 401 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Neautorizat.' }, { status: 401 })

  const qrToken = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  await supabase.from('qr_tokens').delete().eq('user_id', user.id)

  const { error } = await supabase.from('qr_tokens').insert({
    user_id: user.id,
    token: qrToken,
    expires_at: expiresAt
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mihaela-analize-medicale.vercel.app'}/urgenta-publica/${qrToken}`
  return NextResponse.json({ url, expires_at: expiresAt })
}