import { describe,expect,it } from "vitest";
import { westernZodiac,chineseZodiac,dateGrid,digitalRoot,personalCycles,TAROT,HEXAGRAMS,drawTarot,dateParts,hexagramNumber,castCoins } from "../src/omega-engine";
describe("Omega calculations",()=>{
  it("handles conventional zodiac boundaries and flags uncertainty",()=>{expect(westernZodiac("1993-11-21")).toMatchObject({sign:"Scorpio",nearBoundary:true});expect(westernZodiac("2000-12-25").sign).toBe("Capricorn");});
  it("uses lunar new year rather than Gregorian year",()=>{expect(chineseZodiac("2024-02-09")?.animal).toBe("Rabbit");expect(chineseZodiac("2024-02-10")).toMatchObject({animal:"Dragon",element:"Wood",polarity:"Yang"});expect(chineseZodiac("1800-01-01")).toBeNull();});
  it("validates actual dates",()=>{expect(()=>dateParts("2023-02-29")).toThrow();expect(dateParts("2024-02-29").day).toBe(29);});
  it("counts date digits and computes modular roots",()=>{expect(dateGrid("1993-11-21").find(x=>x.number===1)?.count).toBe(4);expect(digitalRoot(999)).toBe(9);expect(digitalRoot(0)).toBe(0);expect(personalCycles("1993-11-21","2026-11-25")).toEqual({year:6,month:8,day:6});});
  it("has complete unique decks and draws without replacement",()=>{expect(new Set(TAROT.map(x=>x.name)).size).toBe(78);expect(HEXAGRAMS.length).toBe(64);const cards=drawTarot(10,()=>0);expect(new Set(cards.map(x=>x.name)).size).toBe(10);expect(cards.every(x=>!x.reversed)).toBe(true);expect(()=>drawTarot(2)).toThrow();});
});

describe("Three coin oracle",()=>{
 it("maps all 64 binary hexagrams uniquely in King Wen order",()=>{
  const values=Array.from({length:64},(_,i)=>hexagramNumber(Array.from({length:6},(_,b)=>(i>>b)&1)));
  expect(new Set(values).size).toBe(64);
  expect(hexagramNumber([1,1,1,1,1,1])).toBe(1);
  expect(hexagramNumber([0,0,0,0,0,0])).toBe(2);
 });
 it("transforms changing yin and yang lines",()=>{
  expect(castCoins(()=>0)).toEqual({lines:[6,6,6,6,6,6],primary:2,relating:1,changing:[1,2,3,4,5,6]});
  expect(castCoins(()=>1)).toEqual({lines:[9,9,9,9,9,9],primary:1,relating:2,changing:[1,2,3,4,5,6]});
 });
});
