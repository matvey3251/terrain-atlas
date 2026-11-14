export function parseMeters(value){if(value===undefined||value===null)return null;const s=String(value).trim();const m=s.match(/^(\d+(?:[.,]\d+)?)\s*(m|ft)?$/i);if(!m)return null;const n=Number(m[1].replace(',','.'))*(m[2]?.toLowerCase()==='ft'?.3048:1);return Number.isFinite(n)&&n>=0&&n<1000?n:null;}
export function buildingHeight(p){const n=parseMeters(p.height);return n>0?n:null;}
export function buildingMinimum(p){return p.min_height===undefined?0:parseMeters(p.min_height);}
export function terrainBase(values){const v=values.length>1?values.slice(0,-1):values;return v.reduce((a,b)=>a+b,0)/v.length;}

