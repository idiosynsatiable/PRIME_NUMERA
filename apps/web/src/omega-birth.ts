import { dateParts } from "./omega-engine";

export type BirthTimeResult =
  | { status:"unknown"; candidates:string[] }
  | { status:"nonexistent"; candidates:string[] }
  | { status:"unique"|"ambiguous"; candidates:string[] };

// Use the runtime IANA timezone implementation. Limit supported dates explicitly.
// Sample offsets around the wall date, then round-trip candidate UTC instants.
export function resolveBirthTime(date:string,time:string,zone:string):BirthTimeResult {
  const {year,month,day}=dateParts(date);
  if(year<1900||year>2100) throw new RangeError("Timezone exploration supports 1900–2100.");
  if(!time) return {status:"unknown",candidates:[]};
  if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new RangeError("Use HH:MM in 24-hour format.");
  if(!zone.trim()||zone.length>100||!(/^[A-Za-z_+-]+(?:\/[A-Za-z0-9_+.-]+)+$/.test(zone)||zone==="UTC")) throw new RangeError("Enter an IANA timezone, such as America/Chicago.");
  const formatter=new Intl.DateTimeFormat("en-GB",{timeZone:zone,calendar:"gregory",numberingSystem:"latn",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"});
  const [hour,minute]=time.split(":").map(Number);
  const wall=Date.UTC(year,month-1,day,hour,minute,0);
  const wallAt=(instant:number)=>{
    const values=Object.fromEntries(formatter.formatToParts(new Date(instant)).map(x=>[x.type,x.value]));
    return Date.UTC(Number(values.year),Number(values.month)-1,Number(values.day),Number(values.hour),Number(values.minute),Number(values.second));
  };
  const offsets=new Set<number>();
  for(let h=-36;h<=36;h+=1){const instant=wall+h*3600000;offsets.add(wallAt(instant)-instant);}
  const candidates=[...offsets].map(offset=>wall-offset).filter(instant=>wallAt(instant)===wall).sort((a,b)=>a-b).map(x=>new Date(x).toISOString());
  return {status:candidates.length===0?"nonexistent":candidates.length===1?"unique":"ambiguous",candidates};
}
export function validateCoordinates(lat:string,lon:string) {
  if(!lat.trim()||!lon.trim()) return null;
  const latitude=Number(lat),longitude=Number(lon);
  if(!Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>90||Math.abs(longitude)>180) throw new RangeError("Latitude must be between −90 and 90; longitude between −180 and 180.");
  return {latitude,longitude};
}
