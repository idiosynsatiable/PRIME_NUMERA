import { dateParts,digitalRoot,personalCycles } from "./omega-engine";
export const FIXED_MONTHS=["January","February","March","April","May","June","Sol","July","August","September","October","November","December"] as const;
export const FIXED_WEEKDAYS=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"] as const;
const DAY=86400000;
export const isLeap=(year:number)=>year%4===0&&(year%100!==0||year%400===0);
function start(year:number){if(!Number.isInteger(year)||year<1||year>9999)throw new RangeError("Year must be 1–9999.");return dateParts(String(year).padStart(4,"0")+"-01-01").date.getTime();}
function iso(year:number,ordinal:number){return new Date(start(year)+(ordinal-1)*DAY).toISOString().slice(0,10);}
export type FixedDate={year:number;kind:"regular";month:number;day:number;week:number;weekday:number;ordinal:number;quarter:number;quarterDay:number}|{year:number;kind:"year-day"|"leap-day"};
export function toFixed(value:string):FixedDate {
 const {year,date}=dateParts(value);
 const civil=Math.round((date.getTime()-start(year))/DAY)+1;
 if(civil===365+Number(isLeap(year)))return {year,kind:"year-day"};
 if(isLeap(year)&&civil===169)return {year,kind:"leap-day"};
 const ordinal=civil-Number(isLeap(year)&&civil>169);
 const day=(ordinal-1)%28+1;
 return {year,kind:"regular",month:Math.floor((ordinal-1)/28)+1,day,week:Math.floor((ordinal-1)/7)+1,weekday:(day-1)%7,ordinal,quarter:Math.floor((ordinal-1)/91)+1,quarterDay:(ordinal-1)%91+1};
}
export function fromFixed(year:number,month:number,day:number){
 start(year);
 if(!Number.isInteger(month)||month<1||month>13||!Number.isInteger(day)||day<1||day>28)throw new RangeError("Fixed month 1–13 and day 1–28 required.");
 const ordinal=(month-1)*28+day;
 return iso(year,ordinal+Number(isLeap(year)&&ordinal>168));
}
export function fixedExtra(year:number,kind:"year-day"|"leap-day"){
 start(year);
 if(kind==="leap-day"&&!isLeap(year))throw new RangeError("Not a leap year.");
 return iso(year,kind==="leap-day"?169:365+Number(isLeap(year)));
}
export function fixedLabel(f:FixedDate){return f.kind==="regular"?FIXED_MONTHS[f.month-1]+" "+f.day+", "+f.year:f.kind==="year-day"?"Year Day "+f.year:"Leap Day "+f.year;}
export function yearDates(year:number){return Array.from({length:365+Number(isLeap(year))},(_,i)=>iso(year,i+1));}
export function parseFavorites(raw:string){if(!raw.trim())return [];const pieces=raw.trim().split(/[\s,;]+/);if(pieces.length>200||pieces.some(x=>!/^\d{1,6}$/.test(x)))throw new RangeError("Use up to 200 integers from 0 to 999999, separated by commas or spaces.");return [...new Set(pieces.map(Number))].sort((a,b)=>a-b);}
export function dozenal(raw:string){if(!/^\d{1,100}$/.test(raw))throw new RangeError("Use 1–100 decimal digits.");return BigInt(raw).toString(12).toUpperCase();}
export const MODEL_VERSION="fortuna-symbolic-v1";
export type PatternRule="favorite-day"|"favorite-month"|"favorite-root"|"personal-root"|"three-six-nine"|"four-eight-twelve"|"birth-day";
export const PATTERN_RULES:readonly PatternRule[]=["favorite-day","favorite-month","favorite-root","personal-root","three-six-nine","four-eight-twelve","birth-day"];
export function datePatterns(birth:string,value:string,favorites:readonly number[],frame:"gregorian"|"fixed",personalNumbers:readonly number[]=[]){
 const b=dateParts(birth),d=dateParts(value),f=toFixed(value);
 const month=frame==="gregorian"?d.month:f.kind==="regular"?f.month:null;
 const day=frame==="gregorian"?d.day:f.kind==="regular"?f.day:null;
 const root=digitalRoot(d.year+d.month+d.day);
 const cycle=personalCycles(birth,value);
 const matches:PatternRule[]=[];
 if(day!==null&&favorites.includes(day))matches.push("favorite-day");
 if(month!==null&&favorites.includes(month))matches.push("favorite-month");
 if(favorites.includes(root))matches.push("favorite-root");
 if(personalNumbers.includes(cycle.day))matches.push("personal-root");
 if([3,6,9].includes(root))matches.push("three-six-nine");
 if(month!==null&&[4,8,12].includes(month))matches.push("four-eight-twelve");
 if(day!==null&&day===(frame==="gregorian"?b.day:(()=>{const bf=toFixed(birth);return bf.kind==="regular"?bf.day:null;})()))matches.push("birth-day");
 return {date:value,frame,root,personalDay:cycle.day,matches,score:matches.length,fixed:f,version:MODEL_VERSION};
}
export type Observation={date:string;rating:number;recordedAt:string;score:number;model:string;frame:"gregorian"|"fixed";favorites:number[];personalNumbers:number[]};
export function summarizeObservations(records:readonly Observation[]){
 const higher=records.filter(x=>x.score>=4),lower=records.filter(x=>x.score<4);
 const mean=(xs:readonly Observation[])=>xs.length?xs.reduce((s,x)=>s+x.rating,0)/xs.length:null;
 return {higherCount:higher.length,lowerCount:lower.length,higherMean:mean(higher),lowerMean:mean(lower)};
}
