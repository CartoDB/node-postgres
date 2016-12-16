var ConnectionParameters = require(__dirname + '/../lib/connection-parameters');
var config = new ConnectionParameters(process.argv[2]);
var semver = require('semver')

for(var i = 0; i < process.argv.length; i++) {
  switch(process.argv[i].toLowerCase()) {
  case 'native':
    if (semver.gte(process.version, '4.0.0')) {
      console.log('Not running native in node < v4.0.0')
      config.native = true;
    }
    break;
  case 'binary':
    config.binary = true;
    break;
  case 'down':
    config.down = true;
    break;
  default:
    break;
  }
}

if(process.env['PG_TEST_NATIVE']) {
  config.native = true;
}

module.exports = config;
