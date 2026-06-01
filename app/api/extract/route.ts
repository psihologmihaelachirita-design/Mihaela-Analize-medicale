import { NextRequest, NextResponse } from 'next/server'

const NOMENCLATOR: Record<string, string> = {
  'eritrocite': 'Eritrocite',
  'nr. eritrocite': 'Eritrocite',
  'numar eritrocite': 'Eritrocite',
  'globule rosii': 'Eritrocite',
  'rbc': 'Eritrocite',
  'hemoglobina': 'Hemoglobina',
  'hemoglobina (hb)': 'Hemoglobina',
  'hb': 'Hemoglobina',
  'hgb': 'Hemoglobina',
  'hematocrit': 'Hematocrit',
  'ht': 'Hematocrit',
  'hct': 'Hematocrit',
  'volum eritrocitar mediu': 'Volum eritrocitar mediu (VEM)',
  'volum eritrocitar mediu (vem)': 'Volum eritrocitar mediu (VEM)',
  'vem': 'Volum eritrocitar mediu (VEM)',
  'mcv': 'Volum eritrocitar mediu (VEM)',
  'hemoglobina eritrocitara medie': 'Hemoglobina eritrocitara medie (HEM)',
  'hemoglobina eritrocitara medie (hem)': 'Hemoglobina eritrocitara medie (HEM)',
  'hem': 'Hemoglobina eritrocitara medie (HEM)',
  'mch': 'Hemoglobina eritrocitara medie (HEM)',
  'concentratie medie hb/eritrocit': 'Concentratie medie Hb/eritrocit (CHEM)',
  'concentratie medie a hb/eritrocit': 'Concentratie medie Hb/eritrocit (CHEM)',
  'chem': 'Concentratie medie Hb/eritrocit (CHEM)',
  'mchc': 'Concentratie medie Hb/eritrocit (CHEM)',
  'largimea distributiei eritrocitare': 'Largimea distributiei eritrocitare (RDW)',
  'rdw': 'Largimea distributiei eritrocitare (RDW)',
  'leucocite': 'Leucocite',
  'nr. leucocite': 'Leucocite',
  'numar leucocite': 'Leucocite',
  'globule albe': 'Leucocite',
  'wbc': 'Leucocite',
  'neutrofile %': 'Neutrofile %',
  'neutrofil %': 'Neutrofile %',
  'neutrofil (%)': 'Neutrofile %',
  'gran %': 'Neutrofile %',
  'neut %': 'Neutrofile %',
  'neutrofile absolute': 'Neutrofile absolute',
  'neutrofil abs': 'Neutrofile absolute',
  'neutrofil (abs)': 'Neutrofile absolute',
  'neutrofil (#)': 'Neutrofile absolute',
  'limfocite %': 'Limfocite %',
  'limfocit %': 'Limfocite %',
  'limfocit (%)': 'Limfocite %',
  'limfocite absolute': 'Limfocite absolute',
  'limfocit abs': 'Limfocite absolute',
  'limfocit (abs)': 'Limfocite absolute',
  'limfocit (#)': 'Limfocite absolute',
  'monocite %': 'Monocite %',
  'monocit %': 'Monocite %',
  'monocit (%)': 'Monocite %',
  'monocite absolute': 'Monocite absolute',
  'monocit abs': 'Monocite absolute',
  'monocit (abs)': 'Monocite absolute',
  'eozinofile %': 'Eozinofile %',
  'eozinofil %': 'Eozinofile %',
  'eozinofil (%)': 'Eozinofile %',
  'eozinofile absolute': 'Eozinofile absolute',
  'eozinofil abs': 'Eozinofile absolute',
  'eozinofil (abs)': 'Eozinofile absolute',
  'bazofile %': 'Bazofile %',
  'bazofil %': 'Bazofile %',
  'bazofil (%)': 'Bazofile %',
  'bazofile absolute': 'Bazofile absolute',
  'bazofil abs': 'Bazofile absolute',
  'bazofil (abs)': 'Bazofile absolute',
  'trombocite': 'Trombocite',
  'nr. trombocite': 'Trombocite',
  'numar trombocite': 'Trombocite',
  'plt': 'Trombocite',
  'volum trombocitar mediu': 'Volum trombocitar mediu (VTM)',
  'volum trombocitar mediu (vtm)': 'Volum trombocitar mediu (VTM)',
  'vtm': 'Volum trombocitar mediu (VTM)',
  'mpv': 'Volum trombocitar mediu (VTM)',
  'largimea distributiei trombocitare': 'Largimea distributiei trombocitare (PDW)',
  'pdw': 'Largimea distributiei trombocitare (PDW)',
  'reticulocite %': 'Reticulocite %',
  'reticulocite abs': 'Reticulocite absolute',
  'vsh': 'VSH',
  'viteza de sedimentare a hematiilor': 'VSH',
  'esr': 'VSH',
  'timp de protrombina': 'Timp de protrombina (TP)',
  'tp': 'Timp de protrombina (TP)',
  'inr': 'INR',
  'procente de protrombina': 'Activitate protrombina %',
  'aptt': 'aPTT',
  'aptt actin fs': 'aPTT',
  'fibrinogen': 'Fibrinogen',
  'd-dimeri': 'D-Dimeri',
  'd dimeri': 'D-Dimeri',
  'glucoza': 'Glucoza',
  'glucoza serica': 'Glucoza',
  'glicemie': 'Glucoza',
  'hemoglobina glicata hba1c': 'Hemoglobina glicata (HbA1c)',
  'hemoglobina glicata': 'Hemoglobina glicata (HbA1c)',
  'hba1c': 'Hemoglobina glicata (HbA1c)',
  'insulina': 'Insulina',
  'homa-ir': 'HOMA-IR',
  'homa ir': 'HOMA-IR',
  'colesterol total': 'Colesterol total',
  'colesterol': 'Colesterol total',
  'colesterol hdl': 'Colesterol HDL',
  'hdl colesterol': 'Colesterol HDL',
  'hdl': 'Colesterol HDL',
  'colesterol ldl': 'Colesterol LDL',
  'ldl colesterol': 'Colesterol LDL',
  'ldl': 'Colesterol LDL',
  'trigliceride': 'Trigliceride',
  'alt (tgp)': 'ALT (TGP)',
  'alt': 'ALT (TGP)',
  'tgp': 'ALT (TGP)',
  'alat': 'ALT (TGP)',
  'alaninaminotransferaza': 'ALT (TGP)',
  'alaninaminotransferaza (gpt/alat/alt)': 'ALT (TGP)',
  'alaninaminotransferaza (gpt/alt)': 'ALT (TGP)',
  'ast (tgo)': 'AST (TGO)',
  'ast': 'AST (TGO)',
  'tgo': 'AST (TGO)',
  'asat': 'AST (TGO)',
  'aspartataminotransferaza': 'AST (TGO)',
  'aspartataminotransferaza (got/asat/ast)': 'AST (TGO)',
  'aspartataminotransferaza (got/ast)': 'AST (TGO)',
  'ggt': 'GGT',
  'gamma-glutamiltransferaza': 'GGT',
  'fosfataza alcalina': 'Fosfataza alcalina',
  'alp': 'Fosfataza alcalina',
  'bilirubina totala': 'Bilirubina totala',
  'bilirubina': 'Bilirubina totala',
  'bilirubina directa': 'Bilirubina directa',
  'bilirubina indirecta': 'Bilirubina indirecta',
  'proteine totale': 'Proteine totale',
  'albumina': 'Albumina',
  'creatinina': 'Creatinina',
  'creatinina serica': 'Creatinina',
  'egfr': 'eGFR',
  'uree': 'Uree',
  'uree serica': 'Uree',
  'acid uric': 'Acid uric',
  'sodiu': 'Sodiu',
  'sodiu seric': 'Sodiu',
  'potasiu': 'Potasiu',
  'potasiu seric': 'Potasiu',
  'calciu': 'Calciu',
  'calciu seric': 'Calciu',
  'calciu ionic': 'Calciu ionic',
  'magneziu': 'Magneziu',
  'fosfor': 'Fosfor',
  'fier': 'Fier seric',
  'fier seric': 'Fier seric',
  'feritina': 'Feritina',
  'transferina': 'Transferina',
  'tibc': 'TIBC',
  'amilaza': 'Amilaza',
  'amilaza serica': 'Amilaza',
  'lipaza': 'Lipaza',
  'lipaza serica': 'Lipaza',
  'proteina c reactiva': 'Proteina C reactiva (CRP)',
  'crp': 'Proteina C reactiva (CRP)',
  'homocisteina': 'Homocisteina',
  'tsh': 'TSH',
  'tsh (hormon de stimulare tiroidiana)': 'TSH',
  'tsh (h. de stimulare tiroidiana)': 'TSH',
  't3': 'T3 total',
  'ft3': 'FT3',
  't3 liber': 'FT3',
  'free t3': 'FT3',
  't4': 'T4 total',
  'ft4': 'FT4',
  't4 liber': 'FT4',
  'free t4': 'FT4',
  'free t4 (ft4 - tiroxina libera)': 'FT4',
  'anti-tpo': 'Anti-TPO',
  'anti tpo': 'Anti-TPO',
  'anti-tiroidperoxidaza': 'Anti-TPO',
  'anti-tiroglobulina': 'Anti-tiroglobulina',
  'anti tiroglobulina': 'Anti-tiroglobulina',
  'tiroglobulina': 'Tiroglobulina',
  'tiroglobulina high sensitive (hstg)': 'Tiroglobulina',
  'pth': 'PTH intact',
  'pth intact': 'PTH intact',
  'pth intact (parathormon)': 'PTH intact',
  'parathormon': 'PTH intact',
  'cortizol': 'Cortizol',
  'dhea-s': 'DHEA-S',
  'dhea': 'DHEA-S',
  'dhea-s (dehidroepiandrosteron sulfat)': 'DHEA-S',
  'vitamina d': 'Vitamina D (25-OH)',
  'vitamina d-25-hydroxyvit d': 'Vitamina D (25-OH)',
  '25-oh vitamina d': 'Vitamina D (25-OH)',
  'fsh': 'FSH',
  'lh': 'LH',
  'estradiol': 'Estradiol (E2)',
  'progesteron': 'Progesteron',
  'prolactina': 'Prolactina',
  'testosteron': 'Testosteron total',
  'testosteron total': 'Testosteron total',
  'testosteron liber': 'Testosteron liber',
  'amh': 'AMH',
  'beta-hcg': 'Beta-HCG',
  'hcg': 'Beta-HCG',
  'vitamina b12': 'Vitamina B12',
  'acid folic': 'Acid folic (B9)',
  'folat': 'Acid folic (B9)',
  'zinc': 'Zinc',
  'seleniu': 'Seleniu',
  'cupru': 'Cupru',
  'iga': 'IgA',
  'igg': 'IgG',
  'igm': 'IgM',
  'ige total': 'IgE total',
  'ige': 'IgE total',
  'ana': 'ANA',
  'factor reumatoid': 'Factor reumatoid (FR)',
  'anti-ccp': 'Anti-CCP',
  'hbsag': 'HBsAg (Hepatita B)',
  'anti-hbs': 'Anti-HBs (Hepatita B)',
  'anti-hcv': 'Anti-HCV (Hepatita C)',
  'anti-hiv': 'Anti-HIV',
  'anti virus epstein barr vca igg': 'EBV VCA IgG',
  'anti virus epstein barr vca igm': 'EBV VCA IgM',
  'anti citomegalovirus igg': 'CMV IgG',
  'anti citomegalovirus igm': 'CMV IgM',
  'anti toxoplasma gondii igg': 'Toxoplasma IgG',
  'toxoplasma gondii igg': 'Toxoplasma IgG',
  'anti toxoplasma gondii igm': 'Toxoplasma IgM',
  'toxoplasma gondii igm': 'Toxoplasma IgM',
  'toxoplasma gondii - anticorpi igm': 'Toxoplasma IgM',
  'psa': 'PSA total',
  'psa total': 'PSA total',
  'psa liber': 'PSA liber',
  'cea': 'CEA',
  'afp': 'AFP',
  'ca 125': 'CA 125',
  'ca125': 'CA 125',
  'ca 19-9': 'CA 19-9',
  'ca19-9': 'CA 19-9',
  'ca 15-3': 'CA 15-3',
  'troponina': 'Troponina I',
  'bnp': 'BNP',
  'nt-probnp': 'NT-proBNP',
  'ck-mb': 'CK-MB',
  'antigen streptococ betahemolitic grup a': 'Ag Streptococ grup A',
  'antigen streptococ betahemolitic grup a din ex. faringian': 'Ag Streptococ grup A',
  'sumar urina': 'Sumar urina',
  'examen sumar urina': 'Sumar urina',
  'microalbuminurie': 'Microalbuminurie',
  'examen coproparazitologic': 'Examen coproparazitologic',
  'coproparazitologic': 'Examen coproparazitologic',
}

