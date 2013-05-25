(function(){
  var brofist, tap, specs;
  brofist = require('brofist');
  tap = require('brofist-minimal');
  specs = require('./specs');
  brofist.run(specs, tap()).then(function(r){
    if (r.failed.length) {
      return typeof process != 'undefined' && process !== null ? process.exit(1) : void 8;
    }
  });
}).call(this);
