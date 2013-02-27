## Module property #####################################################
#
# Defines how to generate and test properties.
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

valid-p = (args, prop) -->
  prop.implications.some (f) -> f ...args

classify = (args, prop) -->
  prop.classifiers.map (f) -> f ...args

verify = (args, prop) -->
  prop.invariant ...args

invalidate = (args, prop) -->
  make-result args, [], null

succeed = (args, prop) -->
  make-result args, (classify args, prop), (verify args, prop)

apply-property = (args, prop) -->
  | valid-p args, prop => succeed args, prop
  | otherwise          => invalidate args, prop

make-result = (args, labels, ok) -->
  ok        : ok
  labels    : labels
  arguments : args

Property = Base.derive {
  init: (args) ->
    @arguments    = args or []
    @classifiers  = []
    @implications = []

  invariant: -> null
    
  satisfy:  (f) -> @derive { invariant: f }

  classify: (f) -> @derive { classifiers: @classifiers ++ [f] }

  given:    (f) -> @derive { implications: @implications ++ [f] }

  run: -> apply-property (@arguments.map (f) -> f!), this
}

for-all = (...as) -> Property.make as



### -- Exports ---------------------------------------------------------
module.exports = { Property, for-all }
