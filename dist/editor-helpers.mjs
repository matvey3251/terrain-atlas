export function featureId(f){return String(f.id||f.properties?.id||'');}
export function boxRing(points){const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),a=Math.min(...xs),b=Math.max(...xs),c=Math.min(...ys),d=Math.max(...ys);return [[a,c],[b,c],[b,d],[a,d],[a,c]];}
export function facadeEdge(points,index){const n=points.length-1,i=((index%n)+n)%n;return [points[i],points[i+1]];}
export function photoSearch(f){const p=f.properties||{},q=[p.name,p['addr:city'],p['addr:street'],p['addr:housenumber']].filter(Boolean).join(' ');const c=f.geometry.type==='Polygon'?f.geometry.coordinates[0][0]:f.geometry.coordinates[0][0][0];return 'https://www.google.com/search?tbm=isch&q='+encodeURIComponent((q||c[1]+', '+c[0])+' фасад здание');}
export function osmLink(id){return /^(way|relation)\/\d+$/.test(id)?'https://www.openstreetmap.org/'+id:null;}
export function commonsLink(value){return typeof value==='string'&&/^(File|Category):[^<>]+$/.test(value)?'https://commons.wikimedia.org/wiki/'+encodeURIComponent(value):null;}

