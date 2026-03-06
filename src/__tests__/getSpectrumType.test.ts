import { expect, test } from 'vitest';

import { getSpectrumType } from '../getSpectrumType.ts';

test('should return empty string for unknown pulse', () => {
  const tests: Array<[string | null, string]> = [
    ['', ''],
    ['aaa', ''],
    [null, ''],
    ['test', ''],
  ];
  for (const [input, expected] of tests) {
    expect(getSpectrumType(input)).toBe(expected);
  }
});

test('should know about real pulse sequences', () => {
  const tests: Array<[string, string]> = [
    ['zg30', '1d'],
    ['zghfigqn', '1d'],

    ['hsqct1etf3gpsi', 'hsqctocsy'],

    ['hsqcedetgpsisp2.3', 'hsqc'],
    ['hsqcdietgpiasisp', 'hsqc'],

    ['hmbcgplpndqf', 'hmbc'],
    ['shmbcgpndqf', 'hmbc'],
    ['hmbcacbigpl2ndqf', 'hmbc'],

    ['cosygpppqf', 'cosy'],
    ['cosycwphps', 'cosy'],
    ['cosydfetgp.1', 'cosy'],

    ['hjresqf', 'jres'],
    ['lcjrescwfdprqf', 'jres'],

    ['atocsygpph19', 'tocsy'],
    ['dipsi2esfbgpph', 'tocsy'],
    ['mlevesgpph', 'tocsy'],

    ['noesygpphwgxf', 'noesy'],
    ['stdnoesyesgpph', 'noesy'],

    ['roesyesgpph', 'roesy'],
    ['troesyphpr', 'roesy'],

    ['deptppnd', 'dept'],
    ['hxdeptbiph', 'dept'],

    ['jmod', 'aptjmod'],
    ['apt', 'aptjmod'],
  ];
  for (const [input, expected] of tests) {
    expect(getSpectrumType(input)).toBe(expected);
  }
});
