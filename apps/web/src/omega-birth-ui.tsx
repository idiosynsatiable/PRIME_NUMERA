import { useMemo,useState } from "react";
import { resolveBirthTime,validateCoordinates } from "./omega-birth";

export function BirthTimeLab({date}:{date:string}) {
 const [time,setTime]=useState(""),[zone,setZone]=useState(""),[lat,setLat]=useState(""),[lon,setLon]=useState("");
 const result=useMemo(()=>{
  try{return {time:resolveBirthTime(date,time,zone),coordinates:validateCoordinates(lat,lon),error:""};}
  catch(e){return {time:null,coordinates:null,error:e instanceof Error?e.message:"Check birth details."};}
 },[date,time,zone,lat,lon]);
 return <details><summary>Exact chart preparation · birth time and location</summary>
   <p>Optional local-only inputs. This prepares UTC instants; it does not calculate planets, houses, or Human Design.</p>
   <label>Birth time<input type="time" value={time} onChange={e=>setTime(e.target.value)}/></label>
   <label>IANA timezone<input placeholder="America/Chicago" value={zone} maxLength={100} onChange={e=>setZone(e.target.value)}/></label>
   <label>Latitude<input inputMode="decimal" value={lat} maxLength={20} onChange={e=>setLat(e.target.value)}/></label>
   <label>Longitude<input inputMode="decimal" value={lon} maxLength={20} onChange={e=>setLon(e.target.value)}/></label>
   <div aria-live="polite">{result.error?<p>{result.error}</p>:<><p>{result.time?.status==="unknown"?"Birth time not supplied. Time-dependent chart results remain unknown.":result.time?.status==="nonexistent"?"This wall time did not occur in the selected zone. Check the birth record.":result.time?.status==="ambiguous"?"Two or more UTC interpretations exist. Do not choose without additional evidence.":"One UTC interpretation found."}</p>{result.time?.candidates.map(x=><p key={x}><code>{x}</code></p>)}{result.coordinates&&<p>Coordinates validated: {result.coordinates.latitude}, {result.coordinates.longitude}</p>}</>}</div>
   <small>Uses this browser's IANA timezone data and offset sampling for 1900–2100. Historical timezone datasets differ; independent reference testing and an ephemeris are still required. These fields are not saved or exported.</small>
 </details>;
}
