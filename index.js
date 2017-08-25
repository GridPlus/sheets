const assign = require('lodash.assign');
const async = require('async');
const debug = require('debug')('gridplus:sheets');
const GoogleSpreadsheet = require('google-spreadsheet');
const fs = require('fs');
const path = require('path');
const pick = require('lodash.pick');
const readableId = require('readable-id');

class Sheets {

  constructor (options) {
    options = options || {};

    this.credentialFilePath = options.credentialFilePath || path.join(process.cwd(), '.credentials', 'service-account-creds.json');

  }

  getCredentials (cb) {

    fs.readFile(this.credentialFilePath, (err, data) => {
      if (err) return cb(err);

      var credentials = undefined;

      try {
        credentials = JSON.parse(data);
      } catch (err) {
        return cb(err);
      }

      return cb(null, credentials);
    });
  }

  getSheet (googleSheetId, cb) {

    this.getCredentials((err, credentials) => {
      if (err) return cb(err);

      debug('get service account auth token');

      var doc = new GoogleSpreadsheet(googleSheetId);

      cb(null, new Sheet(doc, this));

    });

  }

}

class Sheet {

  constructor (doc, sheets) {
    this.doc = doc;
    this.sheets = sheets;
  }

  authenticate (cb) {

    debug('getting google sheets credentials');

    this.sheets.getCredentials((err, credentials) => {
      if (err) return cb(err);

      debug('get service account auth token');

      this.doc.useServiceAccountAuth(credentials, (err) => {
        if (err) return cb(err);

        cb();

      });

    });

  }

  createRow (googleSheetName, data, cb) {

    this.authenticate((err) => {
      if (err) return cb(err);

      debug('getting google sheet info');

        this.doc.getInfo((err, info) => {
          if (err) return cb(err);

          const automatedimportsheet = info.worksheets.filter((sheet) => {
            return sheet.title === googleSheetName;
          })[0];

          data.uniqueid = readableId();

          automatedimportsheet.addRow(data, cb);

        });

      });

  }

  getWorksheet (googleSheetName, cb) {

    debug('getting google sheets credentials');

    this.sheets.getCredentials((err, credentials) => {
      if (err) return cb(err);

      debug('get service account auth token');

      this.doc.useServiceAccountAuth(credentials, (err) => {
        if (err) return cb(err);

        debug('getting google sheet info');

        this.doc.getInfo((err, info) => {
          if (err) return cb(err);

          const worksheet = info.worksheets.filter((sheet) => {
            return sheet.title === googleSheetName;
          })[0];

          return cb(null, new Worksheet(worksheet, this.sheets, this));

        });

      });

    });
  }

}

class Worksheet {
  constructor (worksheet, sheets, sheet) {
    this.worksheet = worksheet;
    this.sheets = sheets;
    this.sheet = sheet;
  }

  getRows (columns, cb) {
    if (typeof columns === 'function') {
      cb = columns;
      columns = undefined;
    }

    this.sheet.authenticate((err) => {
      if (err) return cb(err);

      if (columns === undefined) return this.worksheet.getRows(cb);

      debug(`getting rows for sheet`);

      this.worksheet.getRows((err, googleRows) => {
        if (err) return cb(err);
        const rows = googleRows.map(gr => {
          return pick(gr, columns.concat('id'));
        });
        cb(null, rows);
      });

    });

  }

  updateRows (query, update, cb) {
    this.worksheet.getRows((err, googleRows) => {
      if (err) return cb(err);
      // query
      const rows = googleRows.filter(query);
      // update
      async.forEach(rows, (row, cb) => {
        assign(row, update);
        row.save(cb);
      }, (err) => {
        if (err) return cb(erR);
        this.worksheet.getRows((err, googleRows) => {
          if (err) return cb(err);
          const rows = googleRows.filter(query);
          cb(null, rows);
        });
      });
    });
  }

}

module.exports = Sheets;