const INTERVALE_STANDARD: Record<string, [number | null, number | null, string]> = {
  'Eritrocite': [3.8, 5.8, 'x10⁶/µL'],
  'Hemoglobina': [12.0, 17.5, 'g/dL'],
  'Hematocrit': [36, 52, '%'],
  'Volum eritrocitar mediu (VEM)': [80, 100, 'fL'],
  'Hemoglobina eritrocitara medie (HEM)': [27, 33, 'pg'],
  'Concentratie medie Hb/eritrocit (CHEM)': [32, 36, 'g/dL'],
  'Largimea distributiei eritrocitare (RDW)': [11.5, 14.5, '%'],
  'Leucocite': [4.0, 10.0, 'x10³/µL'],
  'Neutrofile %': [45, 75, '%'],
  'Neutrofile absolute': [1.8, 7.5, 'x10³/µL'],
  'Limfocite %': [20, 45, '%'],
  'Limfocite absolute': [1.0, 4.5, 'x10³/µL'],
  'Monocite %': [2, 10, '%'],
  'Monocite absolute': [0.2, 1.0, 'x10³/µL'],
  'Eozinofile %': [1, 6, '%'],
  'Eozinofile absolute': [0.04, 0.5, 'x10³/µL'],
  'Bazofile %': [0, 1, '%'],
  'Bazofile absolute': [0, 0.1, 'x10³/µL'],
  'Trombocite': [150, 400, 'x10³/µL'],
  'Volum trombocitar mediu (VTM)': [7.5, 12.5, 'fL'],
  'Largimea distributiei trombocitare (PDW)': [9, 17, '%'],
  'Reticulocite %': [0.5, 2.5, '%'],
  'VSH': [0, 20, 'mm/h'],
  'Timp de protrombina (TP)': [11, 14, 's'],
  'INR': [0.8, 1.2, ''],
  'Activitate protrombina %': [70, 130, '%'],
  'aPTT': [25, 38, 's'],
  'Fibrinogen': [200, 400, 'mg/dL'],
  'D-Dimeri': [0, 0.5, 'mg/L'],
  'Glucoza': [70, 99, 'mg/dL'],
  'Hemoglobina glicata (HbA1c)': [4.0, 5.6, '%'],
  'Insulina': [2.6, 24.9, 'µUI/mL'],
  'HOMA-IR': [0, 2.5, ''],
  'Colesterol total': [0, 200, 'mg/dL'],
  'Colesterol HDL': [40, 999, 'mg/dL'],
  'Colesterol LDL': [0, 130, 'mg/dL'],
  'Trigliceride': [0, 150, 'mg/dL'],
  'ALT (TGP)': [0, 40, 'U/L'],
  'AST (TGO)': [0, 40, 'U/L'],
  'GGT': [0, 55, 'U/L'],
  'Fosfataza alcalina': [40, 130, 'U/L'],
  'Bilirubina totala': [0.2, 1.2, 'mg/dL'],
  'Bilirubina directa': [0, 0.3, 'mg/dL'],
  'Bilirubina indirecta': [0.2, 0.9, 'mg/dL'],
  'Proteine totale': [6.0, 8.3, 'g/dL'],
  'Albumina': [3.5, 5.0, 'g/dL'],
  'Creatinina': [0.6, 1.2, 'mg/dL'],
  'eGFR': [60, 999, 'mL/min/1.73m²'],
  'Uree': [10, 45, 'mg/dL'],
  'Acid uric': [2.4, 7.0, 'mg/dL'],
  'Sodiu': [136, 145, 'mEq/L'],
  'Potasiu': [3.5, 5.1, 'mEq/L'],
  'Calciu': [8.5, 10.5, 'mg/dL'],
  'Calciu ionic': [4.5, 5.3, 'mg/dL'],
  'Magneziu': [1.7, 2.4, 'mg/dL'],
  'Fosfor': [2.5, 4.5, 'mg/dL'],
  'Fier seric': [50, 170, 'µg/dL'],
  'Feritina': [12, 300, 'ng/mL'],
  'Transferina': [200, 360, 'mg/dL'],
  'TIBC': [250, 370, 'µg/dL'],
  'Amilaza': [25, 125, 'U/L'],
  'Lipaza': [13, 60, 'U/L'],
  'Proteina C reactiva (CRP)': [0, 5, 'mg/L'],
  'Homocisteina': [5, 15, 'µmol/L'],
  'TSH': [0.4, 4.0, 'mUI/L'],
  'T3 total': [0.8, 2.0, 'ng/mL'],
  'FT3': [2.3, 4.2, 'pg/mL'],
  'T4 total': [4.5, 12.5, 'µg/dL'],
  'FT4': [0.8, 1.8, 'ng/dL'],
  'PTH intact': [15, 65, 'pg/mL'],
  'Cortizol': [6.2, 19.4, 'µg/dL'],
  'DHEA-S': [35, 430, 'µg/dL'],
  'Vitamina D (25-OH)': [30, 100, 'ng/mL'],
  'FSH': [1.5, 12.4, 'mUI/mL'],
  'LH': [1.7, 8.6, 'mUI/mL'],
  'Estradiol (E2)': [20, 350, 'pg/mL'],
  'Progesteron': [0.1, 25, 'ng/mL'],
  'Prolactina': [2.8, 29.2, 'ng/mL'],
  'Testosteron total': [8, 48, 'nmol/L'],
  'Testosteron liber': [0.29, 1.67, 'nmol/L'],
  'AMH': [0.9, 9.5, 'ng/mL'],
  'Vitamina B12': [200, 900, 'pg/mL'],
  'Acid folic (B9)': [3.0, 17.0, 'ng/mL'],
  'Zinc': [70, 120, 'µg/dL'],
  'Seleniu': [70, 150, 'µg/L'],
  'Cupru': [70, 140, 'µg/dL'],
  'IgA': [70, 400, 'mg/dL'],
  'IgG': [700, 1600, 'mg/dL'],
  'IgM': [40, 230, 'mg/dL'],
  'IgE total': [0, 100, 'UI/mL'],
  'PSA total': [0, 4.0, 'ng/mL'],
  'CEA': [0, 3.0, 'ng/mL'],
  'AFP': [0, 7.0, 'ng/mL'],
  'CA 125': [0, 35, 'U/mL'],
  'CA 19-9': [0, 37, 'U/mL'],
  'CA 15-3': [0, 30, 'U/mL'],
  'Troponina I': [0, 0.04, 'ng/mL'],
  'BNP': [0, 100, 'pg/mL'],
  'NT-proBNP': [0, 125, 'pg/mL'],
  'CK-MB': [0, 25, 'U/L'],
}

