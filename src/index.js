'use strict';

const jcampconverter = require('jcampconverter');
const SD = require('spectra-data');

const getSpectrumType = require('./getSpectrumType');

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
 * @param {object} [options]
 * @param {boolean} [options.computeRanges=false]
 * @param {number} [options.ranges] - options for ranges computation
 * @return {NMRMetadata} metadata
 */
exports.parseJcamp = function(jcampData, options) {
  options = Object.assign({}, defaultOptions, options);

  const jcampString = jcampData.toString();
  const jcamp = jcampconverter.convert(jcampString, {
    keepRecordsRegExp: /.*/,
    withoutXY: true
  });

  const metadata = {
    dimension: jcamp.twoD ? 2 : 1,
    nucleus: [],
    isFid: false,
    isFt: false
  };

  const info = jcamp.info;
  maybeAdd(metadata, 'title', info['TITLE']);
  maybeAdd(metadata, 'solvent', info['.SOLVENTNAME']);
  maybeAdd(
    metadata,
    'pulse',
    info['.PULSESEQUENCE'] || info['.PULPROG'] || info['$PULPROG']
  );
  maybeAdd(metadata, 'experiment', getSpectrumType(metadata, info));
  maybeAdd(metadata, 'temperature', parseFloat(info['$TE'] || info['.TE']));
  maybeAdd(metadata, 'frequency', parseFloat(info['.OBSERVEFREQUENCY']));
  maybeAdd(metadata, 'type', info['DATATYPE']);
  maybeAdd(metadata, 'probe', info['$PROBHD']);
  if (info['$FNTYPE'] !== undefined) {
    maybeAdd(metadata, 'acquisitionMode', parseInt(info['$FNTYPE']));
  }
  maybeAdd(metadata, 'expno', parseInt(info['$EXPNO']));
  if (metadata.type) {
    if (metadata.type.toUpperCase().indexOf('FID') >= 0) metadata.isFid = true;
    else if (metadata.type.toUpperCase().indexOf('SPECTRUM') >= 0) {
      metadata.isFt = true;
    }
  }

  if (metadata.dimension === 1) {
    const nucleus = info['.OBSERVENUCLEUS'];
    if (nucleus) {
      metadata.nucleus = [nucleus.replace(/[^A-Za-z0-9]/g, '')];
    }
  } else {
    const nucleus = info['.NUCLEUS'];
    if (nucleus) {
      metadata.nucleus = nucleus.split(',').map(nuc => nuc.trim());
    }
  }
  if (metadata.nucleus.length === 0) {
    metadata.nucleus = exports.getNucleusFrom2DExperiment(metadata.experiment);
  }

  if (info['$DATE']) {
    metadata.date = new Date(info['$DATE'] * 1000).toISOString();
  }

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
    if (options.removeImpurities && metadata.solvent)
      rangesOptions.removeImpurity = { solvent: metadata.solvent };
    const spectrum = SD.NMR.fromJcamp(jcampString);
    const ranges = spectrum.getRanges(rangesOptions);
    ranges.forEach(function(range) {
      // todo remove when there is an option to avoid that
      delete range._highlight;
      delete range.signalID;
      range.signal.forEach(function(signal) {
        delete signal.peak;
      });
    });
    metadata.range = ranges;
  }

  return metadata;
};

/**
 * Returns a list of nuclei based on an experiment string
 * @param {string} experiment
 * @return {string[]}
 */
exports.getNucleusFrom2DExperiment = function(experiment) {
  if (typeof experiment !== 'string') {
    return [];
  }
  experiment = experiment.toLowerCase();
  if (experiment.includes('jres')) {
    return ['1H'];
  }
  if (experiment.includes('hmbc') || experiment.includes('hsqc')) {
    return ['1H', '13C'];
  }
  return ['1H', '1H'];
};

exports.getSpectrumType = getSpectrumType;

function maybeAdd(obj, name, value) {
  if (value !== undefined) {
    if (typeof value === 'string') {
      if (value.startsWith('<') && value.endsWith('>')) {
        value = value.substring(1, value.length - 2);
      }
      obj[name] = value.trim();
    } else {
      obj[name] = value;
    }
  }
}
