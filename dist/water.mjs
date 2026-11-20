// Water extents are source polygons; a centerline never implies a guessed width.
export function isWaterArea(tags={}){
 return tags.natural==='water'||(typeof tags.water==='string'&&tags.water!=='no')||tags.waterway==='riverbank'||['reservoir','basin'].includes(tags.landuse);
}
export function isWaterLine(feature){return ['river','stream','canal','drain','ditch'].includes(feature.properties?.waterway)&&['LineString','MultiLineString'].includes(feature.geometry?.type);}
export function waterPolygons(feature){if(!isWaterArea(feature.properties)||feature.properties?.tainted)return [];const g=feature.geometry;return g?.type==='Polygon'?[g.coordinates]:g?.type==='MultiPolygon'?g.coordinates:[];}

