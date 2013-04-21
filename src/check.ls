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
make-error                       = require 'flaw'
{ Base }                         = require 'boo'
{ values, reduce, sort-by, map } = require 'prelude-ls'


### -- Aliases ---------------------------------------------------------
frozen  = Object.freeze
keys    = Object.keys
{round} = Math


### -- Default configuration -------------------------------------------
default-config = do
                 times   : 100
                 verbose : false
  

### -- Error handling --------------------------------------------------

#### λ EFailure
# :internal:
# Constructs a Failure error for a property.
# 
# :: Report -> Error
EFailure = make-error '<property failed>'

#### λ EAbandoned
# :internal:
# Constructs an Abandoned error for a property.
#
# :: Report -> Error
EAbandoned = make-error '<property abandoned>'


### -- General helpers -------------------------------------------------

#### λ percentage
# :internal:
# Computes the percentage of some N wrt some Total.
#
# :: Number, Number -> Number
percentage = (num, total) -> round (num / total) * 100

#### λ with-defaults
# :internal:
# Yields a new configuration that provides the default configuration as
# fallback.
#
# :: { String -> a } -> { String -> a }
with-defaults = (config = {}) -> ({} <<< default-config) <<< config


### -- Helpers for handling Results ------------------------------------

#### λ status
# :internal:
# Retrieves a normalised Status tag for the Result.
#
# :: Result -> ResultStatus
status = (result) -> result.kind or \rejected


#### λ failed-p
# :internal:
# Checks if a Result failed.
#
# :: Result -> Bool
failed-p = (result) -> (status result) in <[ failed rejected ]>


### -- Helpers for presenting a Report ---------------------------------

#### λ describe-verdict
# :internal:
# Provides a human-readable verdict of a test report.
#
# :: Report -> String
describe-verdict = (report) ->
  passed      = report.passed.length
  failed      = report.failed.length
  all         = report.all.length
  ignored     = report.ignored.length

  switch report.verdict
  | \passed    => "+ OK passed #{passed} tests."
  | \failed    => "! Falsified after #{all - ignored} tests, #{failed} failed."
  | \abandoned => "? Aborted after #{all} tests."
  | otherwise  => "/ Unknown verdict. Likely this test report lacks any data."


#### λ describe-ignored
# :internal:
# Provides a human-readable description of the ignored tests, if they're
# above a certain non-trivial threshold (50%).
#
# :: Report -> String
describe-ignored = (report) ->
  ignored = report.ignored.length
  ignored-pct = percentage ignored, report.all.length

  if ignored-pct > 50 => "#ignored (#{ignored-pct}%) tests ignored."
  else                => ''


#### λ label-histogram
# :internal:
# Provides a human-readable histogram of the various classifications
# provided for the test data.
#
# :: Report -> String
label-histogram = (report) ->
  total  = report.all.length
  labels = [[(percentage v.length, total), k] for k, v of report.labels]
           |> sort-by (x, y) -> x < y
           |> map ([p, key]) -> "o #{p}% - #{key}"

  if labels.length => "> Collected test data:\n    #{labels.join '\n    '}"
  else             => ''


#### λ describe-failures
# :internal:
# Provides a human-readable description of the failures that happened.
#
# :: Report -> String
describe-failures = (report) ->
  label = (as) -> 
    | as.length => "» The following labels were provided: #{JSON.stringify as}"
    | otherwise => ''

  error-for = (kind, e) ->
    | kind is \failed  => "» Threw #{e?.stack or e}\n"
    | otherwise        => ''
   
  arg = (a, n) -> "  #n - #{JSON.stringify a.value} (#{a.generator})"

  rejection-for = (kind, e) ->
    if kind != \rejected => ''
    else                 => "» Reason: #{JSON.stringify e.value}\n"

  errors = report.failed.map (a, n) -> """
  : Failure \##{n + 1} -----------------------------------------------------------
    #{rejection-for a.kind, a}
    #{label a.labels}
    #{error-for a.kind, a.value}
    » The following arguments were provided:
    #{a.arguments.map arg .join '\n  '}
  """
  switch
  | errors.join '' .trim! => errors.join '\n---\n'
  | otherwise             => ''


#### λ describe-report
# :internal:
# Describes the report in the log if it's important to do so.
#
# :: Bool -> Report -> IO ()
describe-report = (verbose, report) -->
  text        = (("#report".split /\n/).map (s) -> "  #s").join '\n'
  total       = report.all.length
  ignored     = report.ignored.length
  ignored-pct = percentage ignored, total
  has-labels  = !!(keys report.labels).length

  if verbose or (ignored-pct > 50) or has-labels => console?.log text




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
    @verdict  = null


  ##### λ add
  # Adds a single test result to the Report.
  #
  # :: @this:Report* => Result -> ()
  add: (result) ->
    @all.push result
    result.labels.map (a) ~> @labels.[]"#a".push result
    switch status result
    | \held     => @passed.push result
    | \failed   => @failed.push result
    | \rejected => @failed.push result
    | \ignored  => @ignored.push result

  ##### λ to-string
  # Provides a human-readable presentation of this Report.
  #
  # :: @this:Report* => () -> String
  to-string: ->
    """
    #{describe-verdict this} #{describe-ignored this}
    #{label-histogram this}
    #{describe-failures this}
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
    | \held     => --max
    | \rejected => should-run = false
    | \failed   => should-run = false
    | \ignored  => if ++ignored > 1000 => should-run = false

  report.verdict = | ignored > 1000 => \abandoned
                   | max > 0        => \failed
                   | otherwise      => \passed
  frozen report
  

#### λ test
# Tests a property in a way that conforms with the standard API for test
# runners.
#
# :: Config -> Property -> () -> IO ()
test = (config, property) --> do
                              c      = with-defaults config
                              report = check c.times, property
                              switch report.verdict
                              | \passed    => describe-report c.verbose, report
                              | \failed    => throw EFailure report
                              | \abandoned => throw EAbandoned report
                              



### -- Exports ---------------------------------------------------------
module.exports = { check, test, Report }
