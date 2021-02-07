import { readFileSync } from 'fs';

import { fromJcamp } from '..';

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
    console.log(metadata.range);
    return;
    expect(metadata.range).toHaveLength(7);
    expect(metadata.type).toBe('NMR SPECTRUM');
    expect(metadata.isFid).toBe(false);
    expect(metadata.isFt).toBe(true);
    expect(metadata.expno).toBe(1);
    expect(metadata.experiment).toBe('proton');
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

  it.only('should compute ranges', function () {
    const metadata = fromJcamp(read('ft-data.jdx'), {
      computeRanges: true,
      ranges: { nH: 10 },
    });
    expect(metadata.acquisitionMode).toBe(0);
    expect(metadata.range).toHaveLength(4);
    expect(metadata).toStrictEqual([
      {
        from: 4.15193,
        to: 4.25439,
        integral: 1.99235,
        signal: [
          {
            nbAtoms: 0,
            diaID: [],
            multiplicity: 'm',
            kind: '',
            remark: '',
            delta: 4.21111,
          },
        ],
      },
      {
        from: 3.42359,
        to: 3.49019,
        integral: 1.80563,
        signal: [
          {
            nbAtoms: 0,
            diaID: [],
            multiplicity: 's',
            kind: '',
            remark: '',
            delta: 3.45689,
          },
        ],
      },
      {
        from: 2.24782,
        to: 2.31955,
        integral: 2.66827,
        signal: [
          {
            nbAtoms: 0,
            diaID: [],
            multiplicity: 's',
            kind: '',
            remark: '',
            delta: 2.28368,
          },
        ],
      },
      {
        from: 1.24795,
        to: 1.35041,
        integral: 3.0659,
        signal: [
          {
            nbAtoms: 0,
            diaID: [],
            multiplicity: 'm',
            kind: '',
            remark: '',
            delta: 1.29514,
          },
        ],
      },
    ]);
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
