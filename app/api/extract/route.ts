import { NextRequest, NextResponse } from 'next/server'

const NORMALIZARE: Record<string, string> = {
  'limfocit (%)': 'Limfocite %',
  'limfocit %': 'Limfocite %',
  'limfocit (#)': 'Limfocite absolute',
  'limfocit (abs)': 'Limfocite absolute',
  'limfocit abs': 'Limfocite absolute',
  'neutrofil (%)': 'Neutrofile %',
  'neutrofil %': 'Neutrofile %',
  'neutrofil (#)': 'Neutrofile absolute',
  'neutrofil (abs)': 'Neutrofile absolute',
  'neutrofil abs': 'Neutrofile absolute',
  'monocit (%)': 'Monocite %',
  'monocit %': 'Monocite %',
  'monocit (#)': 'Monocite absolute',
  'monocit (abs)': 'Monocite absolute',
  'monocit abs': 'Monocite absolute',
  'eozinofil (%)': 'Eozinofile %',
  'eozinofil %': 'Eozinofile %',
  'eozinofil (#)': 'Eozinofile absolute',
  'eozinofil (abs)': 'Eozinofile absolute',
  'eozinofil abs': 'Eozinofile absolute',
  'bazofil (%)': 'Bazofile %',
  'bazofil %': 'Bazofile %',
  'bazofil (#)': 'Bazofile absolute',
  'bazofil (abs)': 'Bazofile absolute',
  'bazofil abs': 'Bazofile absolute',
  'glucoza serica': 'Glucoza',
  'glicemie': 'Glucoza',
  'glucoza': 'Glucoza',
  'nr. leucocite': 'Leucocite',
  'leucocite': 'Leucocite',
  'nr. eritrocite': 'Eritrocite',
  'eritrocite': 'Eritrocite',
  'nr. trombocite': 'Trombocite',
  'trombocite': 'Trombocite',
  'alaninaminotransferaza (gpt/alat/alt)': 'ALT (TGP)',
  'alt': 'ALT (TGP)',
  'tgp': 'ALT (TGP)',
  'alat': 'ALT (TGP)',
  'aspartataminotransferaza (got/asat/ast)': 'AST (TGO)',
  'ast': 'AST (TGO)',
  'tgo': 'AST (TGO)',
  'asat': 'AST (TGO)',
  'calciu seric': 'Calciu',
  'calciu': 'Calciu',
  'vsh': 'VSH',
}

function normalizeazaNume(nume: string): string {
  const numeLower = nume.toLowerCase().trim()
  return NORMALIZARE[numeLower] || nume
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const pdf = formData.get('pdf') as File

    if (!pdf) {
      return NextResponse.json({ error: 'Niciun fișier PDF primit.' }, { status: 400 })
    }

    const bytes = await pdf.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64
              }
            },
            {
              type: 'text',
              text: `Extrage TOATE analizele din acest buletin medical PDF. Returneaza STRICT un obiect JSON valid, fara text inainte sau dupa, fara markdown, fara backticks. Doar JSON pur:
{"analize":[{"nume":"numele analizei","valoare":"valoarea numerica","unitate":"unitatea","referinta_min":"min sau null","referinta_max":"max sau null","status":"normal sau peste sau sub","data":"YYYY-MM-DD sau null"}],"laborator":"numele laboratorului sau null","data_buletin":"YYYY-MM-DD sau null"}`
            }
          ]
        }]
      })
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic error:', err)
      return NextResponse.json({ error: 'Eroare API.' }, { status: 500 })
    }

    const aiResponse = await response.json()
    let text = aiResponse.content[0].text.trim()
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    const parsed = JSON.parse(text)

    const analizeNormalizate = (parsed.analize || []).map((a: any) => ({
      ...a,
      nume: normalizeazaNume(a.nume)
    }))

    return NextResponse.json({
      analize: analizeNormalizate,
      laborator: parsed.laborator,
      data_buletin: parsed.data_buletin
    })

  } catch (error) {
    console.error('Extract error:', error)
    return NextResponse.json({ error: 'A aparut o eroare la procesare.' }, { status: 500 })
  }
}