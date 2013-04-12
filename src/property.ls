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


### -- Dependencies ----------------------------------------------------
{ Base } = require 'boo'
{ test } = require './check'


### -- Aliases ---------------------------------------------------------
frozen = Object.freeze

### -- Helpers ---------------------------------------------------------

#### λ values
# Extracts the values from a list of generated arguments
# :: [Value a] -> [a]
values = (.map (.value))

#### λ valid-p
# Checks if a property is valid for the given arguments.
# :: [a] -> Property -> Bool
valid-p = (args, prop) -->
  | prop.implications.length is 0 => true
  | otherwise                     => prop.implications.some (f) -> f ...(values args)


#### λ classify
# Yields a list of classifications for the given arguments.
# :: [a] -> Property -> [String]
classify = (args, prop) -->
  (prop.classifiers.map (f) -> f ...(values args)).filter (!~= null)


#### λ verify
# Verifies if the property's invariant's hold for the arguments.
# :: [a] -> Property -> Bool
verify = (args, prop) -->
  try
    !!(prop.invariant ...(values args))
  catch e
    e

#### λ invalidate
# Invalidates the property for the given arguments (they're not valid).
# :: [a] -> Property -> Result
invalidate = (args, prop) -->
  make-result args, [], null


#### λ apply-property
# Applies a property to some arguments.
# :: [a] -> Property -> Result
apply-property = (args, prop) -->
  | valid-p args, prop => make-result args, (classify args, prop), (verify args, prop)
  | otherwise          => invalidate args, prop

#### λ make-result
# Constructs a Result object.
# :: [a] -> [String] -> Maybe Bool -> Result
make-result = (args, labels, ok) -->
  ok        : ok
  labels    : labels
  arguments : args

### -- Core implementation ---------------------------------------------

#### {} Property
# Represents a property that can be verified against a list of randomly
# generated arguments.
#
# :: Base <| Property
Property = Base.derive {
  ##### λ init
  # Initialises a Property instance's for the first time.
  # :: @this:Property => [Gen a] -> this*
  init: (args) ->
    @arguments    = frozen args or []
    @classifiers  = frozen []
    @implications = frozen []
    this

  ##### λ invariant
  # The invariant that should hold for this property.
  # :: (a... -> Bool) -> Bool
  invariant: -> ...
    
  ##### λ satisfy
  # Yields a new property with the given invariant.
  # :: @Property => (a... -> Bool) -> Property
  satisfy:  (f) -> @derive { invariant: f }

  ##### λ classify
  # Yields a new property that provides additional classification for
  # the arguments.
  # :: @Property => (a... -> Maybe b) -> Property
  classify: (f) -> @derive { classifiers: @classifiers ++ [f] }

  ##### λ given
  # Yields a new property that only holds when additional implications
  # hold for the generated arguments.
  # :: @Property => (a... -> Bool) -> Property
  given:    (f) -> @derive { implications: @implications ++ [f] }

  ##### λ run
  # Returns the `Result` of applying the property to randomly generated
  # arguments once.
  # :: @Property => () -> Result
  run: -> apply-property (@arguments.map (g) -> g.next!), this

  ##### λ as-test
  # Returns a function that can be given for a test runner to verify
  # this property.
  # :: @Property => Config? -> () -> ()
  as-test: (config) -> ~> test config, this    
}


#### λ for-all
# Sugar for constructing a new `Property` for a series of given argument
# specifications.
# :: Gen a... -> Property
for-all = (...as) -> Property.make as



### -- Exports ---------------------------------------------------------
exports <<< { Property, for-all }
