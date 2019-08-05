
import nmrMetadata from '..';

describe('getSpectrumType', function () {
  it('should return empty string for unknown pulse', function () {
    check([['', ''], ['aaa', ''], [null, ''], ['test', '']]);
  });

  it('should know about real pulse sequences', function () {
    check([
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
      ['apt', 'aptjmod']
    ]);
  });
});

function check(arr) {
  for (var test of arr) {
    nmrMetadata.getSpectrumType(test[0]).should.equal(test[1]);
  }
}
