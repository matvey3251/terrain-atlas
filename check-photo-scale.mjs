import assert from 'node:assert/strict';import {photoHeight} from './dist/photo-scale.mjs';assert.equal(photoHeight(3,100,800),24);assert.equal(photoHeight(2.5,125,500),10);assert.throws(()=>photoHeight(3,0,800));assert.throws(()=>photoHeight(-1,10,100));assert.throws(()=>photoHeight(100,1,100));console.log('5 photo scale checks passed');

