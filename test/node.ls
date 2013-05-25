brofist = require 'brofist'
tap = require 'brofist-minimal'
specs = require './specs'

(brofist.run specs, tap!).then (r) -> if r.failed.length => process?.exit 1
