import assert from 'node:assert/strict';import {addLandscape,ribbonVertices} from './dist/landscape.mjs';
let disposed=0;class Attr{constructor(a,n){this.array=a;this.count=a.length/n;}getX(i){return this.array[i*3]}getY(i){return this.array[i*3+1]}getZ(i){return this.array[i*3+2]}}
class Geometry{constructor(){this.a={}}setAttribute(k,v){this.a[k]=v;return this}getAttribute(k){return this.a[k]}computeVertexNormals(){this.a.normal=new Attr(Array.from({length:this.a.position.array.length},(_,i)=>i%3===1?1:0),3)}dispose(){disposed++}}
class Mesh{constructor(g,m){this.geometry=g;this.material=m;this.isMesh=true;this.position={x:0,y:0,z:0}}}
const T={BufferGeometry:Geometry,Float32BufferAttribute:Attr,Mesh,MeshStandardMaterial:class{constructor(o){Object.assign(this,o)}},DoubleSide:2};
const scene={children:[],add(m){this.children.push(m)}};const features=Array.from({length:1000},(_,i)=>({properties:{highway:'residential'},geometry:{type:'LineString',coordinates:[[1,i%99],[99,i%99]]}}));
const counts=addLandscape(T,scene,features,{xy:p=>p,elevation:()=>0,side:100,layers:{paths:true}});
assert.equal(counts.paths,1000);assert.ok(scene.children.length<100);assert.equal(disposed,1000);assert.ok(scene.children.every(m=>m.geometry.getAttribute('position').count<=60000));console.log(JSON.stringify({paths:counts.paths,drawCalls:scene.children.length,disposed}));

const sums=arrays=>{const result=[0,0,0];for(const a of arrays)for(let i=0;i<a.length;i++)result[i%3]+=a[i];return result;};
const actual=scene.children.map(m=>m.geometry.getAttribute('position').array);
const expected=features.map(f=>ribbonVertices(f.geometry.coordinates,6,100,()=>0,0));
assert.equal(actual.reduce((n,a)=>n+a.length,0),expected.reduce((n,a)=>n+a.length,0));
assert.deepEqual(sums(actual),sums(expected));
for(const m of scene.children){const normals=m.geometry.getAttribute('normal').array;assert.equal(normals.length,m.geometry.getAttribute('position').array.length);assert.ok(normals.every((v,i)=>v===(i%3===1?1:0)));}
console.log('Batching preserves vertex count, coordinate sums and normals');
assert.deepEqual(actual.flat(),expected.flat());
const {addLandscapeAsync}=await import('./dist/landscape.mjs');
const asyncScene={children:[],add(m){this.children.push(m)}};let ticks=0;const timer=setInterval(()=>ticks++,0);
const asyncCounts=await addLandscapeAsync([T,asyncScene,features,{xy:p=>p,elevation:()=>0,side:100,layers:{paths:true}}]);clearInterval(timer);
assert.ok(ticks>0,'Timer should run during async build');assert.deepEqual(asyncCounts,counts);assert.deepEqual(asyncScene.children.flatMap(m=>m.geometry.getAttribute('position').array),actual.flat());
let checks=0;const cancelledScene={children:[],add(m){this.children.push(m)}};
await assert.rejects(addLandscapeAsync([T,cancelledScene,features,{xy:p=>p,elevation:()=>0,side:100,layers:{paths:true}}],()=>{if(++checks===4)throw new Error('cancelled');}),/cancelled/);
assert.ok(checks===4);console.log('Async geometry equality, event-loop yielding and cancellation passed');

