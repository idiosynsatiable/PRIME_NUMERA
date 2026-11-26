import { useState } from "react";
export function GeometryLab() {
 const [shape,setShape]=useState("seed");
 const [count,setCount]=useState(48);
 const angles=Array.from({length:6},(_,i)=>i*Math.PI/3);
 const circles=[{x:120,y:120},...angles.map(a=>({x:120+36*Math.cos(a),y:120+36*Math.sin(a)}))];
 return <section aria-label="Geometry laboratory"><h3>Interactive geometry laboratory</h3><label>Construction<select aria-label="Construction" value={shape} onChange={e=>setShape(e.target.value)}><option value="seed">Seed of Life</option><option value="spiral">Golden-angle points</option><option value="polygon">Regular polygon</option></select></label>
 {shape!=="seed"&&<label>Point count: {count}<input type="range" min={3} max={120} value={count} onChange={e=>setCount(Number(e.target.value))}/></label>}
 <svg viewBox="0 0 240 240" role="img" aria-label={shape==="seed"?"Seven equal overlapping circles":shape==="spiral"?"Golden-angle point arrangement":"Regular polygon"} style={{display:"block",width:"100%",maxWidth:"24rem",margin:"auto"}} stroke="currentColor" fill="none">
 {shape==="seed"?circles.map((c,i)=><circle key={i} cx={c.x} cy={c.y} r={36}/>):shape==="spiral"?Array.from({length:count},(_,i)=>{const r=100*Math.sqrt(i/Math.max(1,count-1)),a=i*Math.PI*(3-Math.sqrt(5));return <circle key={i} cx={120+r*Math.cos(a)} cy={120+r*Math.sin(a)} r={2.2} fill="currentColor"/>;}):<polygon points={Array.from({length:count},(_,i)=>{const a=2*Math.PI*i/count-Math.PI/2;return [120+100*Math.cos(a),120+100*Math.sin(a)].join(",");}).join(" ")}/>}
 </svg><p>{shape==="seed"?"Seven equal circles with centers separated by one radius.":shape==="spiral"?"Angle = π(3 − √5); radial spacing proportional to the square root of the index.":"Equal angular spacing: 360° / "+count+" vertices."}</p><small>Geometric constructions are mathematical; symbolic associations are optional and separate.</small></section>;
}
