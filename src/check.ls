## Module check ########################################################
#
# Tests if properties hold for N random value generations.
#
# 
# Copyright (c) 2013 Quildreen "Sorella" Motta <quildreen@gmail.com>
# 
# Permission is hereby granted, free of charge, to any person
# obtaining a copy of this software and associated documentation files
# (the "Software"), to deal in the Software without restriction,
# including without limitation the rights to use, copy, modify, merge,
# publish, distribute, sublicense, and/or sell copies of the Software,
# and to permit persons to whom the Software is furnished to do so,
# subject to the following conditions:
# 
# The above copyright notice and this permission notice shall be
# included in all copies or substantial portions of the Software.
# 
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
# MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
# NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
# LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
# OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
# WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

### -- Dependencies ----------------------------------------------------
{ Base }           = require 'boo'
{ values, reduce } = require 'prelude-ls'

### -- Aliases ---------------------------------------------------------
frozen  = Object.freeze
{round} = Math


### -- General helpers -------------------------------------------------

#### λ percentage
# :internal:
# Computes the percentage of some N wrt some Total.
#
# :: Number, Number -> Number
percentage = (num, total) -> round (num / total) * 100


### -- Helpers for handling Results ------------------------------------

#### λ status
# :internal:
# Retrieves a normalised Status tag for the Result.
#
# :: Result -> ResultStatus
status = (result) ->
  | result.ok is true  => \passed
  | result.ok is false => \failed
  | otherwise          => \ignored


#### λ failed-p
# :internal:
# Checks if a Result failed.
#
# :: Result -> Bool
failed-p = (result) -> result.ok is false


### -- Helpers for presenting a Report ---------------------------------

#### λ describe-veredict
# :internal:
# Provides a human-readable veredict of a test report.
#
# :: Report -> String
describe-veredict = (report) ->
  passed      = report.passed.length
  failed      = report.failed.length
  all         = report.all.length
  ignored     = report.ignored.length

  switch report.veredict
  | \passed    => "+ OK passed #{passed} tests."
  | \failed    => "! Falsified after #{all - ignored} tests, #{failed} failed."
  | \abandoned => "? Aborted after #{all} tests."
  | otherwise  => "/ Unknown veredict. Likely this test report lacks any data."


#### λ describe-ignored
# :internal:
# Provides a human-readable description of the ignored tests, if they're
# above a certain non-trivial threshold (50%).
#
# :: Report -> String
describe-ignored = (report) ->
  ignored = report.ignored.length
  ignored-pct = as-percentage ignored, report.all.length

  if ignored-pct > 50 => "#ignored (#{ignored-pct}%) tests ignored."
  else                => ''


#### λ label-histogram
# :internal:
# Provides a human-readable histogram of the various classifications
# provided for the test data.
#
# :: Report -> String
label-histogram = (report) ->
  total = report.all.length
  labels = ["o #{as-percentage v.length, total}% - #k" for k, v of report.labels]

  if labels.length => "> Collected test data:\n    #{labels.join '\n    '}"
  else             => ''


### -- Helper data structures ------------------------------------------

#### {} Report
# 
# Gathers meta-data from a property test and provides ways of displaying
# those data in an human-readable way.
#
# :: Base <| Report
Report = Base.derive {

  ##### λ init
  # Initialises a Report instance.
  #
  # :: @this:Report* => Property -> this
  init: (@property) ->
    @passed   = []
    @failed   = []
    @ignored  = []
    @all      = []
    @labels   = {}
    @veredict = null


  ##### λ add
  # Adds a single test result to the Report.
  #
  # :: @this:Report* => Result -> ()
  add: (result) !->
    @all.push result
    result.labels.map (a) ~> @labels.[]"#a".push result
    switch status result
    | \passed  => @passed.push result
    | \failed  => @failed.push result
    | \ignored => @ignored.push result

  ##### λ to-string
  # Provides a human-readable presentation of this Report.
  #
  # :: @this:Report* => () -> String
  to-string: ->
    """
    #{describe-veredict this} #{describe-ignored this}
    #{label-histogram this}
    """
}


### -- Checking properties ---------------------------------------------

#### λ check
# Runs a property repeatedly, until it holds more times than a given
# threshold.
#
# If the Property fails to hold for certain random inputs, or if the
# Property ignores too many of the inputs, the test fails immediately
# and a Report describing the failure is returned.
#
# :: Number -> Property -> Report
check = (max, property) -->
  report     = Report.make property
  ignored    = 0
  should-run = true
  while max and should-run
    result = property.run!
    report.add result

    switch status result
    | \passed  => --max
    | \failed  => should-run = false
    | \ignored => if ++ignored > 1000 => should-run = false

  report.veredict = | ignored > 1000 => \abandoned
                    | max > 0        => \failed
                    | otherwise      => \passed
  frozen report
  


### -- Exports ---------------------------------------------------------
module.exports = { check }
