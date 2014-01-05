require 'es5-shim'
require 'es5-shim/es5-sham'

hifive = require 'hifive'
tap = require 'hifive-tap'
specs = require './specs'

(hifive.run specs, tap!).then (r) -> if r.failed.length => process?.exit 1
