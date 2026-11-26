// Exact integer calculations. Interpretive claims are intentionally absent.
export function analyzeInteger(raw:string) {
  if(!/^\d{1,100}$/.test(raw)) throw new RangeError("Enter 1–100 digits.");
  const n=BigInt(raw), canonical=n.toString();
  const sum=[...raw].reduce((s,c)=>s+Number(c),0);
  const root=n===0n?0:1+(sum-1)%9;
  const counts=Array.from({length:10},(_,digit)=>({digit,count:[...raw].filter(c=>Number(c)===digit).length}));
  return {canonical,digitSum:sum,root,palindrome:raw===[...raw].reverse().join(""),counts,binary:n.toString(2),hexadecimal:n.toString(16).toUpperCase(),residues:[2,3,5,7,9,11].map(m=>({modulus:m,remainder:Number(n%BigInt(m))}))};
}
export function classifyInteger(n:number) {
  if(!Number.isSafeInteger(n)||n<0||n>1_000_000_000) throw new RangeError("Classification supports 0–1,000,000,000.");
  let divisorSum=n>1?1:0,prime=n>=2;
  for(let d=2;d*d<=n;d++) if(n%d===0){prime=false;divisorSum+=d;if(d*d!==n)divisorSum+=n/d;}
  return {prime,composite:n>1&&!prime,perfect:n>1&&divisorSum===n,square:Number.isInteger(Math.sqrt(n)),triangular:Number.isInteger(Math.sqrt(8*n+1)),divisorSum};
}
export function generateSequence(kind:"fibonacci"|"lucas"|"triangular"|"square",count:number):string[] {
  if(!Number.isInteger(count)||count<1||count>100) throw new RangeError("Choose 1–100 terms.");
  let a=kind==="lucas"?2n:0n,b=1n;
  return Array.from({length:count},(_,i)=>{
    const k=BigInt(i+1);
    if(kind==="triangular")return (k*(k+1n)/2n).toString();
    if(kind==="square")return (k*k).toString();
    const x=a;[a,b]=[b,a+b];return x.toString();
  });
}
export type EvidenceKind="calculation"|"calendar-convention"|"self-report"|"creative-association";
export type EvidenceNode={id:string;engine:string;label:string;value:string;kind:EvidenceKind;method:string};
export function numericOverlap(nodes:readonly EvidenceNode[]) {
  const groups=new Map<string,EvidenceNode[]>();
  for(const node of nodes) if(node.kind==="calculation"&&/^\d+$/.test(node.value)) groups.set(node.value,[...(groups.get(node.value)??[]),node]);
  return [...groups.entries()].filter(([,items])=>items.length>1).map(([value,items])=>({value,ids:items.map(x=>x.id),labels:items.map(x=>x.label),relationship:"exact-value-equality" as const}));
}
