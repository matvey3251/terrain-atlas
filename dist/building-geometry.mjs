import {isBuildingFeature,isBuildingPart,polygonContained} from './buildings.mjs';
export function prepareBuildingGeometry(features,{polygons,valid,id,resolve,boxMode=()=>false,bounds,clip}){
 const raw=features.filter(isBuildingFeature).flatMap(f=>polygons(f).map((poly,i)=>({f,poly,key:id(f)+':'+i,basePoly:poly,model:resolve(f),part:isBuildingPart(f)})));
 const good=raw.filter(r=>valid(r.poly));let errors=raw.length-good.length,clipped=0;
 const drawable=r=>Number.isFinite(r.model.height)&&r.model.height>r.model.minHeight;
 const area=r=>Math.abs(r.poly[0].slice(0,-1).reduce((v,p,i)=>{const q=r.poly[0][i+1];return v+p[0]*q[1]-q[0]*p[1]},0));
 const shells=good.filter(r=>!r.part),cuts=new Map(),skip=new Set();
 for(const part of good.filter(r=>r.part&&drawable(r))){const parent=shells.filter(s=>s.f!==part.f&&polygonContained(part.poly,s.poly)).sort((a,b)=>area(a)-area(b))[0];if(!parent)continue;part.basePoly=parent.poly;if(boxMode(parent.f)&&drawable(parent)){skip.add(part.key);continue;}if(drawable(parent)){if(!cuts.has(parent.key))cuts.set(parent.key,[]);cuts.get(parent.key).push(part);}}
 const [w,s,e,n]=bounds,extent=[[[w,s],[e,s],[e,n],[w,n],[w,s]]],records=[];
 for(const r of good){if(skip.has(r.key))continue;try{const children=cuts.get(r.key)||[];const levels=children.length?[...new Set([r.model.minHeight,r.model.height,...children.map(p=>Math.max(r.model.minHeight,Math.min(r.model.height,p.model.minHeight)))])].sort((a,b)=>a-b):[];const slabs=children.length?levels.slice(0,-1).map((lo,i)=>({lo,hi:levels[i+1]})):[{lo:r.model.minHeight,hi:r.model.height}];for(const slab of slabs){const active=children.filter(p=>p.model.minHeight<=slab.lo).map(p=>p.poly);const shapes=active.length?clip.difference(r.poly,...active):[r.poly];for(const shape of shapes){if(shape[0].some(p=>p[0]<w||p[0]>e||p[1]<s||p[1]>n))clipped++;for(const poly of clip.intersection(shape,extent)){if(valid(poly))records.push({...r,model:{...r.model,minHeight:slab.lo,height:slab.hi},poly,key:r.key+':'+records.length});else errors++;}}}}catch{errors++;}}
 return {records,errors,clipped};
}

