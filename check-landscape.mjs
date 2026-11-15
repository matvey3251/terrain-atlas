import assert from 'node:assert/strict';import {clipSegment,sampledSegment} from './dist/landscape.mjs';
assert.deepEqual(clipSegment([-5,5],[15,5],10),[[0,5],[10,5]]);assert.equal(clipSegment([-5,-5],[-1,-1],10),null);assert.deepEqual(clipSegment([2,2],[2,8],10),[[2,2],[2,8]]);const pts=sampledSegment([0,0],[13,0]);assert.equal(pts.length,4);assert.ok(pts.slice(1).every((p,i)=>Math.hypot(p[0]-pts[i][0],p[1]-pts[i][1])<=5));console.log('5 landscape clipping and sampling checks passed');

