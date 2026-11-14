export const ENDPOINTS = ['https://maps.mail.ru/osm/tools/overpass/api/interpreter','https://overpass.private.coffee/api/interpreter'];
export function buildQuery(bounds){if(!Array.isArray(bounds)||bounds.length!==4||!bounds.every(Number.isFinite))throw Error('Некорректные границы');return `[out:json][timeout:20][bbox:${bounds.join(',')}];(${['building','highway','landuse','natural','amenity','leisure','waterway'].map(k=>`way[${k}];relation[${k}];`).join('')});out body;>;out skel qt;`;}
export async function loadOSM(bounds,{signal,onProgress=()=>{},fetchImpl=globalThis.fetch,storage=globalThis.sessionStorage,endpoints=ENDPOINTS,timeoutMs=25000,now=()=>Date.now()}={}){
 signal?.throwIfAborted();const query=buildQuery(bounds),key='atlas-osm-v2:'+bounds.join(',');
 try{const hit=JSON.parse(storage?.getItem(key)||'null');if(hit&&now()-Date.parse(hit.downloadedAt)<3600000&&Array.isArray(hit.data?.elements)&&!hit.data.remark)return {...hit,cached:true};}catch{}
 const errors=[];
 for(let i=0;i<endpoints.length;i++){
  signal?.throwIfAborted();const endpoint=endpoints[i];onProgress(`Источник OSM ${i+1}/${endpoints.length}: ${new URL(endpoint).hostname}…`);
  const controller=new AbortController(),abort=()=>controller.abort(signal.reason);signal?.addEventListener('abort',abort,{once:true});const timer=setTimeout(()=>controller.abort(new DOMException('Время ожидания истекло','TimeoutError')),timeoutMs);
  try{const response=await fetchImpl(endpoint+'?'+new URLSearchParams({data:query}),{method:'GET',signal:controller.signal});if(!response.ok)throw Error('HTTP '+response.status);const data=await response.json();signal?.throwIfAborted();if(data.remark||!Array.isArray(data.elements))throw Error(data.remark?'Источник вернул неполные данные':'Некорректный ответ источника');const result={data,downloadedAt:new Date(now()).toISOString(),endpoint,cached:false};try{storage?.setItem(key,JSON.stringify(result));}catch{}return result;
  }catch(e){if(signal?.aborted)throw signal.reason;errors.push(new URL(endpoint).hostname+': '+(e.name==='TimeoutError'||controller.signal.aborted?'таймаут':e.message));}finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
 }
 throw Error('Источники OSM временно недоступны. '+errors.join('; ')+'. Повторите позже или уменьшите участок.');
}

