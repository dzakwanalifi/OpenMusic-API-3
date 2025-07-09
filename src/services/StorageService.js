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
      // Handle stream format
      if (file.pipe && typeof file.pipe === 'function') {
        const fileStream = fs.createWriteStream(filePath);
        fileStream.on('error', (error) => reject(error));
        file.pipe(fileStream);
        file.on('end', () => resolve(filename));
      } 
      // Handle data format (Buffer)
      else if (Buffer.isBuffer(file)) {
        fs.writeFile(filePath, file, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve(filename);
          }
        });
      }
      // Handle string data
      else if (typeof file === 'string') {
        fs.writeFile(filePath, file, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve(filename);
          }
        });
      }
      else {
        reject(new Error('Unsupported file format'));
      }
    });
  }
}

module.exports = StorageService;
