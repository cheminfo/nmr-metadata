import { expect, test } from 'vitest';

import { fromInfo, fromJcamp, getSpectrumType } from '../index.ts';

test('exported functions exist', () => {
  expect(typeof fromJcamp).toBe('function');
  expect(typeof fromInfo).toBe('function');
  expect(typeof getSpectrumType).toBe('function');
});
