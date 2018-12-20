'use strict';

const nmrMetadata = require('..');
const FS = require('fs');

function read(file) {
  return FS.readFileSync(__dirname + '/data/' + file, 'utf8');
}

describe('getType', function() {
  it('should be FID', function() {
    const metadata = nmrMetadata.parseJcamp(read('fid.dx'));
    metadata['type'].should.eql('NMR FID');
    metadata.isFid.should.eql(true);
    metadata.isFt.should.eql(false);
  });

  it('should be FT', function() {
    const metadata = nmrMetadata.parseJcamp(read('ft.dx'));
    metadata['type'].should.eql('NMR SPECTRUM');
    metadata.isFid.should.eql(false);
    metadata.isFt.should.eql(true);
  });

  it('should parse test2 without infinite loop', function() {
    const metadata = nmrMetadata.parseJcamp(read('test2.jdx'), {
      computeRanges: true
    });
    metadata['type'].should.eql('NMR SPECTRUM');
    metadata.isFid.should.eql(false);
    metadata.isFt.should.eql(true);
    metadata.expno.should.eql(1);
    metadata.experiment.should.eql('proton');
  });

  it('should parse test3 without infinite loop', function() {
    const metadata = nmrMetadata.parseJcamp(read('test3.jdx'), {
      computeRanges: true
    });
    metadata['type'].should.eql('NMR SPECTRUM');
    metadata.isFid.should.eql(false);
    metadata.isFt.should.eql(true);
  });

  it('should compute ranges', function() {
    const metadata = nmrMetadata.parseJcamp(read('ft-data.jdx'), {
      computeRanges: true,
      ranges: { nH: 10 }
    });
    metadata.range.should.be.an.Array().with.a.lengthOf(4);
    metadata.range[0].should.have.properties([
      'from',
      'to',
      'integral',
      'signal'
    ]);
    metadata.range[0].signal.should.be.an.Array();
    metadata.range[0].signal[0].should.have.properties([
      'delta',
      'diaID',
      'multiplicity'
    ]);
  });

  it('should be mestrec', function() {
    const metadata = nmrMetadata.parseJcamp(read('mestrec.jcamp'));
    metadata.type.should.eql('NMRSPECTRUM');
    metadata.isFid.should.eql(false);
    metadata.isFt.should.eql(true);
    metadata.solvent.should.eql('MeOD');
    metadata.frequency.should.eql(400.1318406);
  });
});
