import assert from 'node:assert/strict';import {buildingHeight as h,buildingMinimum as m,terrainBase as b} from './dist/buildings.mjs';
assert.equal(h({height:'12 m'}),12);assert.equal(h({height:'12,5'}),12.5);assert.equal(h({'building:levels':'5'}),null);assert.equal(h({height:'12;15'}),null);assert.equal(h({height:'-2'}),null);assert.equal(m({}),0);assert.equal(m({min_height:'3 m'}),3);assert.equal(m({min_height:'bad'}),null);assert.equal(b([0,4,8,0]),4);assert.equal(h({height:'100 ft'}),30.48);console.log('10 building height and foundation checks passed');

