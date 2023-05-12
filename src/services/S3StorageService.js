const AWS = require('aws-sdk');
const config = require('../utils/config');

class S3StorageService {
  constructor() {
    this._S3 = new AWS.S3({ region: 'ap-southeast-3' });
  }

  writeFile(file, meta) {
    const parameter = {
      Bucket: config.s3.bucketName,
      Key: +new Date() + meta.filename,
      Body: file._data, // File
      ContentType: meta.headers['content-type'], // MIME Type of the file
    };

    return new Promise((resolve, reject) => {
      this._S3.upload(parameter, (error, data) => {
        if (error) {
          return reject(error);
        }
        return resolve(data.Location);
      });
    });
  }
}

module.exports = S3StorageService;
