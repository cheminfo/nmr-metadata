const getSpectrumType = require('./getSpectrumType');
const getNucleusFrom2DExperiment = require('./getNucleusFrom2DExperiment');

function getMetadata(parsedJcamp) {
  const metadata = {
    dimension: parsedJcamp.twoD ? 2 : 1,
    nucleus: [],
    isFid: false,
    isFt: false
  };

  const info = parsedJcamp.info;
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
    metadata.nucleus = getNucleusFrom2DExperiment(metadata.experiment);
  }

  if (info['$DATE']) {
    metadata.date = new Date(info['$DATE'] * 1000).toISOString();
  }
  return metadata;
}

module.exports = getMetadata;

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
