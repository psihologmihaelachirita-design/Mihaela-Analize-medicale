import { NextRequest, NextResponse } from 'next/server'

const NOMENCLATOR: Record<string, string> = {
  // HEMATOLOGIE — Hemograma completa
  'hemograma': 'Hemograma completa',
  'hemograma completa': 'Hemograma completa',
  'cbc': 'Hemograma completa',
  'blood count': 'Hemograma completa',

  // Eritrocite
  'eritrocite': 'Eritrocite',
  'nr. eritrocite': 'Eritrocite',
  'numar eritrocite': 'Eritrocite',
  'globule rosii': 'Eritrocite',
  'rbc': 'Eritrocite',
  'red blood cells': 'Eritrocite',

  // Hemoglobina
  'hemoglobina': 'Hemoglobina',
  'hemoglobina (hb)': 'Hemoglobina',
  'hb': 'Hemoglobina',
  'hgb': 'Hemoglobina',

  // Hematocrit
  'hematocrit': 'Hematocrit',
  'ht': 'Hematocrit',
  'hct': 'Hematocrit',
  'volum eritrocitar (%)': 'Hematocrit',

  // VEM
  'volum eritrocitar mediu': 'Volum eritrocitar mediu (VEM)',
  'volum eritrocitar mediu (vem)': 'Volum eritrocitar mediu (VEM)',
  'vem': 'Volum eritrocitar mediu (VEM)',
  'mcv': 'Volum eritrocitar mediu (VEM)',
  'mean corpuscular volume': 'Volum eritrocitar mediu (VEM)',

  // HEM
  'hemoglobina eritrocitara medie': 'Hemoglobina eritrocitara medie (HEM)',
  'hemoglobina eritrocitara medie (hem)': 'Hemoglobina eritrocitara medie (HEM)',
  'hem': 'Hemoglobina eritrocitara medie (HEM)',
  'mch': 'Hemoglobina eritrocitara medie (HEM)',
  'mean corpuscular hemoglobin': 'Hemoglobina eritrocitara medie (HEM)',

  // CHEM
  'concentratie medie hb/eritrocit': 'Concentratie medie Hb/eritrocit (CHEM)',
  'concentratie medie a hb/eritrocit': 'Concentratie medie Hb/eritrocit (CHEM)',
  'concentratie medie hemoglobina': 'Concentratie medie Hb/eritrocit (CHEM)',
  'chem': 'Concentratie medie Hb/eritrocit (CHEM)',
  'mchc': 'Concentratie medie Hb/eritrocit (CHEM)',

  // RDW
  'largimea distributiei eritrocitare': 'Largimea distributiei eritrocitare (RDW)',
  'rdw': 'Largimea distributiei eritrocitare (RDW)',
  'red cell distribution width': 'Largimea distributiei eritrocitare (RDW)',

  // Leucocite
  'leucocite': 'Leucocite',
  'nr. leucocite': 'Leucocite',
  'numar leucocite': 'Leucocite',
  'globule albe': 'Leucocite',
  'wbc': 'Leucocite',
  'white blood cells': 'Leucocite',

  // Neutrofile
  'neutrofile %': 'Neutrofile %',
  'neutrofil %': 'Neutrofile %',
  'neutrofil (%)': 'Neutrofile %',
  'neutrofile(%)': 'Neutrofile %',
  'neutrofile %': 'Neutrofile %',
  'gran %': 'Neutrofile %',
  'granulocite %': 'Neutrofile %',
  'neut %': 'Neutrofile %',

  'neutrofile absolute': 'Neutrofile absolute',
  'neutrofil abs': 'Neutrofile absolute',
  'neutrofil (abs)': 'Neutrofile absolute',
  'neutrofil (#)': 'Neutrofile absolute',
  'neutrofile #': 'Neutrofile absolute',
  'gran #': 'Neutrofile absolute',
  'neut #': 'Neutrofile absolute',
  'neutrophils': 'Neutrofile absolute',

  // Limfocite
  'limfocite %': 'Limfocite %',
  'limfocit %': 'Limfocite %',
  'limfocit (%)': 'Limfocite %',
  'limfocite(%)': 'Limfocite %',
  'lymph %': 'Limfocite %',
  'lymphocytes %': 'Limfocite %',

  'limfocite absolute': 'Limfocite absolute',
  'limfocit abs': 'Limfocite absolute',
  'limfocit (abs)': 'Limfocite absolute',
  'limfocit (#)': 'Limfocite absolute',
  'limfocite #': 'Limfocite absolute',
  'lymph #': 'Limfocite absolute',
  'lymphocytes': 'Limfocite absolute',

  // Monocite
  'monocite %': 'Monocite %',
  'monocit %': 'Monocite %',
  'monocit (%)': 'Monocite %',
  'mono %': 'Monocite %',

  'monocite absolute': 'Monocite absolute',
  'monocit abs': 'Monocite absolute',
  'monocit (abs)': 'Monocite absolute',
  'monocit (#)': 'Monocite absolute',
  'mono #': 'Monocite absolute',
  'monocytes': 'Monocite absolute',

  // Eozinofile
  'eozinofile %': 'Eozinofile %',
  'eozinofil %': 'Eozinofile %',
  'eozinofil (%)': 'Eozinofile %',
  'eosino %': 'Eozinofile %',
  'eos %': 'Eozinofile %',

  'eozinofile absolute': 'Eozinofile absolute',
  'eozinofil abs': 'Eozinofile absolute',
  'eozinofil (abs)': 'Eozinofile absolute',
  'eozinofil (#)': 'Eozinofile absolute',
  'eos #': 'Eozinofile absolute',
  'eosinophils': 'Eozinofile absolute',

  // Bazofile
  'bazofile %': 'Bazofile %',
  'bazofil %': 'Bazofile %',
  'bazofil (%)': 'Bazofile %',
  'baso %': 'Bazofile %',

  'bazofile absolute': 'Bazofile absolute',
  'bazofil abs': 'Bazofile absolute',
  'bazofil (abs)': 'Bazofile absolute',
  'bazofil (#)': 'Bazofile absolute',
  'baso #': 'Bazofile absolute',
  'basophils': 'Bazofile absolute',

  // Granulocite imature
  'granulocite imature %': 'Granulocite imature %',
  'granulocite imature abs': 'Granulocite imature absolute',
  'ig %': 'Granulocite imature %',
  'immature granulocytes': 'Granulocite imature %',

  // Trombocite
  'trombocite': 'Trombocite',
  'nr. trombocite': 'Trombocite',
  'numar trombocite': 'Trombocite',
  'plachete': 'Trombocite',
  'plt': 'Trombocite',
  'platelets': 'Trombocite',
  'trombocite (plt)': 'Trombocite',

  // VTM
  'volum trombocitar mediu': 'Volum trombocitar mediu (VTM)',
  'volum trombocitar mediu (vtm)': 'Volum trombocitar mediu (VTM)',
  'vtm': 'Volum trombocitar mediu (VTM)',
  'mpv': 'Volum trombocitar mediu (VTM)',
  'mean platelet volume': 'Volum trombocitar mediu (VTM)',

  // PDW
  'largimea distributiei trombocitare': 'Largimea distributiei trombocitare (PDW)',
  'pdw': 'Largimea distributiei trombocitare (PDW)',
  'platelet distribution width': 'Largimea distributiei trombocitare (PDW)',

  // Reticulocite
  'reticulocite %': 'Reticulocite %',
  'reticulocite abs': 'Reticulocite absolute',
  'ret %': 'Reticulocite %',
  'reticulocytes': 'Reticulocite %',

  // VSH
  'vsh': 'VSH',
  'viteza de sedimentare a hematiilor': 'VSH',
  'esr': 'VSH',
  'erythrocyte sedimentation rate': 'VSH',

  // COAGULARE
  'timp de protrombina': 'Timp de protrombina (TP)',
  'timp protrombina': 'Timp de protrombina (TP)',
  'tp': 'Timp de protrombina (TP)',
  'pt': 'Timp de protrombina (TP)',
  'prothrombin time': 'Timp de protrombina (TP)',

  'inr': 'INR',
  'international normalized ratio': 'INR',

  'procente de protrombina': 'Activitate protrombina %',
  'activitate protrombina': 'Activitate protrombina %',
  'quick': 'Activitate protrombina %',

  'aptt': 'aPTT',
  'aptt actin fs': 'aPTT',
  'timp partial de tromboplastina activata': 'aPTT',
  'activated partial thromboplastin time': 'aPTT',

  'fibrinogen': 'Fibrinogen',
  'fibrinogen (clauss)': 'Fibrinogen',

  'd-dimeri': 'D-Dimeri',
  'd dimeri': 'D-Dimeri',
  'd-dimer': 'D-Dimeri',

  // BIOCHIMIE — Glucoza
  'glucoza': 'Glucoza',
  'glucoza serica': 'Glucoza',
  'glicemie': 'Glucoza',
  'glycemia': 'Glucoza',
  'blood glucose': 'Glucoza',
  'glucose': 'Glucoza',

  // HbA1c
  'hemoglobina glicata hba1c': 'Hemoglobina glicata (HbA1c)',
  'hemoglobina glicata': 'Hemoglobina glicata (HbA1c)',
  'hba1c': 'Hemoglobina glicata (HbA1c)',
  'glycated hemoglobin': 'Hemoglobina glicata (HbA1c)',

  // Insulina
  'insulina': 'Insulina',
  'insulina serica': 'Insulina',
  'insulin': 'Insulina',

  // HOMA-IR
  'homa-ir': 'HOMA-IR',
  'homa ir': 'HOMA-IR',
  'homeostasis model assessment': 'HOMA-IR',

  // Colesterol
  'colesterol total': 'Colesterol total',
  'colesterol': 'Colesterol total',
  'total cholesterol': 'Colesterol total',
  'cholesterol': 'Colesterol total',

  'colesterol hdl': 'Colesterol HDL',
  'hdl colesterol': 'Colesterol HDL',
  'hdl': 'Colesterol HDL',
  'hdl-cholesterol': 'Colesterol HDL',
  'high density lipoprotein': 'Colesterol HDL',

  'colesterol ldl': 'Colesterol LDL',
  'ldl colesterol': 'Colesterol LDL',
  'ldl': 'Colesterol LDL',
  'ldl-cholesterol': 'Colesterol LDL',
  'low density lipoprotein': 'Colesterol LDL',

  'trigliceride': 'Trigliceride',
  'triglycerides': 'Trigliceride',
  'tg': 'Trigliceride',

  // Transaminaze
  'alt (tgp)': 'ALT (TGP)',
  'alt': 'ALT (TGP)',
  'tgp': 'ALT (TGP)',
  'alat': 'ALT (TGP)',
  'alanin aminotransferaza': 'ALT (TGP)',
  'alaninaminotransferaza': 'ALT (TGP)',
  'alaninaminotransferaza (gpt/alat/alt)': 'ALT (TGP)',
  'alaninaminotransferaza (gpt/alt)': 'ALT (TGP)',
  'alanine aminotransferase': 'ALT (TGP)',
  'sgpt': 'ALT (TGP)',

  'ast (tgo)': 'AST (TGO)',
  'ast': 'AST (TGO)',
  'tgo': 'AST (TGO)',
  'asat': 'AST (TGO)',
  'aspartat aminotransferaza': 'AST (TGO)',
  'aspartataminotransferaza': 'AST (TGO)',
  'aspartataminotransferaza (got/asat/ast)': 'AST (TGO)',
  'aspartataminotransferaza (got/ast)': 'AST (TGO)',
  'aspartate aminotransferase': 'AST (TGO)',
  'sgot': 'AST (TGO)',

  'ggt': 'GGT',
  'gamma-glutamiltransferaza': 'GGT',
  'gamma glutamil transferaza': 'GGT',
  'gamma-gt': 'GGT',
  'gamma glutamyltransferase': 'GGT',

  'fosfataza alcalina': 'Fosfataza alcalina',
  'alkaline phosphatase': 'Fosfataza alcalina',
  'alp': 'Fosfataza alcalina',

  // Bilirubina
  'bilirubina totala': 'Bilirubina totala',
  'bilirubina': 'Bilirubina totala',
  'total bilirubin': 'Bilirubina totala',
  'tbil': 'Bilirubina totala',

  'bilirubina directa': 'Bilirubina directa',
  'bilirubina conjugata': 'Bilirubina directa',
  'direct bilirubin': 'Bilirubina directa',

  'bilirubina indirecta': 'Bilirubina indirecta',
  'bilirubina neconjugata': 'Bilirubina indirecta',
  'indirect bilirubin': 'Bilirubina indirecta',

  // Proteine
  'proteine totale': 'Proteine totale',
  'total protein': 'Proteine totale',

  'albumina': 'Albumina',
  'albumina serica': 'Albumina',
  'albumin': 'Albumina',

  // Functie renala
  'creatinina': 'Creatinina',
  'creatinina serica': 'Creatinina',
  'creatinine': 'Creatinina',

  'egfr': 'eGFR',
  'rata de filtrare glomerulara': 'eGFR',
  'glomerular filtration rate': 'eGFR',
  'mdrd': 'eGFR',
  'ckd-epi': 'eGFR',

  'uree': 'Uree',
  'uree serica': 'Uree',
  'blood urea nitrogen': 'Uree',
  'bun': 'Uree',
  'urea': 'Uree',

  'acid uric': 'Acid uric',
  'uric acid': 'Acid uric',

  // Electrolit
  'sodiu': 'Sodiu',
  'sodiu seric': 'Sodiu',
  'sodium': 'Sodiu',
  'na': 'Sodiu',
  'na+': 'Sodiu',

  'potasiu': 'Potasiu',
  'potasiu seric': 'Potasiu',
  'potassium': 'Potasiu',
  'k': 'Potasiu',
  'k+': 'Potasiu',

  'calciu': 'Calciu',
  'calciu seric': 'Calciu',
  'calcium': 'Calciu',
  'ca': 'Calciu',
  'ca2+': 'Calciu',

  'calciu ionic': 'Calciu ionic',
  'calciu ionizat': 'Calciu ionic',
  'ionized calcium': 'Calciu ionic',
  'ca ionic': 'Calciu ionic',

  'magneziu': 'Magneziu',
  'magneziu seric': 'Magneziu',
  'magnesium': 'Magneziu',
  'mg': 'Magneziu',

  'fosfor': 'Fosfor',
  'fosfor seric': 'Fosfor',
  'phosphorus': 'Fosfor',
  'phosphate': 'Fosfor',

  'clor': 'Clor',
  'cloruri': 'Clor',
  'chloride': 'Clor',
  'cl-': 'Clor',

  // Fier si metabolism feric
  'fier': 'Fier seric',
  'fier seric': 'Fier seric',
  'iron': 'Fier seric',
  'serum iron': 'Fier seric',
  'fe': 'Fier seric',

  'feritina': 'Feritina',
  'feritina serica': 'Feritina',
  'ferritin': 'Feritina',

  'transferina': 'Transferina',
  'transferrina': 'Transferina',
  'transferrin': 'Transferina',

  'capacitate totala de legare a fierului': 'TIBC',
  'tibc': 'TIBC',
  'total iron binding capacity': 'TIBC',

  'saturatie transferina': 'Saturatie transferina %',
  'transferrin saturation': 'Saturatie transferina %',

  // Enzime pancreatice
  'amilaza': 'Amilaza',
  'amilaza serica': 'Amilaza',
  'amylase': 'Amilaza',

  'lipaza': 'Lipaza',
  'lipaza serica': 'Lipaza',
  'lipase': 'Lipaza',

  // Proteina C reactiva
  'proteina c reactiva': 'Proteina C reactiva (CRP)',
  'proteina c reactiva (crp)': 'Proteina C reactiva (CRP)',
  'crp': 'Proteina C reactiva (CRP)',
  'c-reactive protein': 'Proteina C reactiva (CRP)',
  'hs-crp': 'Proteina C reactiva (CRP)',
  'crp high sensitivity': 'Proteina C reactiva (CRP)',

  // Homocisteina
  'homocisteina': 'Homocisteina',
  'homocysteine': 'Homocisteina',

  // ENDOCRINOLOGIE — Tiroida
  'tsh': 'TSH',
  'tsh (hormon de stimulare tiroidiana)': 'TSH',
  'tsh (h. de stimulare tiroidiana)': 'TSH',
  'thyroid stimulating hormone': 'TSH',
  'thyrotropin': 'TSH',

  't3': 'T3 total',
  't3 (triiodotironina)': 'T3 total',
  'triiodotironina': 'T3 total',
  'total t3': 'T3 total',
  'triiodothyronine': 'T3 total',

  'ft3': 'FT3',
  't3 liber': 'FT3',
  'free t3': 'FT3',
  'ft3 (triiodotironina libera)': 'FT3',

  't4': 'T4 total',
  't4 (tiroxina)': 'T4 total',
  'tiroxina': 'T4 total',
  'total t4': 'T4 total',
  'thyroxine': 'T4 total',

  'ft4': 'FT4',
  't4 liber': 'FT4',
  'free t4': 'FT4',
  'ft4 (tiroxina libera)': 'FT4',
  'free t4 (ft4 - tiroxina libera)': 'FT4',

  'anti-tpo': 'Anti-TPO',
  'anti tpo': 'Anti-TPO',
  'anticorpi antitiroidperoxidaza': 'Anti-TPO',
  'anti-tiroidperoxidaza': 'Anti-TPO',
  'anti-tpo (anti-tiroidperoxidaza)': 'Anti-TPO',
  'thyroid peroxidase antibodies': 'Anti-TPO',
  'tpo ab': 'Anti-TPO',

  'anti-tiroglobulina': 'Anti-tiroglobulina',
  'anti tiroglobulina': 'Anti-tiroglobulina',
  'anticorpi antitiroglobulina': 'Anti-tiroglobulina',
  'tg ab': 'Anti-tiroglobulina',
  'thyroglobulin antibodies': 'Anti-tiroglobulina',

  'tiroglobulina': 'Tiroglobulina',
  'tiroglobulina high sensitive (hstg)': 'Tiroglobulina',
  'thyroglobulin': 'Tiroglobulina',
  'tg': 'Tiroglobulina',

  // Paratiroide
  'pth': 'PTH intact',
  'pth intact': 'PTH intact',
  'pth intact (parathormon)': 'PTH intact',
  'parathormon': 'PTH intact',
  'parathyroid hormone': 'PTH intact',

  // Suprarenale
  'cortizol': 'Cortizol',
  'cortisol': 'Cortizol',
  'cortizol seric': 'Cortizol',

  'dhea-s': 'DHEA-S',
  'dhea': 'DHEA-S',
  'dhea-s (dehidroepiandrosteron sulfat)': 'DHEA-S',
  'dehydroepiandrosterone sulfate': 'DHEA-S',

  // Vitamina D
  'vitamina d': 'Vitamina D (25-OH)',
  'vitamina d-25-hydroxyvit d': 'Vitamina D (25-OH)',
  '25-oh vitamina d': 'Vitamina D (25-OH)',
  '25-hydroxyvitamin d': 'Vitamina D (25-OH)',
  'vitamina d3': 'Vitamina D (25-OH)',
  'calcidiol': 'Vitamina D (25-OH)',

  // FERTILITATE
  'fsh': 'FSH',
  'hormon foliculostimulant': 'FSH',
  'follicle stimulating hormone': 'FSH',

  'lh': 'LH',
  'hormon luteinizant': 'LH',
  'luteinizing hormone': 'LH',

  'estradiol': 'Estradiol (E2)',
  'e2': 'Estradiol (E2)',
  'estradiol (e2)': 'Estradiol (E2)',
  'oestradiol': 'Estradiol (E2)',

  'progesteron': 'Progesteron',
  'progesterone': 'Progesteron',

  'prolactina': 'Prolactina',
  'prolactin': 'Prolactina',

  'testosteron': 'Testosteron total',
  'testosteron total': 'Testosteron total',
  'testosterone': 'Testosteron total',

  'testosteron liber': 'Testosteron liber',
  'free testosterone': 'Testosteron liber',

  'amh': 'AMH',
  'hormonu antimullerian': 'AMH',
  'anti-mullerian hormone': 'AMH',

  'beta-hcg': 'Beta-HCG',
  'hcg': 'Beta-HCG',
  'gonadotropina corionica': 'Beta-HCG',
  'human chorionic gonadotropin': 'Beta-HCG',

  // VITAMINE si MINERALE
  'vitamina b12': 'Vitamina B12',
  'cobalamina': 'Vitamina B12',
  'cyanocobalamin': 'Vitamina B12',
  'cobalamin': 'Vitamina B12',

  'acid folic': 'Acid folic (Vitamina B9)',
  'folat': 'Acid folic (Vitamina B9)',
  'folati': 'Acid folic (Vitamina B9)',
  'folic acid': 'Acid folic (Vitamina B9)',
  'folate': 'Acid folic (Vitamina B9)',

  'zinc': 'Zinc',
  'zinc seric': 'Zinc',

  'seleniu': 'Seleniu',
  'selenium': 'Seleniu',

  'cupru': 'Cupru',
  'copper': 'Cupru',

  // IMUNOLOGIE
  'iga': 'IgA',
  'imunoglobulina a': 'IgA',
  'immunoglobulin a': 'IgA',

  'igg': 'IgG',
  'imunoglobulina g': 'IgG',
  'immunoglobulin g': 'IgG',

  'igm': 'IgM',
  'imunoglobulina m': 'IgM',
  'immunoglobulin m': 'IgM',

  'ige total': 'IgE total',
  'imunoglobulina e': 'IgE total',
  'immunoglobulin e': 'IgE total',
  'ige': 'IgE total',

  'ana': 'ANA',
  'anticorpi antinucleari': 'ANA',
  'antinuclear antibodies': 'ANA',

  'factor reumatoid': 'Factor reumatoid (FR)',
  'fr': 'Factor reumatoid (FR)',
  'rheumatoid factor': 'Factor reumatoid (FR)',
  'rf': 'Factor reumatoid (FR)',

  'anti-ccp': 'Anti-CCP',
  'anticorpi anti-peptide citrulinate': 'Anti-CCP',
  'cyclic citrullinated peptide antibodies': 'Anti-CCP',

  // VIROLOGIE
  'hbsag': 'HBsAg (Hepatita B)',
  'antigen hbs': 'HBsAg (Hepatita B)',
  'hepatita b antigen': 'HBsAg (Hepatita B)',
  'hepatitis b surface antigen': 'HBsAg (Hepatita B)',

  'anti-hbs': 'Anti-HBs (Hepatita B)',
  'anticorpi anti-hbs': 'Anti-HBs (Hepatita B)',
  'hepatitis b surface antibody': 'Anti-HBs (Hepatita B)',

  'anti-hcv': 'Anti-HCV (Hepatita C)',
  'anticorpi anti-hcv': 'Anti-HCV (Hepatita C)',
  'hepatitis c antibody': 'Anti-HCV (Hepatita C)',

  'anti-hiv': 'Anti-HIV',
  'hiv': 'Anti-HIV',
  'hiv 1/2': 'Anti-HIV',

  'anti virus epstein barr vca igg': 'EBV VCA IgG',
  'anti-ebv vca igg': 'EBV VCA IgG',
  'epstein barr vca igg': 'EBV VCA IgG',

  'anti virus epstein barr vca igm': 'EBV VCA IgM',
  'anti-ebv vca igm': 'EBV VCA IgM',
  'epstein barr vca igm': 'EBV VCA IgM',

  'anti citomegalovirus igg': 'CMV IgG',
  'anti-cmv igg': 'CMV IgG',
  'cytomegalovirus igg': 'CMV IgG',

  'anti citomegalovirus igm': 'CMV IgM',
  'anti-cmv igm': 'CMV IgM',
  'cytomegalovirus igm': 'CMV IgM',

  'anti toxoplasma gondii igg': 'Toxoplasma IgG',
  'toxoplasma gondii igg': 'Toxoplasma IgG',
  'toxoplasma igg': 'Toxoplasma IgG',

  'anti toxoplasma gondii igm': 'Toxoplasma IgM',
  'toxoplasma gondii igm': 'Toxoplasma IgM',
  'toxoplasma igm': 'Toxoplasma IgM',
  'anti toxoplasma gondii - anticorpi igm': 'Toxoplasma IgM',

  'toxoplasma gondii - anticorpi igm': 'Toxoplasma IgM',

  'treponema pallidum': 'Treponema pallidum (Sifilis)',
  'vdrl': 'VDRL (Sifilis)',
  'tpha': 'TPHA (Sifilis)',
  'rpr': 'RPR (Sifilis)',

  // MARKERI TUMORALI
  'psa': 'PSA total',
  'psa total': 'PSA total',
  'antigen specific prostatic': 'PSA total',
  'prostate specific antigen': 'PSA total',

  'psa liber': 'PSA liber',
  'free psa': 'PSA liber',

  'cea': 'CEA',
  'antigen carcinoembrionar': 'CEA',
  'carcinoembryonic antigen': 'CEA',

  'afp': 'AFP',
  'alfa-fetoproteina': 'AFP',
  'alpha-fetoprotein': 'AFP',

  'ca 125': 'CA 125',
  'ca125': 'CA 125',
  'cancer antigen 125': 'CA 125',

  'ca 19-9': 'CA 19-9',
  'ca19-9': 'CA 19-9',
  'ca 19.9': 'CA 19-9',

  'ca 15-3': 'CA 15-3',
  'ca15-3': 'CA 15-3',

  // CARDIOLOGIE
  'troponina i': 'Troponina I',
  'troponina t': 'Troponina T',
  'troponina': 'Troponina I',
  'cardiac troponin': 'Troponina I',

  'bnp': 'BNP',
  'brain natriuretic peptide': 'BNP',

  'nt-probnp': 'NT-proBNP',
  'nt probnp': 'NT-proBNP',
  'n-terminal probnp': 'NT-proBNP',

  'ck-mb': 'CK-MB',
  'creatinkinaza mb': 'CK-MB',
  'creatine kinase mb': 'CK-MB',

  // MICROBIOLOGIE
  'antigen streptococ betahemolitic grup a': 'Ag Streptococ grup A',
  'antigen streptococ betahemolitic grup a din ex. faringian': 'Ag Streptococ grup A',
  'streptococ grup a': 'Ag Streptococ grup A',
  'strep a': 'Ag Streptococ grup A',
  'test rapid streptococ': 'Ag Streptococ grup A',

  // BIOLOGIE MOLECULARA
  'hpv': 'HPV (genotipare)',
  'human papillomavirus': 'HPV (genotipare)',

  'chlamydia trachomatis': 'Chlamydia trachomatis PCR',
  'chlamydia': 'Chlamydia trachomatis PCR',

  // URINA
  'sumar urina': 'Sumar urina',
  'examen sumar urina': 'Sumar urina',
  'urinalysis': 'Sumar urina',
  'urina': 'Sumar urina',

  'microalbuminurie': 'Microalbuminurie',
  'albumina urinara': 'Microalbuminurie',
  'microalbumin urine': 'Microalbuminurie',

  'creatinina urinara': 'Creatinina urinara',
  'urine creatinine': 'Creatinina urinara',

  // EXAMEN COPROPARAZITOLOGIC
  'examen coproparazitologic': 'Examen coproparazitologic',
  'coproparazitologic': 'Examen coproparazitologic',
  'stool parasite exam': 'Examen coproparazitologic',
}

