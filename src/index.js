
import jcampconverter from 'jcampconverter';
import { NMR } from 'spectra-data';

import { getMetaData } from './getMetaData';


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
  computeRanges: false
};

const defaultRangesOptions = {
  nH: 100,
  thresholdFactor: 0.85,
  clean: 0.4,
  compile: true,
  integralType: 'sum'
};

/**
 * Returns a metadata object from JCAMP
 * @param {string} jcampData
 * @param {object} [options={}]
 * @param {boolean} [options.computeRanges=false]
 * @param {number} [options.ranges] - options for ranges computation
 * @return {NMRMetadata} metadata
 */
export function fromJcamp(jcampData, options) {
  options = Object.assign({}, defaultOptions, options);

  const jcampString = jcampData.toString();
  const parsedJcamp = jcampconverter.convert(jcampString, {
    keepRecordsRegExp: /.*/,
    withoutXY: true
  });

  // console.log(parsedJcamp.info);

  let metadata = getMetaData(parsedJcamp.info);

  if (
    options.computeRanges &&
    metadata.isFt &&
    metadata.dimension === 1 &&
    metadata.nucleus[0] === '1H'
  ) {
    const rangesOptions = Object.assign(
      {},
      defaultRangesOptions,
      options.ranges
    );
    if (options.removeImpurities && metadata.solvent) {
      rangesOptions.removeImpurity = { solvent: metadata.solvent };
    }
    const spectrum = NMR.fromJcamp(jcampString);
    const ranges = spectrum.getRanges(rangesOptions);
    ranges.forEach(function (range) {
      // todo remove when there is an option to avoid that
      delete range._highlight;
      delete range.signalID;
      range.signal.forEach(function (signal) {
        delete signal.peak;
      });
    });
    metadata.range = ranges;
  }

  return metadata;
}


export { getSpectrumType } from './getSpectrumType';

