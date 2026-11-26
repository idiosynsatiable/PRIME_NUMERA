import { describe,expect,it } from "vitest";
import { analyzeInteger,classifyInteger,generateSequence,numericOverlap } from "../src/omega-lab";
import { ENGINE_REGISTRY } from "../src/omega-registry";
describe("INFINITUM",()=>{
 it("preserves 100-digit exact integers and leading-zero digit analysis",()=>{const x=analyzeInteger("9".repeat(100));expect(x.root).toBe(9);expect(x.digitSum).toBe(900);expect(BigInt("0x"+x.hexadecimal)).toBe(BigInt("9".repeat(100)));expect(analyzeInteger("010").palindrome).toBe(true);expect(()=>analyzeInteger("-1")).toThrow();});
 it("classifies boundary values",()=>{expect(classifyInteger(1).prime).toBe(false);expect(classifyInteger(2).prime).toBe(true);expect(classifyInteger(28).perfect).toBe(true);expect(classifyInteger(36)).toMatchObject({square:true,triangular:true,composite:true});});
 it("generates exact sequences",()=>{expect(generateSequence("fibonacci",8)).toEqual(["0","1","1","2","3","5","8","13"]);expect(generateSequence("lucas",4)).toEqual(["2","1","3","4"]);expect(generateSequence("triangular",4)).toEqual(["1","3","6","10"]);});
 it("keeps exact overlap distinct from self-report",()=>{const node={engine:"numera",label:"Example",value:"9",method:"fixture"};expect(numericOverlap([{...node,id:"a",kind:"calculation"},{...node,id:"b",kind:"calculation"},{...node,id:"c",kind:"self-report"}])[0]?.ids).toEqual(["a","b"]);});
 it("declares twelve unique engines",()=>{expect(new Set(ENGINE_REGISTRY.map(x=>x.id)).size).toBe(12);});
});
