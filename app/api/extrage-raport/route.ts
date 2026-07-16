import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { pdf } = await req.json()
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: pdf }
            },
            {
              type: 'text',
              text: `Extrage din acest raport medical următoarele date în format JSON:
{
  "medic": "numele medicului cu titlu (ex: Dr. Ionescu Maria)",
  "specialitate": "specialitatea medicului (ex: Cardiologie)",
  "unitate": "numele clinicii sau spitalului",
  "diagnostic": "diagnosticul principal",
  "data_raport": "data în format YYYY-MM-DD"
}
Returnează DOAR JSON-ul, fără text suplimentar. Dacă un câmp nu există în document, lasă-l null.`
            }
          ]
        }]
      })
    })
    const result = await response.json()
    const text = result.content?.[0]?.text || ''
    const clean = text.replace(/```json|```/g, '').trim()
    const data = JSON.parse(clean)
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: 'Extragere eșuată' }, { status: 500 })
  }
}