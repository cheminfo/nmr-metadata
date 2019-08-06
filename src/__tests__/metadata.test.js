import FS from 'fs';

import { fromJcamp } from '..';

function read(file) {
  return FS.readFileSync(`${__dirname}/data/${file}`, 'utf8');
}

describe('getType', function () {
  it('should be FID', function () {
    const metadata = fromJcamp(read('fid.dx'));
    expect(metadata.type).toBe('NMR FID');
    expect(metadata.isFid).toBe(true);
    expect(metadata.isFt).toBe(false);
    expect(metadata.dimension).toBe(1);
  });

  it('should be FT', function () {
    const metadata = fromJcamp(read('ft.dx'));
    expect(metadata.type).toBe('NMR SPECTRUM');
    expect(metadata.isFid).toBe(false);
    expect(metadata.isFt).toBe(true);
    expect(metadata.dimension).toBe(1);
  });

  it.only('should be cosy 2d', function () {
    const metadata = fromJcamp(read('cosy.jdx'));
    expect(metadata.type).toBe('nD NMR SPECTRUM');
    expect(metadata.isFid).toBe(false);
    expect(metadata.isFt).toBe(true);
    expect(metadata.dimension).toBe(2);
  });

  it('should parse test2 without infinite loop', function () {
    const metadata = fromJcamp(read('test2.jdx'), {
      computeRanges: true
    });
    expect(metadata.type).toBe('NMR SPECTRUM');
    expect(metadata.isFid).toBe(false);
    expect(metadata.isFt).toBe(true);
    expect(metadata.expno).toBe(1);
    expect(metadata.experiment).toBe('proton');
  });

  it('should parse test3 without infinite loop', function () {
    const metadata = fromJcamp(read('test3.jdx'), {
      computeRanges: true
    });
    expect(metadata.probe).toBe('5 mm PABBO BB/19F-1H/D Z-GRD Z116098/0061');
    expect(metadata.acquisitionMode).toBe(0);
    expect(metadata.type).toBe('NMR SPECTRUM');
    expect(metadata.isFid).toBe(false);
    expect(metadata.isFt).toBe(true);
  });

  it('should compute ranges', function () {
    const metadata = fromJcamp(read('ft-data.jdx'), {
      computeRanges: true,
      ranges: { nH: 10 }
    });
    expect(metadata.acquisitionMode).toBe(0);
    expect(metadata.range).toHaveLength(4);
    expect(metadata.range[0]).toHaveProperty('from');
    expect(metadata.range[0]).toHaveProperty('to');
    expect(metadata.range[0]).toHaveProperty('integral');
    expect(metadata.range[0]).toHaveProperty('signal');
    expect(metadata.range[0].signal).toHaveLength(1);
    expect(metadata.range[0].signal[0]).toHaveProperty('delta');
    expect(metadata.range[0].signal[0]).toHaveProperty('diaID');
    expect(metadata.range[0].signal[0]).toHaveProperty('multiplicity');
  });

  it('should be mestrec', function () {
    const metadata = fromJcamp(read('mestrec.jcamp'));
    expect(metadata.type).toBe('NMRSPECTRUM');
    expect(metadata.isFid).toBe(false);
    expect(metadata.isFt).toBe(true);
    expect(metadata.solvent).toBe('MeOD');
    expect(metadata.frequency).toBe(400.1318406);
  });
});
