import { convert } from 'jcampconverter';
import { xyAutoRangesPicking } from 'nmr-processing';

import { getMetaData } from './getMetaData';

export const fromInfo = getMetaData;

/**
 * Object containing parsed metadata
 * @name NMRMetadata
 * @typedef {object} NMRMetadata
 * @property {number} dimension
 * @property {number[]} nucleus
 * @property {string} title
 * @property {string} solvent
 * @property {string} pulse
 * @property {string} experiment
 * @property {number} temperature - Temperature in Kelvin
 * @property {number} frequency
 * @property {string} probe
 * @property {string} acquisitionMode
 * @property {number} expno - Experience number
 * @property {string} date - Date in ISO string format
 * @property {object} ranges
 */

const defaultOptions = {
  computeRanges: false,
};

const defaultRangesOptions = {
  integrationSum: 100,
  clean: 0.4,
  compile: true,
  integralType: 'sum',
};

const defaultPeaksOptions = {
  thresholdFactor: 0.85,
};

/**
 * Returns a metadata object from JCAMP
 * @param {string} jcampData
 * @param {object} [options={}]
 * @param {boolean} [options.computeRanges=false]
 * @param {number} [options.ranges] - options for ranges computation
 * @return {NMRMetadata} metadata
 */
export function fromJcamp(jcampData, options = {}) {
  options = {
    ...defaultOptions,
    ...options,
  };

  const jcampString = jcampData.toString();
  const parsedJcamp = convert(jcampString, {
    keepRecordsRegExp: /.*/,
    canonicMetadataLabels: true,
    withoutXY: false,
  }).flatten[0];

  let metadata = getMetaData(parsedJcamp.info, parsedJcamp.meta);

  if (
    options.computeRanges &&
    metadata.isFt &&
    metadata.dimension === 1 &&
    metadata.nucleus[0] === '1H'
  ) {
    let { ranges = {}, impurities = {}, peakPicking = {} } = options;

    const rangesOptions = { ...defaultRangesOptions, ...ranges };
    const peaksOptions = { ...defaultPeaksOptions, ...peakPicking };

    if (metadata.solvent) {
      impurities.solvent = metadata.solvent;
    }

    metadata.range = xyAutoRangesPicking(parsedJcamp.spectra[0].data, {
      impurities,
      ranges: rangesOptions,
      peakPicking: peaksOptions,
    });
  }

  return metadata;
}

export { getSpectrumType } from './getSpectrumType';
