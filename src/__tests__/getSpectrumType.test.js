import { getSpectrumType } from '../getSpectrumType';

describe('getSpectrumType', () => {
  it('should return empty string for unknown pulse', () => {
    const tests = [
      ['', ''],
      ['aaa', ''],
      [null, ''],
      ['test', ''],
    ];
    for (let test of tests) {
      expect(getSpectrumType(test[0])).toBe(test[1]);
    }
  });

  it('should know about real pulse sequences', () => {
    const tests = [
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
    for (let test of tests) {
      expect(getSpectrumType(test[0])).toBe(test[1]);
    }
  });
});
