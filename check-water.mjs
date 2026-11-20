import assert from 'node:assert/strict';import {addLandscape,ribbonVertices} from './dist/landscape.mjs';
let disposed=0;class Attr{constructor(a,n){this.array=a;this.count=a.length/n;}getX(i){return this.array[i*3]}getY(i){return this.array[i*3+1]}getZ(i){return this.array[i*3+2]}}
class Geometry{constructor(){this.a={}}setAttribute(k,v){this.a[k]=v;return this}getAttribute(k){return this.a[k]}computeVertexNormals(){this.a.normal=new Attr(Array.from({length:this.a.position.array.length},(_,i)=>i%3===1?1:0),3)}dispose(){disposed++}}
class Mesh{constructor(g,m){this.geometry=g;this.material=m;this.isMesh=true;this.position={x:0,y:0,z:0}}}
const T={BufferGeometry:Geometry,Float32BufferAttribute:Attr,Mesh,MeshStandardMaterial:class{constructor(o){Object.assign(this,o)}},DoubleSide:2};

const {isWaterArea,waterPolygons}=await import('./dist/water.mjs');
for(const tags of [{natural:'water'},{water:'river'},{waterway:'riverbank'},{landuse:'reservoir'}])assert.ok(isWaterArea(tags));
assert.equal(isWaterArea({water:'no'}),false);
const ring=[[0,0],[10,0],[10,10],[0,10],[0,0]],hole=[[3,3],[3,4],[4,4],[4,3],[3,3]];
const f={properties:{waterway:'riverbank'},geometry:{type:'MultiPolygon',coordinates:[[ring,hole],[ring]]}};
assert.equal(waterPolygons(f).length,2);
const scene={children:[],add(m){this.children.push(m)}};let calls=[];
const c=addLandscape(T,scene,[f],{xy:p=>p,elevation:()=>0,side:10,layers:{surfaces:true},drapePolygon:(rings)=>{calls.push(rings);return [0,0,0,1,0,0,0,0,1]}});
assert.equal(c.waterAreas,2);assert.equal(calls[0].length,2);assert.ok(scene.children.length);assert.equal(c.waterLines,0);console.log('Water tag variants, multipolygon areas and island rings pass');

