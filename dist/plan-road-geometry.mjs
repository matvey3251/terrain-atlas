// Segment rectangles and round joins; union removes all internal boundaries.
export function ribbonPolygons(line,width,box){
 const result=[],radius=width/2;
 if(!(radius>0))return result;
 const disc=p=>{const ring=Array.from({length:24},(_,i)=>[p[0]+radius*Math.cos(i*Math.PI/12),p[1]+radius*Math.sin(i*Math.PI/12)]);for(const q of ring){q[0]=Math.round(q[0]*1e6)/1e6;q[1]=Math.round(q[1]*1e6)/1e6;}ring.push(ring[0]);result.push([ring]);};
 for(let i=1;i<line.length;i++){
  let a=line[i-1],b=line[i];const d=[b[0]-a[0],b[1]-a[1]];let lo=0,hi=1;
  // Clip before buffering: distant source nodes must not make huge polygons.
  for(let k=0;k<2;k++){if(!d[k]){if(a[k]<box[k]-radius||a[k]>box[k+2]+radius)hi=-1;continue;}let u=(box[k]-radius-a[k])/d[k],v=(box[k+2]+radius-a[k])/d[k];if(u>v)[u,v]=[v,u];lo=Math.max(lo,u);hi=Math.min(hi,v);}
  if(lo>hi)continue;
  b=a.map((v,k)=>v+d[k]*hi);a=a.map((v,k)=>v+d[k]*lo);
  const len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(len<1e-8)continue;
  const nx=-(b[1]-a[1])*radius/len,ny=(b[0]-a[0])*radius/len;
  const ring=[[a[0]+nx,a[1]+ny],[b[0]+nx,b[1]+ny],[b[0]-nx,b[1]-ny],[a[0]-nx,a[1]-ny]];ring.push(ring[0]);result.push([ring]);disc(a);disc(b);
 }
 return result;
}