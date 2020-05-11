import { fromJcamp, fromInfo, getSpectrumType } from '..';

describe('package', function () {
  it('test functions exists', function () {
    expect(typeof fromJcamp).toBe('function');
    expect(typeof fromInfo).toBe('function');
    expect(typeof getSpectrumType).toBe('function');
  });
});
