// src/services/StorageService.js
const fs = require('fs');
const path = require('path');

class StorageService {
  constructor(folder) {
    this._folder = folder;

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  }

  writeFile(file, meta) {
    const filename = +new Date() + meta.filename;
    const filePath = path.resolve(this._folder, filename);
    
    return new Promise((resolve, reject) => {
      if (Buffer.isBuffer(file)) {
        fs.writeFile(filePath, file, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve(filename);
          }
        });
      } else {
        const fileStream = fs.createWriteStream(filePath);
        fileStream.on('error', (error) => reject(error));
        fileStream.on('finish', () => resolve(filename));
        file.pipe(fileStream);
      }
    });
  }
}

module.exports = StorageService;
