import { readFileSync } from 'fs';

import { fromJcamp } from '..';


import { toBeDeepCloseTo, toMatchCloseTo } from 'jest-matcher-deep-close-to';
expect.extend({ toBeDeepCloseTo, toMatchCloseTo });


function read(file) {
  return readFileSync(`${__dirname}/data/${file}`, 'utf8');
}

describe('getMetadata', function () {
  it('should be FID', function () {
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

  it('should be FT', function () {
    const metadata = fromJcamp(read('ft.dx'));
    expect(metadata).toStrictEqual({
      dimension: 1,
      nucleus: ['1H'],
      isFid: false,
      isFt: true,
      isComplex: false,
      title: '504-63-2',
      experiment: '',
      temperature: NaN,
      frequency: 400.08260052,
      type: 'NMR SPECTRUM',
      expno: NaN,
    });
  });

  it('should be cosy 2d', function () {
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

  it('should parse test2 without infinite loop', function () {
    const metadata = fromJcamp(read('test2.jdx'), {
      computeRanges: true,
    });
    expect(metadata.range).toHaveLength(4);
    expect(metadata.type).toBe('NMR SPECTRUM');
    expect(metadata.isFid).toBe(false);
    expect(metadata.isFt).toBe(true);
    expect(metadata.expno).toBe(1);
    expect(metadata.experiment).toBe('1d');
  });

  it('should parse bruker-nmr-ft-RI.jdx without infinite loop', function () {
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

  it('should compute ranges', function () {
    const metadata = fromJcamp(read('ft-data.jdx'), {
      computeRanges: true,
      ranges: { integrationSum: 10 },
    });
    expect(metadata.acquisitionMode).toBe(0);
    expect(metadata.range).toHaveLength(4);
    const ranges = metadata.range.sort((a, b) => b.from - a.from);
    expect(ranges[0]).toBeDeepCloseTo({
      from: 4.149999428080906,
      to: 4.244847614555428,
      integral: 2.094606290082905,
      signal: [
        { kind: 'signal', multiplicity: 's', delta: 4.185861563956111 },
        {
          kind: 'signal',
          multiplicity: 'dt',
          j: [
            { coupling: 7.172427175040866, multiplicity: 'd' },
            { coupling: 1.6519511785545546, multiplicity: 't' },
          ],
          delta: 4.211008831980948,
        },
      ],
    });
  });

  it('should be mestrec', function () {
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
      temperature: NaN,
      frequency: 400.1318406,
      type: 'NMRSPECTRUM',
      expno: NaN,
    });
  });
});
