import { useState } from "react";
import { westernZodiac, chineseZodiac, dateGrid, personalCycles, drawTarot, HEXAGRAMS, randomIndex, HD_TYPES, HD_AUTHORITIES, HD_PROFILES, digitalRoot } from "./omega-engine";
import { type ProfileInput } from "./profile-storage";
import { reflection } from "./reflections";
import type { PythagoreanProfile } from "@prime-numera/numerology-core";

export function OmegaStudio({input,profile}:{input:ProfileInput;profile:PythagoreanProfile|null}) {
  const [tab,setTab]=useState("sky");
  const [target,setTarget]=useState(()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");});
  const [spread,setSpread]=useState(3);
  const [cards,setCards]=useState<ReturnType<typeof drawTarot>>([]);
  const [hex,setHex]=useState<number|null>(null);
  const [hdType,setHdType]=useState("");
  const [authority,setAuthority]=useState("");
  const [hdProfile,setHdProfile]=useState("");
  const [identity,setIdentity]=useState("");
  const [journal,setJournal]=useState("");
  const [sequence,setSequence]=useState("");
  const sky=westernZodiac(input.date), lunar=chineseZodiac(input.date);
  const grid=dateGrid(input.date);
  let cycles:ReturnType<typeof personalCycles>|null=null;
  try {cycles=personalCycles(input.date,target);} catch { /* incomplete date input */ }
  const digits=/^\d{1,15}$/.test(sequence)?digitalRoot(Number(sequence)):null;
  const tabs=[["sky","Zodiac & lunar"],["numbers","Number laboratory"],["tarot","Tarot & I Ching"],["design","Human Design"],["synthesis","Pattern synthesis"]];
  function exportReflection() {
    const text=JSON.stringify({schemaVersion:1,western:sky,chinese:lunar,personalCycles:cycles,grid,tarot:cards,hexagram:hex===null?null:{number:hex+1,title:HEXAGRAMS[hex]},humanDesign:{source:"user-entered",type:hdType,authority,profile:hdProfile},identity,journal},null,2);
    const url=URL.createObjectURL(new Blob([text],{type:"application/json"}));
    const a=document.createElement("a");a.href=url;a.download="numera-omega-private.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  return <section id="omega" className="panel omega-studio">
    <p className="eyebrow">PRIME NUMERA Ω · exploration studio</p>
    <h2>One portrait, many traditions</h2>
    <p>Explore separately calculated patterns and symbolic practices. Interpretations are creative reflection, not evidence of destiny or a prediction.</p>
    <div className="chips" aria-label="Exploration modules">{tabs.map(([id,label])=><button key={id} type="button" aria-pressed={tab===id} onClick={()=>setTab(id!)}>{label}</button>)}</div>
    {tab==="sky"&&<div className="omega-cards">
      <article><h3>Western zodiac</h3><strong>{sky.sign}</strong><p>{sky.element} · {sky.modality}</p><small>Conventional date ranges, not an astronomical chart. {sky.nearBoundary?"Near a sign boundary; exact birth time and an ephemeris are necessary.":"Moon and rising signs require an ephemeris and additional birth details."}</small></article>
      <article><h3>Chinese zodiac</h3><strong>{lunar?lunar.element+" "+lunar.animal:"Unavailable"}</strong>{lunar&&<p>{lunar.polarity} · lunar year {lunar.lunarYear} · cycle {lunar.cycle}/60</p>}<small>Chinese lunisolar new-year convention using the device's Intl calendar, supported dates 1900–2100. BaZi uses different solar-term boundaries.</small></article>
    </div>}
    {tab==="numbers"&&<>
      <h3>Personal year, month and day</h3><label>Explore date<input type="date" value={target} onChange={e=>setTarget(e.target.value)}/></label>
      {cycles?<div className="omega-cards">{Object.entries(cycles).map(([key,value])=><article key={key}><h4>Personal {key}</h4><strong>{value}</strong><p>{reflection(value).title}</p></article>)}</div>:<p>Choose a valid date.</p>}
      <small>Single-digit convention: birth month + day + target year, then add target month and day. Calendar-year basis.</small>
      <h3>Lo Shu-style birth digit grid</h3><div className="omega-grid">{[4,9,2,3,5,7,8,1,6].map(n=><div key={n}><strong>{n}</strong><span>{grid[n-1]!.count} occurrences</span></div>)}</div><p>Counts Gregorian birth-date digits; zero is excluded. This modern adaptation is distinct from the historical magic square.</p>
      <h3>Repeating-number and 3 · 6 · 9 laboratory</h3><label>Number sequence<input inputMode="numeric" value={sequence} maxLength={15} onChange={e=>setSequence(e.target.value)}/></label>{digits!==null&&<p>Digital root: <strong>{digits}</strong> · {digits===0?"Zero":reflection(digits).title} · {digits!==0&&digits%3===0?"Multiple of three":"Not a nonzero multiple of three"}</p>}<small>Digital roots are mathematical; angel-number or Tesla-inspired meanings are symbolic, not physical laws.</small>
      {profile&&<><h3>Additional core dimensions</h3><div className="omega-cards">{[["Attitude",profile.attitude.value],["Balance",profile.balance.value],["Rational thought",profile.rationalThought.value],["Life Path / Expression bridge",profile.bridges.lifePathExpression.value],["Soul Urge / Personality bridge",profile.bridges.soulUrgePersonality.value],["Life Path / Birthday bridge",profile.bridges.lifePathBirthday.value]].map(([label,value])=><article key={label}><h4>{label}</h4><strong>{value}</strong></article>)}</div></>}
    </>}
    {tab==="tarot"&&<>
      <h3>78-card tarot studio</h3><label>Spread<select value={spread} onChange={e=>{setSpread(Number(e.target.value));setCards([]);}}><option value={1}>Single reflection</option><option value={3}>Past / present / possibility</option><option value={10}>Ten-position reflection</option></select></label><button type="button" className="primary" onClick={()=>setCards(drawTarot(spread))}>Draw cards</button>
      <div className="omega-cards" aria-live="polite">{cards.map((c,i)=><article key={c.name}><p className="eyebrow">{spread===3?["Past","Present","Possibility"][i]:"Position "+(i+1)} · {c.reversed?"Reversed":"Upright"}</p><h4>{c.name}</h4><p>{c.reversed?"Reconsider ":"Explore "}{c.theme}.</p></article>)}</div>
      <h3>Chinese symbolic oracle · I Ching</h3><p>Explore all 64 hexagram names. This separate uniform draw is not traditional yarrow-stalk or coin divination and is not a Chinese tarot deck.</p><button type="button" onClick={()=>setHex(randomIndex(64))}>Draw a hexagram</button><label>Browse hexagrams<select value={hex===null?"":String(hex)} onChange={e=>setHex(e.target.value===""?null:Number(e.target.value))}><option value="">Choose one</option>{HEXAGRAMS.map((h,i)=><option key={i} value={i}>{i+1}. {h}</option>)}</select></label>{hex!==null&&<article aria-live="polite"><h4>{hex+1}. {HEXAGRAMS[hex]}</h4><p>What does this theme invite you to reconsider today?</p></article>}
    </>}
    {tab==="design"&&<>
      <h3>Human Design chart companion</h3><p>Enter values from a chart you already have. Automatic bodygraph calculation is not implemented; no birth time, chart or type is guessed.</p>
      <label>Type<select value={hdType} onChange={e=>setHdType(e.target.value)}><option value="">Not entered</option>{HD_TYPES.map(x=><option key={x}>{x}</option>)}</select></label>
      <label>Authority<select value={authority} onChange={e=>setAuthority(e.target.value)}><option value="">Not entered</option>{HD_AUTHORITIES.map(x=><option key={x}>{x}</option>)}</select></label>
      <label>Profile<select value={hdProfile} onChange={e=>setHdProfile(e.target.value)}><option value="">Not entered</option>{HD_PROFILES.map(x=><option key={x}>{x}</option>)}</select></label><p>Self-entered, unverified chart details. Not a scientific personality assessment.</p>
    </>}
    {tab==="synthesis"&&<>
      <h3>Your constellation of themes</h3><div className="omega-cards"><article><h4>Numerology</h4><p>{profile?"Life Path "+profile.lifePath.value+" · Destiny "+profile.expression.value+" · Soul Urge "+profile.soulUrge.value:"Chaldean profile selected"}</p></article><article><h4>Calendrical symbolism</h4><p>{sky.sign} · {lunar?lunar.element+" "+lunar.animal:"Chinese calendar unavailable"}</p></article><article><h4>Human Design</h4><p>{[hdType,authority,hdProfile].filter(Boolean).join(" · ")||"Not entered"}</p></article></div>
      <label>Optional identity / gender description<input value={identity} maxLength={100} onChange={e=>setIdentity(e.target.value)}/></label><small>Self-described only; does not change calculations or imply traits.</small>
      <label>Reflection journal<textarea rows={4} value={journal} maxLength={4000} onChange={e=>setJournal(e.target.value)}/></label><button type="button" onClick={exportReflection}>Export private exploration</button><p>These fields remain in memory until you leave or switch profiles. Exports may include personal details. No compatibility score or fate prediction is inferred.</p>
    </>}
  </section>;
}
