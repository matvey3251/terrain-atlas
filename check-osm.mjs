import assert from 'node:assert/strict';
import {loadOSM} from './dist/osm-loader.mjs';
const endpoints=['https://first.example/api','https://second.example/api'];const bounds=[55,37,55.01,37.01];
for(const failure of [{ok:false,status:502},{ok:true,json:async()=>{throw Error('HTML')}},{ok:true,json:async()=>({remark:'runtime error',elements:[]})}]){let calls=0;const result=await loadOSM(bounds,{endpoints,storage:null,fetchImpl:async(url,options)=>{assert.equal(options.method,'GET');assert.ok(url.includes('?data='));return ++calls===1?failure:{ok:true,json:async()=>({elements:[]})};}});assert.equal(calls,2);assert.equal(result.endpoint,endpoints[1]);}
const controller=new AbortController();controller.abort();await assert.rejects(loadOSM(bounds,{signal:controller.signal,storage:null,fetchImpl:()=>{throw Error('must not fetch')}}),{name:'AbortError'});
const values=new Map();const storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};await loadOSM(bounds,{storage,endpoints,fetchImpl:async()=>({ok:true,json:async()=>({elements:[]})})});assert.equal((await loadOSM(bounds,{storage,endpoints,fetchImpl:()=>{throw Error('cache should prevent fetch')}})).cached,true);
console.log('5 OSM loader scenarios passed');
let seenURL;
await loadOSM([55.750,37.616,55.752,37.620],{storage:null,endpoints:['https://api.openstreetmap.org/api/0.6/map.json'],fetchImpl:async url=>{seenURL=new URL(url);return {ok:true,json:async()=>({elements:[]})};}});
assert.equal(seenURL.searchParams.get('bbox'),'37.616,55.75,37.62,55.752');assert.equal(seenURL.searchParams.has('data'),false);
console.log('Map API bbox ordering passed');

let fallbackCalls=[];const recovered=await loadOSM([55.75,37.61,55.752,37.615],{storage:null,fetchImpl:async url=>{fallbackCalls.push(url);return url.includes('map.json')?{ok:true,json:async()=>({elements:[]})}:{ok:false,status:502};}});assert.equal(fallbackCalls.length,3);assert.ok(recovered.endpoint.endsWith('map.json'));fallbackCalls=[];await assert.rejects(loadOSM([55.7,37.6,55.8,37.7],{storage:null,fetchImpl:async url=>{fallbackCalls.push(url);return {ok:false,status:502};}}));assert.equal(fallbackCalls.length,2);assert.ok(fallbackCalls.every(url=>!url.includes('map.json')));console.log('Automatic fallback and large-area limit checks passed');

