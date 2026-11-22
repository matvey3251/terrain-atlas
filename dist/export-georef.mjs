export const WGS84_WKT='GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433],AUTHORITY["EPSG","4326"]]';
export function planWorldFile(bounds,width=1600,height=1800){
 if(!Array.isArray(bounds)||bounds.length!==4||!bounds.every(Number.isFinite))throw Error('Invalid bounds');
 const [south,west,north,east]=bounds,size=Math.min(width-100,height-260),margin=50;
 if(!(north>south&&east>west&&size>0))throw Error('Invalid extent');
 const a=(east-west)/size,e=-(north-south)/size;
 return [a,0,0,e,west+(.5-margin)*a,north+(.5-margin)*e].map(v=>v.toPrecision(16)).join('\n')+'\n';
}
export function georeferenceFiles(name,bounds,width=1600,height=1800){return [{name:name+'.pgw',data:planWorldFile(bounds,width,height)},{name:name+'.prj',data:WGS84_WKT+'\n'},{name:name+'.png.aux.xml',data:'<PAMDataset><SRS dataAxisToSRSAxisMapping="2,1">'+WGS84_WKT+'</SRS></PAMDataset>\n'}];}

