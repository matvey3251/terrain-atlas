import assert from 'node:assert/strict';
import {sampleTerrain} from './dist/terrain-sample.mjs';
import {buildQuery} from './dist/osm-loader.mjs';
const grid={N:1,min:0,vals:[0,10,20,40]};
assert.equal(sampleTerrain(grid,10,0,0),0);
assert.equal(sampleTerrain(grid,10,10,10),40);
assert.equal(sampleTerrain(grid,10,2,8),20);
assert.equal(sampleTerrain(grid,10,8,2),14);
assert.equal(sampleTerrain(grid,10,-1,11),20);
const q=buildQuery([55,37,55.01,37.01]);
for(const key of ['natural','amenity','highway','leisure','barrier'])assert.ok(q.includes('node['+key+'];'));
assert.ok(q.includes('way[area:highway]'));
console.log('Terrain triangle interpolation and landscape query checks passed');

const {foundationExtension}=await import('./dist/terrain-sample.mjs');assert.equal(foundationExtension(10,[8,10,12],0),2.05);assert.equal(foundationExtension(10,[8,10,12],3),0);assert.equal(foundationExtension(10,[],0),0);assert.equal(foundationExtension(10,[12,13],0),.05);console.log('4 ground contact checks passed');

