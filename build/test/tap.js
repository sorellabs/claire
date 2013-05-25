(function(){
  var brofist, tap, specs;
  require('es5-shim');
  require('es5-shim/es5-sham');
  brofist = require('brofist');
  tap = require('brofist-tap');
  specs = require('./specs');
  brofist.run(specs, tap()).then(function(r){
    if (r.failed.length) {
      return typeof process != 'undefined' && process !== null ? process.exit(1) : void 8;
    }
  });
}).call(this);
