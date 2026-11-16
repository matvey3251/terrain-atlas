import {pointInPolygon} from './buildings.mjs';
const bbox=p=>{const a=p.flat();return [Math.min(...a.map(v=>v[0])),Math.min(...a.map(v=>v[1])),Math.max(...a.map(v=>v[0])),Math.max(...a.map(v=>v[1]))]};
const distance=(p,poly)=>Math.min(...poly.flatMap(r=>r.slice(1).map((b,i)=>{const a=r[i],dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)})));
// triangulate(poly) returns arrays of three [x,y] points, including holes correctly.
export function createUrbanTerrain({pads,side,rawElevation,clip,triangulate,blend=6,cellSize=5,adaptive=true}){
 if(!Number.isFinite(side)||side<=0)throw Error('Некорректный размер участка');blend=Number.isFinite(blend)?Math.max(.1,Math.min(50,blend)):6;cellSize=Number.isFinite(cellSize)?Math.max(.5,cellSize):5;
 const groups=(pads.length?clip.union(...pads.map(p=>p.poly)):[]).map(poly=>{const samples=[];for(const r of poly)for(let i=1;i<r.length;i++){const a=r[i-1],b=r[i],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/5));for(let j=0;j<n;j++)samples.push(rawElevation(a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n));}samples.sort((a,b)=>a-b);return {poly,box:bbox(poly),height:samples[Math.floor(samples.length/2)]};});
 // Widen transitions according to the local cut/fill, never assert a design slope.
 for(const g of groups){const residuals=[];for(const ring of g.poly)for(let i=1;i<ring.length;i++){const a=ring[i-1],b=ring[i],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/10));for(let j=0;j<n;j++){const x=a[0]+(b[0]-a[0])*j/n,y=a[1]+(b[1]-a[1])*j/n;for(const [dx,dy]of [[0,0],[blend,0],[-blend,0],[0,blend],[0,-blend]]){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<=side&&Y<=side)residuals.push(Math.abs(rawElevation(X,Y)-g.height));}}}residuals.sort((a,b)=>a-b);g.transition=adaptive?Math.max(blend,Math.min(Math.max(blend,Math.min(150,side/2)),1.5*(residuals[Math.floor(residuals.length*.9)]||0)/.12)):blend;}
 const padHeights=new Map();
 const polygonArea=poly=>poly.reduce((total,ring,k)=>{const area=Math.abs(ring.slice(0,-1).reduce((v,p,i)=>{const q=ring[i+1];return v+p[0]*q[1]-q[0]*p[1]},0))/2;return total+(k===0?area:-area)},0);
 for(const p of pads){const box=bbox(p.poly);let best=null,bestArea=0;for(const g of groups){if(box[2]<g.box[0]||box[0]>g.box[2]||box[3]<g.box[1]||box[1]>g.box[3])continue;const area=clip.intersection(p.poly,g.poly).reduce((v,poly)=>v+polygonArea(poly),0);if(area>bestArea){bestArea=area;best=g;}}if(best)padHeights.set(p.key,best.height);}

 const gradeCache=new Map();
 const grade=(x,y)=>{const key=x+','+y;if(gradeCache.has(key))return gradeCache.get(key);const p=[x,y];for(const g of groups)if(x>=g.box[0]&&x<=g.box[2]&&y>=g.box[1]&&y<=g.box[3]&&pointInPolygon(p,g.poly)){gradeCache.set(key,g.height);return g.height;}let sum=0,weight=0,strength=0;for(const g of groups){if(x<g.box[0]-g.transition||x>g.box[2]+g.transition||y<g.box[1]-g.transition||y>g.box[3]+g.transition)continue;const d=distance(p,g.poly);if(d<g.transition){const t=1-d/g.transition,w=t*t*(3-2*t),influence=w/Math.max(1e-20,d*d);sum+=influence*g.height;weight+=influence;strength=Math.max(strength,w);}}const raw=rawElevation(x,y),value=weight?raw*(1-strength)+sum/weight*strength:raw;gradeCache.set(key,value);return value;};
 const N=Math.min(128,Math.max(1,Math.ceil(side/cellSize))),step=side/N,positions=[],cells=new Map();let errors=0;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=i*step,y=j*step,cell=[[[x,y],[x+step,y],[x+step,y+step],[x,y+step],[x,y]]],near=groups.filter(g=>g.box[0]<=x+step&&g.box[2]>=x&&g.box[1]<=y+step&&g.box[3]>=y),triangles=[];try{const pieces=[];for(const g of near)for(const p of clip.intersection(cell,g.poly))pieces.push({p,h:g.height});for(const p of near.length?clip.difference(cell,...near.map(g=>g.poly)):[cell])pieces.push({p});for(const piece of pieces)for(const t of triangulate(piece.p)){const v=t.map(([a,b])=>[a,b,piece.h??grade(a,b)]);triangles.push(v);for(const [a,b,h]of v)positions.push(a-side/2,h,side/2-b);}}catch(e){errors++;throw new Error('Не удалось согласовать городской рельеф: '+e.message)}cells.set(j*N+i,triangles);}
 function elevation(x,y){x=Math.max(0,Math.min(side,x));y=Math.max(0,Math.min(side,y));const i=Math.min(N-1,Math.floor(x/step)),j=Math.min(N-1,Math.floor(y/step));for(const [a,b,c]of cells.get(j*N+i)||[]){const det=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);if(Math.abs(det)<1e-12)continue;const u=((b[1]-c[1])*(x-c[0])+(c[0]-b[0])*(y-c[1]))/det,v=((c[1]-a[1])*(x-c[0])+(a[0]-c[0])*(y-c[1]))/det,w=1-u-v;if(Math.min(u,v,w)>=-1e-7)return u*a[2]+v*b[2]+w*c[2];}return grade(x,y);}

 function nearbyTriangles(box){const result=[];const x0=Math.max(0,Math.floor(box[0]/step)),x1=Math.min(N-1,Math.floor(box[2]/step)),y0=Math.max(0,Math.floor(box[1]/step)),y1=Math.min(N-1,Math.floor(box[3]/step));for(let j=y0;j<=y1;j++)for(let i=x0;i<=x1;i++)result.push(...cells.get(j*N+i)||[]);return result;}
 function drapePolygon(poly,offset=0){
  const out=[];
  // Triangulate holes once; intersect convex triangles without a general polygon sweep.
  for(const subject of triangulate(poly))for(const terrain of nearbyTriangles(bbox([subject]))){
   let points=subject;const cross=(a,b,p)=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
   const orientation=Math.sign(cross(terrain[0],terrain[1],terrain[2]));if(!orientation)continue;
   for(let edge=0;edge<3&&points.length;edge++){
    const a=terrain[edge],b=terrain[(edge+1)%3],input=points;points=[];
    let prev=input.at(-1),dp=orientation*cross(a,b,prev);
    for(const current of input){const dc=orientation*cross(a,b,current),inside=dc>=-1e-10,wasInside=dp>=-1e-10;
     if(inside!==wasInside){const t=dp/(dp-dc);points.push([prev[0]+t*(current[0]-prev[0]),prev[1]+t*(current[1]-prev[1])]);}
     if(inside)points.push(current);prev=current;dp=dc;
    }
   }
   for(let i=1;i+1<points.length;i++){const triangle=[points[0],points[i],points[i+1]];if(Math.abs(cross(...triangle))<1e-10)continue;for(const [x,y]of triangle)out.push(x-side/2,elevation(x,y)+offset,side/2-y);}
  }return out;
 }
 function drapePolyline(coords,offset=0){const out=[];for(let k=1;k<coords.length;k++){const a=coords[k-1],b=coords[k],dx=b[0]-a[0],dy=b[1]-a[1],ts=[0,1];for(const tri of nearbyTriangles([Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1])]))for(let i=0;i<3;i++){const c=tri[i],d=tri[(i+1)%3],ex=d[0]-c[0],ey=d[1]-c[1],det=dx*ey-dy*ex;if(Math.abs(det)<1e-12)continue;const cx=c[0]-a[0],cy=c[1]-a[1],t=(cx*ey-cy*ex)/det,u=(cx*dy-cy*dx)/det;if(t>1e-9&&t<1-1e-9&&u>=-1e-9&&u<=1+1e-9)ts.push(t);}ts.sort((a,b)=>a-b);let last=-1;for(const t of ts){if(t-last<1e-9)continue;last=t;const x=a[0]+dx*t,y=a[1]+dy*t;if(x<0||x>side||y<0||y>side)continue;const v=[x-side/2,elevation(x,y)+offset,side/2-y];if(!out.length||Math.hypot(v[0]-out.at(-1)[0],v[2]-out.at(-1)[2])>1e-8)out.push(v);}}return out;}
 let maximumSlope=0,maxCutFill=0;for(const triangles of cells.values())for(const [a,b,c]of triangles){for(const v of [a,b,c])maxCutFill=Math.max(maxCutFill,Math.abs(v[2]-rawElevation(v[0],v[1])));const dx1=b[0]-a[0],dy1=b[1]-a[1],dx2=c[0]-a[0],dy2=c[1]-a[1],det=dx1*dy2-dx2*dy1;if(Math.abs(det)>1e-10){const dz1=b[2]-a[2],dz2=c[2]-a[2];maximumSlope=Math.max(maximumSlope,Math.hypot((dz1*dy2-dz2*dy1)/det,(dx1*dz2-dx2*dz1)/det));}}
 return {positions,elevation,padHeights,drapePolygon,drapePolyline,stats:{pads:pads.length,groups:groups.length,triangles:positions.length/9,errors,maximumSlope,maxCutFill,transitionWidths:groups.map(g=>g.transition)}};
}

