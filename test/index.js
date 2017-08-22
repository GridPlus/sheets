const Sheets = require('../');

require('should');

describe('sheets', function () {

  const sheets = new Sheets({
    googleSheetId: '1Qa5U9ZHFZlAcZwdNno0ClAcYOS-h3dKSeSHuzzrb-jQ',
    googleSheetName: 'automatedimportsheettest',
  });

  describe('getCredentials', function () {

    it('should get credentials from the supplied service-account-creds.json file', function (done) {

      sheets.getCredentials((err, credentials) => {
        if (err) return done(err);

        credentials.should.have.property('type', 'service_account');
        credentials.should.have.property('project_id', 'gridplus-token-launch');

        done();

      });

    });

  });

  describe('createRow', function () {
    
    it('should create a new row for data provided', function (done) {

      const updateddatetime = new Date();

      const input = {
        email: `test-user${Math.random().toString().substr(2, 10)}@unittest.org`, 
        firstname: 'unit',
        middlename: 'to-tha-mutha-truckin',
        lastname: 'test',
       updateddatetime 

      };

      sheets.createRow(input, (err, result) => {
        if (err) return done(err);

        result.should.have.property('email', input.email);
        result.should.have.property('firstname', input.firstname);
        result.should.have.property('middlename', input.middlename);
        result.should.have.property('lastname', input.lastname);
        result.should.have.property('updateddatetime', input.updateddatetime.toString());

        done();

      });

    });

  });

});