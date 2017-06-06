/* This file can be required from anywhere in project by writing:
  require('config')
*/

const path = require('path');

module.exports = {
  rootPath: path.join(__dirname, '..'),
  secretModule: require('../secret.js'),
};
