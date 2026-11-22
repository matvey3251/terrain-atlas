// Conservative checks: report source endpoints, never invent connections.
export function auditPlan(features,bounds){
 const issues=[];let invalid=0,roads=0;const segments=[],ends=[];const [s,w,n,e]=bounds,lat=(s+n)*Math.PI/360,scaleX=111320*Math.cos(lat),scaleY=111320,xy=p=>[(p[0]-w)*scaleX,(p[1]-s)*scaleY];
 for(const f of features){const g=f.geometry,p=f.properties||{};if(!g||p.tainted){invalid++;continue;}if(!p.highway||['proposed','construction'].includes(p.highway))continue;const lines=g.type==='LineString'?[g.coordinates]:g.type==='MultiLineString'?g.coordinates:[];for(const line of lines){if(line.length<2||line.some(q=>!Number.isFinite(q[0])||!Number.isFinite(q[1]))){invalid++;continue;}roads++;const level=String(p.layer||0)+'/'+String(p.bridge||'no')+'/'+String(p.tunnel||'no');for(let i=1;i<line.length;i++)segments.push({a:xy(line[i-1]),b:xy(line[i]),f,level});for(const q of [line[0],line.at(-1)])if(q[0]>w&&q[0]<e&&q[1]>s&&q[1]<n&&p.noexit!=='yes')ends.push({q,point:xy(q),f,level});}}
 const dist=(p,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);};
 for(const end of ends){let closest=Infinity;for(const seg of segments){if(seg.f===end.f||seg.level!==end.level)continue;closest=Math.min(closest,dist(end.point,seg.a,seg.b));if(closest<.05)break;}if(closest>.05&&closest<2)issues.push({type:'possible_gap',osm_id:end.f.id||end.f.properties?.id,coordinates:end.q,gap_m:+closest.toFixed(2)});}
 return {roadParts:roads,invalidOrIncomplete:invalid,possibleGaps:issues.length,issues,note:'Кандидаты на проверку, не доказанные ошибки. Тупики и разные уровни могут быть корректны. Геометрия автоматически не соединяется.'};
}

