// Local-first symbolic tools. No birth data leaves the browser.
export const SIGNS = ["Capricorn","Aquarius","Pisces","Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius"] as const;
const boundaries = [20,19,21,20,21,21,23,23,23,23,22,22];
const animals = ["Rat","Ox","Tiger","Rabbit","Dragon","Snake","Horse","Goat","Monkey","Rooster","Dog","Pig"];
const elements = ["Wood","Fire","Earth","Metal","Water"];
const mod = (n:number,m:number) => ((n%m)+m)%m;
export function dateParts(value:string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new RangeError("Enter a complete date.");
  const [year,month,day] = value.split("-").map(Number);
  const date = new Date(value+"T12:00:00Z");
  if (!year || !Number.isFinite(date.getTime()) || date.getUTCFullYear()!==year || date.getUTCMonth()+1!==month || date.getUTCDate()!==day) throw new RangeError("Invalid calendar date.");
  return {year,month,day,date};
}
export function westernZodiac(value:string) {
  const {month,day}=dateParts(value);
  const index=mod(month-1+(day>=boundaries[month-1]! ? 1:0),12);
  return {sign:SIGNS[index]!, element:["Earth","Air","Water","Fire"][index%4]!, modality:["Cardinal","Fixed","Mutable"][index%3]!, nearBoundary:Math.abs(day-boundaries[month-1]!)<=2};
}
export function chineseZodiac(value:string) {
  const {year,date}=dateParts(value);
  if(year<1900 || year>2100) return null;
  try {
    const fmt=new Intl.DateTimeFormat("en-u-ca-chinese",{year:"numeric",month:"numeric",day:"numeric",timeZone:"UTC"});
    if(fmt.resolvedOptions().calendar!=="chinese") return null;
    const lunarYear=Number(fmt.formatToParts(date).find(p=>String(p.type)==="relatedYear")?.value);
    if(!Number.isInteger(lunarYear)) return null;
    const cycle=mod(lunarYear-1984,60);
    return {lunarYear,animal:animals[cycle%12]!,element:elements[Math.floor((cycle%10)/2)]!,polarity:cycle%2===0?"Yang":"Yin",cycle:cycle+1};
  } catch { return null; }
}
export function digitalRoot(n:number) {
  if(!Number.isSafeInteger(n)||n<0) throw new RangeError("Use a nonnegative safe integer.");
  return n===0?0:1+(n-1)%9;
}
export function dateGrid(value:string) {
  dateParts(value);
  const counts=Array.from({length:9},(_,i)=>({number:i+1,count:0}));
  for(const c of value.replace(/-/g,"")) if(c!=="0") counts[Number(c)-1]!.count++;
  return counts;
}
export function personalCycles(birth:string,target:string) {
  const b=dateParts(birth),t=dateParts(target);
  const year=digitalRoot(b.month+b.day+t.year);
  const month=digitalRoot(year+t.month);
  return {year,month,day:digitalRoot(month+t.day)};
}
const majors=["The Fool","The Magician","The High Priestess","The Empress","The Emperor","The Hierophant","The Lovers","The Chariot","Strength","The Hermit","Wheel of Fortune","Justice","The Hanged Man","Death","Temperance","The Devil","The Tower","The Star","The Moon","The Sun","Judgement","The World"];
const themes=["beginnings","initiative","intuition","nurture","structure","tradition","choice","direction","courage","solitude","change","accountability","perspective","transition","balance","attachments","disruption","hope","uncertainty","joy","review","completion"];
const ranks=["Ace","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Page","Knight","Queen","King"];
const rankThemes=["potential","partnership","growth","stability","tension","adjustment","assessment","practice","ripening","completion","curiosity","movement","care","stewardship"];
const suits=[["Wands","creativity"],["Cups","feelings"],["Swords","thought"],["Pentacles","material resources"]];
export const TAROT = [...majors.map((name,i)=>({name,theme:themes[i]!})),...suits.flatMap(([suit,theme])=>ranks.map((rank,i)=>({name:rank+" of "+suit,theme:rankThemes[i]+" in "+theme})))];
export const HEXAGRAMS=["Creative","Receptive","Difficulty at the Beginning","Youthful Folly","Waiting","Conflict","Army","Holding Together","Small Taming","Treading","Peace","Standstill","Fellowship","Great Possession","Modesty","Enthusiasm","Following","Repair","Approach","Contemplation","Biting Through","Grace","Splitting Apart","Return","Innocence","Great Taming","Nourishment","Great Preponderance","Abysmal Water","Clinging Fire","Influence","Duration","Retreat","Great Power","Progress","Darkening of the Light","Family","Opposition","Obstruction","Deliverance","Decrease","Increase","Breakthrough","Coming to Meet","Gathering","Pushing Upward","Oppression","Well","Revolution","Cauldron","Arousing Thunder","Keeping Still","Development","Marrying Maiden","Abundance","Wanderer","Gentle Wind","Joyous Lake","Dispersion","Limitation","Inner Truth","Small Preponderance","After Completion","Before Completion"];
export function randomIndex(limit:number) {
  if(!Number.isInteger(limit)||limit<1||limit>0x100000000) throw new RangeError("Invalid draw size.");
  const cutoff=Math.floor(0x100000000/limit)*limit;
  const buf=new Uint32Array(1);
  do { crypto.getRandomValues(buf); } while(buf[0]!>=cutoff);
  return buf[0]!%limit;
}
export function drawTarot(count:number, random=randomIndex) {
  if(![1,3,10].includes(count)) throw new RangeError("Choose a supported spread.");
  const deck=[...TAROT];
  return Array.from({length:count},()=> {
    const index=random(deck.length);
    if(!Number.isInteger(index)||index<0||index>=deck.length) throw new RangeError("Invalid random index.");
    return {...deck.splice(index,1)[0]!,reversed:random(2)===1};
  });
}
export const HD_TYPES=["Manifestor","Generator","Manifesting Generator","Projector","Reflector"] as const;
export const HD_AUTHORITIES=["Emotional","Sacral","Splenic","Ego","Self-projected","Mental / environmental","Lunar"] as const;
export const HD_PROFILES=["1/3","1/4","2/4","2/5","3/5","3/6","4/6","4/1","5/1","5/2","6/2","6/3"] as const;

const TRIGRAMS=[7,3,5,1,6,2,4,0];
const KING_WEN=[
 [1,10,13,25,44,6,33,12],[43,58,49,17,28,47,31,45],
 [14,38,30,21,50,64,56,35],[34,54,55,51,32,40,62,16],
 [9,61,37,42,57,59,53,20],[5,60,63,3,48,29,39,8],
 [26,41,22,27,18,4,52,23],[11,19,36,24,46,7,15,2],
];
export function hexagramNumber(lines:readonly number[]) {
  if(lines.length!==6||lines.some(x=>x!==0&&x!==1)) throw new RangeError("Six binary lines are required.");
  const lower=lines[0]!+2*lines[1]!+4*lines[2]!;
  const upper=lines[3]!+2*lines[4]!+4*lines[5]!;
  return KING_WEN[TRIGRAMS.indexOf(upper)]![TRIGRAMS.indexOf(lower)]!;
}
export function castCoins(random=randomIndex) {
  const lines=Array.from({length:6},()=>6+random(2)+random(2)+random(2));
  const primary=hexagramNumber(lines.map(x=>x%2));
  const relating=hexagramNumber(lines.map(x=>x===6||x===9?1-x%2:x%2));
  return {lines,primary,relating,changing:lines.flatMap((x,i)=>x===6||x===9?[i+1]:[])};
}
