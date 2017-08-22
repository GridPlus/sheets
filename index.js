const debug = require('debug')('gridplus:sheets');
const GoogleSpreadsheet = require('google-spreadsheet');
const fs = require('fs');
const path = require('path');

class Sheets {

  constructor (options) {
    this.credentialFilePath = options.credentialFilePath || path.join(process.cwd(), '.credentials', 'service-account-creds.json');
    
    this.googleSheetId = options.googleSheetId;
    this.googleSheetName = options.googleSheetName;

    this.doc = new GoogleSpreadsheet(options.googleSheetId);
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

  createRow (data, cb) {
    
    debug('getting google sheets credentials');
    
    this.getCredentials((err, credentials) => {
      if (err) return cb(err);
    
      debug('get service account auth token');
    
      this.doc.useServiceAccountAuth(credentials, (err) => {
        if (err) return cb(err);
    
        debug('getting google sheet info');
    
        this.doc.getInfo((err, info) => {
          if (err) return cb(err);
    
          const automatedimportsheet = info.worksheets.filter((sheet) => {
            return sheet.title === this.googleSheetName;
          })[0];
    
          automatedimportsheet.addRow(data, cb);        
  
        });
  
      });
  
    });
  
  }

}

module.exports = Sheets;