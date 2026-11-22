import assert from 'node:assert/strict';import {planWorldFile,georeferenceFiles} from './dist/export-georef.mjs';
const bounds=[55,37,55.01,37.02],v=planWorldFile(bounds).trim().split('\n').map(Number),[a,b,d,e,c,f]=v;
const point=(x,y)=>[a*(x-.5)+c,d*(x-.5)+e*(y-.5)+f];
for(const [pixel,expected]of [[[50,50],[37,55.01]],[[1550,1550],[37.02,55]],[[800,800],[37.01,55.005]]])point(...pixel).forEach((n,i)=>assert.ok(Math.abs(n-expected[i])<1e-12));
assert.equal(b,0);assert.equal(d,0);assert.ok(e<0);assert.equal(georeferenceFiles('png/test',bounds).length,3);assert.throws(()=>planWorldFile([1,2,0,3]));console.log('Worldfile pixel centres, margins, corners, centre, CRS sidecars pass');

