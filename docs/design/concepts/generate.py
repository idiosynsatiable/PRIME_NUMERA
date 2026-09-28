"""Generate scalable Phase-1 screen concepts. These are review artifacts, not application UI."""
from pathlib import Path
from html import escape

OUT = Path(__file__).parent
SCREENS = [
    ('01-mobile-landing', 'DISCOVER', 'Your name is already a number.', 'See what it becomes.', [('Full birth name', 'Enter your name'), ('Birth date', 'Day  /  Month  /  Year')], 'BUILD MY NUMBER DNA', 'Pythagorean  •  Chaldean  •  Transparent'),
    ('02-calculator', 'CALCULATOR', 'Start with the source.', 'Your details stay on this device until you choose to save.', [('Calculation system', 'Pythagorean  ⌄'), ('Name policy', 'Y as vowel when sounded  ⌄'), ('Birth date', 'Select date')], 'CALCULATE LOCALLY', 'View method and normalization rules'),
    ('03-reveal', 'THE REVEAL', 'Watch the math form.', 'Every letter and reduction has a visible step.', [('MARY', 'M 4  +  A 1  +  R 9  +  Y 7'), ('Raw expression', '4 + 1 + 9 + 7 = 21'), ('Reduction', '2 + 1 = 3')], 'SHOW EVERY STEP', 'Skip animation  •  Reduced motion supported'),
    ('04-number-dna', 'NUMBER DNA', 'A map you can read.', 'Connections represent defined calculations, not decoration.', [('CORE NODES', 'Life Path  9  •  Expression  3'), ('INNER LAYER', 'Soul Urge  6  •  Personality  8'), ('RELATIONSHIPS', 'Tap an edge for its formula')], 'OPEN STRUCTURED VIEW', 'Graph and accessible list carry the same facts'),
    ('05-deep-profile', 'YOUR PROFILE', 'Numbers with context.', 'Math, interpretation, and evidence remain distinct.', [('LIFE PATH  /  9', 'Calculation  →  component reduction'), ('TRADITIONAL', 'A sourced interpretation, clearly labeled'), ('MODERN', 'A reflective reading, never a certainty')], 'EXPLORE THE FORMULA', 'Browse without creating an account'),
    ('06-name-lab', 'NAME LAB', 'What changed?', 'Compare spellings without promising outcomes.', [('Before', 'Anna   →   raw sum 12'), ('After', 'Anne   →   raw sum 17'), ('LETTER DELTA', 'A −1  •  E +1  •  arithmetic +5')], 'COMPARE VARIANTS', 'Choose Pythagorean or Cheiro-style'),
    ('07-timeline', 'TIMELINE', 'Patterns across ages.', 'Select an age to inspect its active cycles.', [('AGE SELECTED', '32  ━━━━━●━━━━━━━━━━'), ('PINNACLE', 'Second span  •  value 7'), ('PERIOD', 'Second span  •  value 3')], 'SEE THE AGE RANGES', 'Boundaries are explicit and auditable'),
    ('08-compatibility', 'COMPATIBILITY', 'Compare dimensions.', 'No invented percentage; view each shared and differing value.', [('CONTEXT', 'Friendship  ⌄'), ('LIFE PATH', '9   ↔   4  •  difference 5'), ('EXPRESSION', '3   ↔   3  •  shared value')], 'EXPLORE CONTEXT', 'Both people consent before saving'),
    ('09-symbolic-atlas', 'SYMBOLIC ATLAS', 'Explore with sources.', 'Cultures and systems keep their own histories.', [('RUNES', 'Writing and inscriptions  •  Scandinavia'), ('MAYA CALENDARS', 'Living traditions  •  calendrical systems'), ('SOURCE RULE', 'Claim status and attribution on every page')], 'OPEN AN ATLAS ENTRY', 'History is separate from entertainment'),
    ('10-runes-lab', 'RUNES LAB', 'Read the inscription.', 'The artifact comes first. Modern reflection has its own label.', [('UNNA’S STONE', '11th-century memorial  •  museum source'), ('INSCRIPTION LAYER', 'Context, period, reading and limits'), ('MODERN ACTIVITY', 'Optional creative prompt  •  entertainment')], 'VIEW MUSEUM SOURCE', 'No invented ancient divination claims'),
    ('11-share-card', 'SHARE', 'Choose what leaves.', 'Preview exactly which derived values will be public.', [('SELECTED VALUES', 'Life Path 9  •  Expression 3'), ('FORMAT', '9:16  •  1:1  •  4:5  •  16:9'), ('CONTROL', 'Expires in 30 days  •  delete anytime')], 'CREATE SAFE LINK', 'Name and birth date excluded by default'),
    ('12-family-mode', 'FAMILY MODE', 'Curiosity for everyone.', 'Age-appropriate language and clear source labels.', [('DISCOVER', 'A gentle explanation of each number'), ('LEARN', 'Try a letter-value puzzle'), ('PRIVACY', 'No public profile by default')], 'START EXPLORING', 'No deterministic claims about a child'),
    ('13-adult-mode', '18+ MODE', 'Reflect more deeply.', 'Expressive themes remain labeled entertainment.', [('TONE', 'Direct  •  reflective'), ('BOUNDARY', 'No medical or relationship certainty'), ('CONTROL', 'Switch back to standard mode')], 'ENTER 18+ MODE', 'No explicit content on public share cards'),
    ('14-account', 'YOUR SPACE', 'Save only by choice.', 'Calculations work without an account.', [('LOCAL FIRST', 'Keep results on this device'), ('SYNC', 'Off until you enable it'), ('YOUR DATA', 'Export  •  delete  •  revoke consent')], 'REVIEW SAVE OPTIONS', 'No silent upload of names or dates'),
]

