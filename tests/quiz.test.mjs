import test from 'node:test';
import assert from 'node:assert/strict';
import { directions, getDirections } from '../dist/quiz.mjs';
test('coherent answers produce each matching direction', () => {
  directions.forEach((direction,index) => assert.deepEqual(getDirections([index,index,index,index]),[direction]));
});
test('ties preserve leading interests', () => {
  assert.deepEqual(getDirections([0,0,1,1]),directions.slice(0,2));
  assert.deepEqual(getDirections([0,1,2,3]),directions);
});
test('incomplete or invalid answers cannot produce a result', () => {
  for (const answers of [[],[0,1,2],[0,1,2,4],[0,1,2,-1],[0,1,2,1.5]]) assert.throws(() => getDirections(answers));
});
