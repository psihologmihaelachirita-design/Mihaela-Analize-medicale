import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const pdf = formData.get('pdf') as File

    if (!pdf) {
      const analizeNormalizate = parsed.analize.map((a: any) => ({
  ...a,
  nume: normalizeazaNume(a.nume)
}))

return NextResponse.json({
  analize: analizeNormalizate, error: 'Niciun fișier PDF primit.' }, { status: 400 })
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
      const analizeNormalizate = parsed.analize.map((a: any) => ({
  ...a,
  nume: normalizeazaNume(a.nume)
}))

return NextResponse.json({
  analize: analizeNormalizate, error: 'Eroare API.' }, { status: 500 })
    }

    const aiResponse = await response.json()
    let text = aiResponse.content[0].text.trim()
    
    // Curatam orice markdown
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    const parsed = JSON.parse(text)

    const analizeNormalizate = parsed.analize.map((a: any) => ({
  ...a,
  nume: normalizeazaNume(a.nume)
}))

return NextResponse.json({
  analize: analizeNormalizate,
      analize: parsed.analize || [],
      laborator: parsed.laborator,
      data_buletin: parsed.data_buletin
    })

  } catch (error) {
    console.error('Extract error:', error)
    const analizeNormalizate = parsed.analize.map((a: any) => ({
  ...a,
  nume: normalizeazaNume(a.nume)
}))

return NextResponse.json({
  analize: analizeNormalizate, error: 'A aparut o eroare la procesare.' }, { status: 500 })
  }
}