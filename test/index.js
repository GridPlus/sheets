const moment = require('moment');
const Sheets = require('../');

require('should');

describe('sheets', function () {

  const sheets = new Sheets();

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

});

describe('sheet', function () {

  describe('createRow', function () {

    it('should create a new row for data provided', function (done) {

      this.timeout(10000);

      const sheets = new Sheets();
      const googleSheetId = '1Qa5U9ZHFZlAcZwdNno0ClAcYOS-h3dKSeSHuzzrb-jQ';
      const googleSheetName = 'automatedimportsheettest';

      sheets.getSheet(googleSheetId, (err, sheet) => {
        if (err) return done(err);

        const updateddatetime = new Date();

        const input = {
          email: `test-user${Math.random().toString().substr(2, 10)}@unittest.org`,
          firstname: 'unit',
          middlename: 'to-tha-mutha-truckin',
          lastname: 'test',
         updateddatetime

        };

        sheet.createRow(googleSheetName, input, (err, result) => {
          if (err) return done(err);

          result.should.have.property('email', input.email);
          result.should.have.property('firstname', input.firstname);
          result.should.have.property('middlename', input.middlename);
          result.should.have.property('lastname', input.lastname);
          result.should.have.property('updateddatetime', input.updateddatetime.toString());

          sheet.getWorksheet(googleSheetName, (err, worksheet) => {
            if (err) return done(err);

            worksheet.getRows((err, rows) => {
              if (err) return done(err);

              const match = rows.filter((row) => {
                return row.email === input.email;
              });

              match.should.have.property('length', 1);

              done();
            });

          });

        });

      });

    });

  });

  describe('updateRow', function () {

    it('should create a new row and update with data provided', function (done) {

      this.timeout(15000);

      const sheets = new Sheets();
      const googleSheetId = '1Qa5U9ZHFZlAcZwdNno0ClAcYOS-h3dKSeSHuzzrb-jQ';
      const googleSheetName = 'automatedimportsheettest';

      sheets.getSheet(googleSheetId, (err, sheet) => {
        if (err) return done(err);

        sheet.getWorksheet(googleSheetName, (err, worksheet) => {
          if (err) return done(err);

          const updateddatetime = new Date();

          const input = {
            email: `test-user${Math.random().toString().substr(2, 10)}@unittest.org`,
            firstname: 'unit',
            middlename: 'to-tha-mutha-truckin',
            lastname: 'test',
           updateddatetime
          };

          sheet.createRow(googleSheetName, input, (err, result) => {
            if (err) return done(err);

            worksheet.getRows((err, rows) => {
              if (err) return done(err);

              const someUniqueRow = rows.filter((row) => {
                return row.email === input.email;
              })[0];

              const query = (row) => {
                return row.email === input.email;
              };

              let update = { readyfordocuments: 'Y' };

              worksheet.updateRows(query, update, (err, rows) => {
                if (err) return cb(err);

                update = { sentdocumentsdate: moment(new Date()).format('MM/D/YY h:mm:ss a') };

                worksheet.updateRows(query, update, (err, rows) => {
                  if (err) return cb(err);

                  const query = (row) => {
                    return row.uniqueid === someUniqueRow.uniqueid;
                  };
                  const update = {
                    sentdocumentsdate: moment(new Date()).format('MM/D/YY h:mm:ss a')
                  };

                  worksheet.updateRows(query, update, (err, rows) => {
                    if (err) return cb(err);

                    done();

                  });

                });

              });

            });

          });
        })
      });

    });

  });

});