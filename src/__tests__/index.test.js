import { fromJcamp, fromInfo, getSpectrumType } from '..';

describe('package', () => {
  it('test functions exists', () => {
    expect(typeof fromJcamp).toBe('function');
    expect(typeof fromInfo).toBe('function');
    expect(typeof getSpectrumType).toBe('function');
  });
});