function normalizeazaNume(nume: string): string {
  const numeLower = nume.toLowerCase().trim()
  return NOMENCLATOR[numeLower] || nume
}

function getIntervalStandard(numeNormalizat: string): { ref_min: number | null, ref_max: number | null, unitate_standard: string } {
  const interval = INTERVALE_STANDARD[numeNormalizat]
  if (!interval) return { ref_min: null, ref_max: null, unitate_standard: '' }
  return { ref_min: interval[0], ref_max: interval[1], unitate_standard: interval[2] }
}

function getStatusStandard(valoare: number | null, numeNormalizat: string): string {
  if (valoare === null) return 'necunoscut'
  const interval = INTERVALE_STANDARD[numeNormalizat]
  if (!interval) return 'necunoscut'
  const [min, max] = interval
  if (min !== null && valoare < min) return 'sub'
  if (max !== null && valoare > max) return 'peste'
  return 'normal'
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
        max_tokens: 8192,
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
              text: `Extrage TOATE analizele din acest document medical PDF. Pentru analize cu valoare numerica foloseste tip_rezultat "numeric". Pentru analize cu rezultat text (negativ/pozitiv/prezent/absent/reactiv/neractiv) foloseste tip_rezultat "calitativ" si pune rezultatul in rezultat_text. Extrage si orasul si tara laboratorului daca sunt mentionate. Returneaza STRICT JSON valid fara text suplimentar:
{"analize":[{"nume":"numele exact al analizei din document","valoare":"valoarea numerica sau null","unitate":"unitatea de masura sau null","referinta_min_lab":"valoarea minima din documentul laboratorului sau null","referinta_max_lab":"valoarea maxima din documentul laboratorului sau null","tip_rezultat":"numeric sau calitativ","rezultat_text":"rezultatul text complet sau null","status":"normal sau peste sau sub sau negativ sau pozitiv sau necunoscut","data":"YYYY-MM-DD sau null"}],"laborator":"numele laboratorului sau null","oras_laborator":"orasul laboratorului sau null","tara_laborator":"tara laboratorului sau null","data_buletin":"YYYY-MM-DD sau null"}`
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

    const analizeNormalizate = (parsed.analize || []).map((a: any) => {
      const numeNormalizat = normalizeazaNume(a.nume)
      const valoareNumerica = a.valoare ? parseFloat(a.valoare) : null
      const { ref_min, ref_max, unitate_standard } = getIntervalStandard(numeNormalizat)
      const statusStandard = a.tip_rezultat === 'calitativ'
        ? a.status
        : getStatusStandard(valoareNumerica, numeNormalizat)

      return {
        ...a,
        nume: numeNormalizat,
        status: statusStandard,
        referinta_min: ref_min,
        referinta_max: ref_max,
        referinta_min_lab: a.referinta_min_lab,
        referinta_max_lab: a.referinta_max_lab,
        unitate_standard: unitate_standard,
      }
    })

    return NextResponse.json({
      analize: analizeNormalizate,
      laborator: parsed.laborator,
      oras_laborator: parsed.oras_laborator,
      tara_laborator: parsed.tara_laborator,
      data_buletin: parsed.data_buletin,
    })

  } catch (error) {
    console.error('Extract error:', error)
    return NextResponse.json({ error: 'A aparut o eroare la procesare.' }, { status: 500 })
  }
}