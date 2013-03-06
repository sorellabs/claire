// Shims for the stuff we need

Object.create = Object.create
|| function(proto) {
     function K(){}
     K.prototype = proto
     return new K }

Object.freeze = Object.freeze
|| function(a){ return a }

Object.defineProperty = Object.defineProperty || function() {}

require('../../lib-test/data')
require('../../lib-test/generating')