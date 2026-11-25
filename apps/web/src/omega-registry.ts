export type EngineStage="partial"|"planned";
export const ENGINE_REGISTRY = [
 {id:"numera",name:"NUMERA CORE",stage:"partial",available:"Pythagorean, Chaldean, advanced profile dimensions",next:"Additional sourced multilingual mappings and configurable methods"},
 {id:"astra",name:"ASTRA",stage:"partial",available:"Conventional date-range Sun sign; local birth-time UTC candidate resolution",next:"Verified ephemeris, historical timezones, houses, Vedic charts"},
 {id:"genesis",name:"GENESIS",stage:"partial",available:"Manual Human Design type, authority and profile",next:"Automatic chart calculation and validated bodygraph"},
 {id:"dragon",name:"DRAGON",stage:"partial",available:"Chinese lunar-year animal, element and polarity (1900–2100, supported browsers)",next:"BaZi solar terms and four pillars; Zi Wei Dou Shu"},
 {id:"arcana",name:"ARCANA",stage:"partial",available:"78-card draws, upright/reversed, 1/3/5/7/10 cards",next:"Deck artwork, spreads, birth cards and licensing"},
 {id:"oracle",name:"ORACLE",stage:"partial",available:"64 hexagrams, coin casting, existing cultural Atlas and runes",next:"Independent hexagram fixtures, yarrow and sourced traditions"},
 {id:"resonance",name:"RESONANCE",stage:"partial",available:"Existing Pythagorean comparison",next:"Other chart comparisons and consent controls"},
 {id:"chronos",name:"CHRONOS",stage:"partial",available:"Numerical cycles, existing timeline, personal day/month/year",next:"Celestial calendars and integrated timeline"},
 {id:"psyche",name:"PSYCHE",stage:"planned",available:"Optional self-described identity only; no assessment",next:"Licensed or original questionnaires with appropriate validation"},
 {id:"infinitum",name:"INFINITUM",stage:"partial",available:"Digital roots, digit counts, number bases, residues, sequences, bounded integer classification and interactive geometry",next:"Additional geometry and statistical experiments"},
 {id:"nomen",name:"NOMEN",stage:"partial",available:"Existing name variant comparison",next:"Multilingual generation and constraint search"},
 {id:"omnisynthesis",name:"OMNISYNTHESIS",stage:"partial",available:"Typed evidence nodes, exact numerical overlap and private export",next:"Sourced symbolic edges, contradictions and interactive graph"},
] as const satisfies readonly {id:string;name:string;stage:EngineStage;available:string;next:string}[];
