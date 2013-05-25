require 'es5-shim'
require 'es5-shim/es5-sham'

brofist = require 'brofist'
tap = require 'brofist-tap'
specs = require './specs'

(brofist.run specs, tap!).then (r) -> if r.failed.length => process?.exit 1
