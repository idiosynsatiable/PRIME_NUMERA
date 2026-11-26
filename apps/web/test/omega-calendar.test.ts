import { describe,expect,it } from "vitest";
import { toFixed,fromFixed,fixedExtra,yearDates,isLeap,dozenal,parseFavorites,datePatterns,summarizeObservations,makeResearchPlan,inStudy } from "../src/omega-calendar";
describe("International Fixed Calendar",()=>{
 it("matches intercalary boundaries",()=>{expect(toFixed("2024-06-17")).toMatchObject({kind:"leap-day"});expect(fromFixed(2024,7,1)).toBe("2024-06-18");expect(fromFixed(2027,7,1)).toBe("2027-06-18");expect(fixedExtra(2027,"year-day")).toBe("2027-12-31");expect(()=>fixedExtra(2027,"leap-day")).toThrow();});
 it("round-trips every ordinary day and keeps week/quarter lengths fixed",()=>{for(const y of [1,1900,2000,2024,2027,2100,9999]){const dates=yearDates(y);const regular=dates.map(toFixed).filter(f=>f.kind==="regular");expect(regular.length).toBe(364);for(const f of regular){expect(toFixed(fromFixed(y,f.month,f.day))).toEqual(f);}for(let q=1;q<=4;q++)expect(regular.filter(f=>f.quarter===q).length).toBe(91);expect(dates.length).toBe(365+Number(isLeap(y)));}});
 it("keeps regular month starts on Sunday",()=>{for(let m=1;m<=13;m++)expect(toFixed(fromFixed(2027,m,1))).toMatchObject({weekday:0,day:1});});
 it("rejects invalid inputs",()=>{expect(()=>fromFixed(2027,14,1)).toThrow();expect(()=>fromFixed(2027,1,29)).toThrow();expect(()=>toFixed("2027-02-29")).toThrow();});
});
describe("FORTUNA and dozenal",()=>{
 it("parses unique favorites and exact base twelve",()=>{expect(parseFavorites("28, 3 28")).toEqual([3,28]);expect(()=>parseFavorites("3.5")).toThrow();expect(dozenal("28")).toBe("24");expect(dozenal("144")).toBe("100");});
 it("returns transparent matches without treating special days as regular",()=>{const a=datePatterns("1993-11-21","2027-12-31",[3,6,9,12,13,28],"fixed",[9]);expect(a.fixed.kind).toBe("year-day");expect(a.matches).not.toContain("favorite-day");expect(a.matches).not.toContain("favorite-month");expect(a.score).toBe(a.matches.length);expect(a.score).toBeLessThanOrEqual(7);});
 it("leaves empty group means unknown",()=>{expect(summarizeObservations([])).toEqual({higherCount:0,lowerCount:0,higherMean:null,lowerMean:null});});
});

it("freezes a future-only observation plan and excludes future outcomes",()=>{
 const plan=makeResearchPlan("2027-01-01","2027-12-31","2026-11-25T20:00:00.000Z","fixed",[3,28],[9]);
 expect(plan.threshold).toBe(4);
 expect(inStudy(plan,"2027-01-02","2027-01-01")).toBe(false);
 expect(inStudy(plan,"2027-01-02","2027-01-03")).toBe(true);
 expect(()=>makeResearchPlan("2026-11-25","2027-01-01","2026-11-25T20:00:00.000Z","fixed",[],[])).toThrow();
});
