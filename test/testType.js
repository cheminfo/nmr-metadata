'use strict';

const nmrMetadata = require('..');
const FS = require('fs');


describe('getType', function () {
    it('should be FID', function () {
        const metadata = nmrMetadata.parseJcamp(FS.readFileSync(__dirname + "/fid.dx").toString());
        metadata['type'].should.eql('NMR FID');
        metadata.isFid.should.eql(true);
        metadata.isFt.should.eql(false);
    });

    it('should be FT', function () {
        const metadata = nmrMetadata.parseJcamp(FS.readFileSync(__dirname + "/ft.dx").toString());
        metadata['type'].should.eql('NMR SPECTRUM');
        metadata.isFid.should.eql(false);
        metadata.isFt.should.eql(true);
    });
});
