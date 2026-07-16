import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { pdf } = await req.json()
    const response = await anthropic.messages.create({
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
    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const clean = text.replace(/```json|```/g, '').trim()
    const data = JSON.parse(clean)
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: 'Extragere eșuată' }, { status: 500 })
  }
}