BG='#080E16'; PANEL='#132130'; INK='#F2F2EA'; MUTED='#A8B9C3'; GREEN='#B6FF65'; GOLD='#DCC897'; LINE='#355264'

def text(x,y,s,size=28,color=INK,weight=400,spacing=0):
    return f'<text x="{x}" y="{y}" fill="{color}" font-family="Inter, Arial, sans-serif" font-size="{size}" font-weight="{weight}" letter-spacing="{spacing}">{escape(s)}</text>'

def rect(x,y,w,h,fill=PANEL,r=22,stroke=LINE):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" stroke-width="2"/>'

def chrome(w,h):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#080E16"/><stop offset=".58" stop-color="#10253A"/><stop offset="1" stop-color="#08141D"/></linearGradient><radialGradient id="glow"><stop stop-color="#75DDEA" stop-opacity=".3"/><stop offset="1" stop-color="#75DDEA" stop-opacity="0"/></radialGradient></defs><rect width="{w}" height="{h}" fill="url(#bg)"/><circle cx="{w*.85}" cy="{h*.18}" r="{w*.48}" fill="url(#glow)"/>'

def mobile(data):
    slug, eyebrow, title, subtitle, rows, cta, foot=data
    a=[chrome(1080,1920), f'<title>PRIME NUMERA concept: {escape(eyebrow)}</title>',rect(48,46,984,1786,'#0D1926',48,'#57717D')]
    a += [text(100,150,'◈  PRIME NUMERA',32,GOLD,700,5),text(100,245,eyebrow,25,GREEN,700,6)]
    words=title.split(); lines=[]; line=''
    for word in words:
        if len(line+' '+word)>19: lines.append(line); line=word
        else: line=(line+' '+word).strip()
    lines.append(line)
    for i,s in enumerate(lines): a.append(text(100,350+82*i,s,66,INK,650,-2))
    start=365+82*len(lines)
    a.append(text(100,start+70,subtitle,25,MUTED)) if len(subtitle)<65 else a.extend([text(100,start+70,subtitle[:58],25,MUTED),text(100,start+108,subtitle[58:],25,MUTED)])
    y=start+170
    for label,value in rows:
        a.extend([rect(94,y,892,205),text(130,y+68,label.upper(),24,GOLD,700,3),text(130,y+140,value,31,INK,500)])
        y+=238
    if slug=='04-number-dna':
        # Data-first graph motif, with the same values repeated in labeled rows.
        a.extend(['<path d="M810 1100 L910 1240 L770 1360 L670 1230 Z" fill="none" stroke="#B6FF65" stroke-width="4" opacity=".55"/>',
                  '<circle cx="810" cy="1100" r="18" fill="#B6FF65"/><circle cx="910" cy="1240" r="18" fill="#B6FF65"/>'])
    a.extend([rect(94,1510,892,124,GREEN,24,GREEN),text(135,1589,cta,32,BG,800,2),text(100,1712,foot,24,MUTED),text(100,1785,'CONCEPT  /  DESIGN APPROVAL PENDING',18,GOLD,700,3),'</svg>'])
    (OUT/f'{slug}.svg').write_text(''.join(a),encoding='utf-8')

def desktop():
    a=[chrome(1920,1080),'<title>PRIME NUMERA desktop landing concept</title>',text(94,100,'◈  PRIME NUMERA',30,GOLD,700,5),text(1450,100,'METHOD    ATLAS    ABOUT',20,MUTED,600,2),
       text(105,286,'YOUR NAME IS ALREADY',28,GREEN,700,6),text(100,385,'A NUMBER.',100,INK,700,-2),text(100,495,'See what it becomes.',70,INK,400,-2),
       text(106,560,'Transparent mathematics. Distinct histories. Your own interpretation.',26,MUTED),
       rect(103,635,800,100),text(135,696,'Full birth name',27,MUTED),rect(103,755,390,100),text(135,816,'Birth date',27,MUTED),rect(515,755,388,100,GREEN,22,GREEN),text(550,816,'BUILD MY DNA  →',26,BG,800),
       text(105,940,'Pythagorean   •   Chaldean / Cheiro-style   •   Local first',22,GOLD),
       rect(1050,195,760,705,'#0C202C',38,'#507084'),text(1115,275,'A PREVIEW OF YOUR NUMBER DNA',22,GOLD,700,3),
       '<path d="M1380 410 L1640 470 L1570 730 L1240 690 Z M1380 410 L1570 730 M1640 470 L1240 690" fill="none" stroke="#6CCBBA" stroke-width="3" opacity=".75"/>']
    for x,y,n,label in [(1380,410,'9','LIFE PATH'),(1640,470,'3','EXPRESSION'),(1570,730,'6','SOUL URGE'),(1240,690,'8','PERSONALITY')]:
        a += [f'<circle cx="{x}" cy="{y}" r="60" fill="#163746" stroke="#B6FF65" stroke-width="3"/>',text(x-19,y+16,n,50,INK,700),text(x-55,y+95,label,15,GOLD,600,1)]
    a += [text(1095,855,'Every node links to a visible calculation.',22,MUTED),'</svg>']
    (OUT/'00-desktop-landing.svg').write_text(''.join(a),encoding='utf-8')

desktop()
for screen in SCREENS: mobile(screen)
print(f'Generated {len(SCREENS)+1} scalable concepts')
