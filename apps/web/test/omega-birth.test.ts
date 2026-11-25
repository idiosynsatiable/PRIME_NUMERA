import { describe,expect,it } from "vitest";
import { resolveBirthTime,validateCoordinates } from "../src/omega-birth";
describe("Birth time preparation",()=>{
 it("resolves ordinary dates and fractional timezone offsets",()=>{expect(resolveBirthTime("2024-01-15","12:00","America/Chicago")).toEqual({status:"unique",candidates:["2024-01-15T18:00:00.000Z"]});expect(resolveBirthTime("2024-01-15","12:00","Asia/Kathmandu").candidates).toEqual(["2024-01-15T06:15:00.000Z"]);});
 it("preserves daylight saving ambiguity and nonexistent times",()=>{expect(resolveBirthTime("2024-11-03","01:30","America/Chicago")).toEqual({status:"ambiguous",candidates:["2024-11-03T06:30:00.000Z","2024-11-03T07:30:00.000Z"]});expect(resolveBirthTime("2024-03-10","02:30","America/Chicago").status).toBe("nonexistent");});
 it("does not invent unknown time or location",()=>{expect(resolveBirthTime("2000-01-01","","").status).toBe("unknown");expect(validateCoordinates("","")).toBeNull();expect(()=>validateCoordinates("91","0")).toThrow();expect(validateCoordinates("0","0")).toEqual({latitude:0,longitude:0});});
});