function normalizeazaNume(nume: string): string {
  const numeLower = nume.toLowerCase().trim()
  return NOMENCLATOR[numeLower] || nume
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
              text: `Extrage TOATE analizele din acest document medical PDF. Pot fi analize de laborator, rezultate imagistice, teste genetice sau orice alt rezultat medical. Pentru analize cu valoare numerica foloseste tip_rezultat "numeric". Pentru analize cu rezultat text (negativ/pozitiv/prezent/absent/reactiv/neractiv sau orice alt rezultat calitativ) foloseste tip_rezultat "calitativ" si pune rezultatul complet in rezultat_text. Returneaza STRICT JSON valid fara text suplimentar:
{"analize":[{"nume":"numele exact al analizei din document","valoare":"valoarea numerica sau null daca e calitativ","unitate":"unitatea de masura sau null","referinta_min":"valoarea minima normala din document sau null","referinta_max":"valoarea maxima normala din document sau null","tip_rezultat":"numeric sau calitativ","rezultat_text":"rezultatul text complet sau null","status":"normal sau peste sau sub sau negativ sau pozitiv sau necunoscut","data":"YYYY-MM-DD sau null"}],"laborator":"numele laboratorului sau institutiei sau null","data_buletin":"YYYY-MM-DD sau null","tip_document":"laborator sau imagistica sau genetica sau altul"}`
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
      data_buletin: parsed.data_buletin,
      tip_document: parsed.tip_document
    })

  } catch (error) {
    console.error('Extract error:', error)
    return NextResponse.json({ error: 'A aparut o eroare la procesare.' }, { status: 500 })
  }
}