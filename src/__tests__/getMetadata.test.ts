import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from 'vitest';

import { fromJcamp } from '../index.ts';

function read(file: string): string {
  return readFileSync(join(import.meta.dirname, 'data', file), 'utf8');
}

test('should be FID', () => {
  const metadata = fromJcamp(read('fid.dx'));

  expect(metadata).toStrictEqual({
    dimension: 1,
    nucleus: ['1H'],
    isFid: true,
    isFt: false,
    isComplex: true,
    title: '-test -',
    solvent: 'CDCl3',
    pulse: 'zg',
    experiment: '1d',
    temperature: 295.76,
    frequency: 400.132470966543,
    type: 'NMR FID',
    probe: '5 mm PABBO BB-1H/D Z-GRD Z108618/0083',
    acquisitionMode: 0,
    expno: 1,
    date: '2018-01-29T18:16:20.000Z',
  });
});

test('should be FT', () => {
  const metadata = fromJcamp(read('ft.dx'));

  expect(metadata).toStrictEqual({
    dimension: 1,
    nucleus: ['1H'],
    isFid: false,
    isFt: true,
    isComplex: false,
    title: '504-63-2',
    experiment: '',
    temperature: Number.NaN,
    frequency: 400.08260052,
    type: 'NMR SPECTRUM',
    expno: Number.NaN,
  });
});

test('should be FT from ArrayBuffer', () => {
  const jcamp = readFileSync(join(import.meta.dirname, 'data', 'ft.dx'));
  const metadata = fromJcamp(jcamp);

  expect(metadata).toStrictEqual({
    dimension: 1,
    nucleus: ['1H'],
    isFid: false,
    isFt: true,
    isComplex: false,
    title: '504-63-2',
    experiment: '',
    temperature: Number.NaN,
    frequency: 400.08260052,
    type: 'NMR SPECTRUM',
    expno: Number.NaN,
  });
});

test('should be cosy 2d', () => {
  const metadata = fromJcamp(read('bruker-2d-ft-R-cosy.jdx'));

  expect(metadata).toStrictEqual({
    dimension: 2,
    nucleus: ['1H', '1H'],
    isFid: false,
    isFt: true,
    isComplex: false,
    title: 'ethylbenzene',
    solvent: 'DMSO',
    pulse: 'cosygpppqf',
    experiment: 'cosy',
    temperature: 298.0012,
    frequency: 400.0819144864,
    type: 'nD NMR SPECTRUM',
    probe: '5 mm CPPBBO BB-1H/19F/D Z-GRD Z130030/0001',
    acquisitionMode: 0,
    expno: 3,
    date: '2013-08-20T16:07:42.000Z',
  });
});

test('should parse test2 without infinite loop', () => {
  const metadata = fromJcamp(read('test2.jdx'), {
    computeRanges: true,
  });

  expect(metadata.range).toHaveLength(6);
  expect(metadata.type).toBe('NMR SPECTRUM');
  expect(metadata.isFid).toBe(false);
  expect(metadata.isFt).toBe(true);
  expect(metadata.expno).toBe(1);
  expect(metadata.experiment).toBe('1d');
});

test('should parse bruker-nmr-ft-RI.jdx without infinite loop', () => {
  const metadata = fromJcamp(read('bruker-1d-ft-RI.jdx'), {
    computeRanges: true,
  });

  expect(metadata.probe).toBe('5 mm PABBO BB/19F-1H/D Z-GRD Z116098/0061');
  expect(metadata.acquisitionMode).toBe(0);
  expect(metadata.type).toBe('NMR SPECTRUM');
  expect(metadata.isFid).toBe(false);
  expect(metadata.isFt).toBe(true);
  expect(metadata.isComplex).toBe(true);
});

test('should compute ranges', () => {
  const metadata = fromJcamp(read('ft-data.jdx'), {
    computeRanges: true,
    ranges: { integrationSum: 10 },
  });

  expect(metadata.acquisitionMode).toBe(0);
  expect(metadata.range).toHaveLength(4);

  const ranges = (metadata.range as Array<{ from: number }>).toSorted(
    (a, b) => b.from - a.from,
  );
  const firstRange = ranges[0] as Record<string, unknown>;

  expect(firstRange.from).toBeCloseTo(4.1716561893478055, 2);
  expect(firstRange.to).toBeCloseTo(4.250214517941065, 2);
  expect(firstRange.integration).toBeCloseTo(1.6182993551344924, 2);

  const signals = firstRange.signals as Array<Record<string, unknown>>;

  expect(signals).toHaveLength(1);

  const firstSignal = signals[0];

  expect(firstSignal).toBeDefined();
  expect(firstSignal?.multiplicity).toBe('dt');
  expect(firstSignal?.kind).toBe('signal');
  expect(firstSignal?.delta as number).toBeCloseTo(4.210935353644436, 2);
});

test('should be mestrec', () => {
  const metadata = fromJcamp(read('mestrec.jcamp'));

  expect(metadata).toStrictEqual({
    dimension: 1,
    nucleus: ['1H'],
    isFid: false,
    isFt: true,
    isComplex: false,
    title: 'ACH1048.1.fid',
    solvent: 'MeOD',
    pulse: 'zg30',
    experiment: '1d',
    temperature: Number.NaN,
    frequency: 400.1318406,
    type: 'NMRSPECTRUM',
    expno: Number.NaN,
  });
});
