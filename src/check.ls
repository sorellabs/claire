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

{ Base } = require 'boo'


TestResult = Base.derive {
  init: (@property) ->
    @passed  = []
    @failed  = []
    @ignored = []
    @all     = []
    @labels  = {}
    @veredic = null


  add: (data) ->
    @all.push data
    data.labels.map (a) ~> @labels.[]"#{JSON.stringify a}".push data
    switch status data
    | \passed  => @passed.push data
    | \failed  => @failed.push data
    | \ignored => @ignored.push data

  to-string: ->
    """
    #{@veredict}
    """

}

status = (result) ->
  | result.ok is true  => \passed
  | result.ok is false => \failed
  | otherwise          => \ignored

failed-p = (result) -> result.ok is false


check = (max, property) -->
  result     = TestResult.make property
  ignored    = 0
  should-run = true
  while max and should-run
    claim-data = property.run!
    result.add claim-data

    switch status claim-data
    | \passed  => --max
    | \failed  => should-run = false
    | \ignored => if ++ignored > 1000 => should-run = false

  result.veredict = | ignored > 1000 => \abandoned
                    | max > 0        => \failed
                    | otherwise      => \passed
  


### -- Exports ---------------------------------------------------------
module.exports = { check }
