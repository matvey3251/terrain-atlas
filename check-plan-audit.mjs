import assert from 'node:assert/strict';import {auditPlan} from './dist/plan-audit.mjs';
const f=(c,p={})=>({properties:{highway:'footway',...p},geometry:{type:'LineString',coordinates:c}}),b=[0,0,.01,.01];
assert.equal(auditPlan([f([[.001,.001],[.002,.001]]),f([[.002,.001],[.003,.001]])],b).possibleGaps,0);
assert.ok(auditPlan([f([[.001,.001],[.002,.001]]),f([[.00201,.001],[.003,.001]])],b).possibleGaps>0);
assert.equal(auditPlan([f([[.001,.001],[.002,.001]]),f([[.00201,.001],[.003,.001]],{bridge:'yes',layer:'1'})],b).possibleGaps,0);console.log('Near gaps, connected endpoints and grade separation checks passed');

