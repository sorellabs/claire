## Module generating ###################################################
#
# The basis for generating *everything*.
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
{ Base, derive }          = require 'boo'
{ concat-map, replicate } = require 'prelude-ls'
{ pick-one, choose-int }  = require './random'


### -- Interfaces ------------------------------------------------------

#### type Value a
# :: { "generator" -> Generator a
# .. ; "value"     -> a }



### -- Helpers ---------------------------------------------------------

#### λ callable-p
# :internal:
# Checks if something is callable.
#
# :: a -> Bool
callable-p = (a) -> typeof a is 'function'


#### λ generator-p
# :internal:
# Checks if something is a `Generator`
#
# :: a -> Bool
generator-p = (a) -> 'next' of (Object a)


#### λ compute
# :internal:
# Computes a value lifted to a `Generator`.
#
# :: a -> Generator a -> a
# :: (a -> b) -> Generator b -> b
compute = (a, gen) ->
  | callable-p a => a gen.size
  | otherwise    => a


### -- Working with Values ---------------------------------------------

#### λ make-value
# Constructs a `Value` type.
#
# :: a -> Generator a -> Value a
make-value = (value, gen) -->
  generator : gen
  value     : value

#### λ value
# Executes a `Generator` and extracts the generated value.
#
# :: Generator a -> a
value = (gen) -> (as-generator gen).next!value


### -- Core implementation ---------------------------------------------

#### {} Generator
# The base generator logic.
#
# :: Base <| Generator a
Generator = Base.derive {

  ##### Data size
  # A hint for controlling the generated value's complexity.
  #
  # :: Number
  size: 100

  ##### λ next
  # Generates a new random value.
  #
  # :: () -> Value a
  next: -> ...

  ##### λ shrink
  # Continually shrinks a value into the most minimal case within the
  # context of this generator.
  #
  # :: a -> [a]
  shrink: (a) -> ...

  ##### λ to-string
  # Returns a friendly representation of this generator.
  #
  # By convention (of this library), the friendly names are surrounded
  # by angular brackets to identify them as generators easily.
  #  
  # :: () -> String
  to-string: -> '<Generator>'
}


### -- Combinators for constructing Generators -------------------------

#### λ as-generator
# Lifts a regular value to a `Generator`.
#
# This is used by all combinators to allow users to pass regular values
# as if they were proper `Generators`, making the API cleaner.
#
# :: Generator a -> Generator a
as-generator = (a) -> 
  | generator-p a  => a
  | otherwise      => do
                      Generator.derive {
                        to-string: -> "<#a>"
                        next: -> make-value (compute a, this), this
                      }


#### λ choice
# Alternatively generate values from one of the given generators at
# random.
# 
# The values generated from `choice` generators are uniformly
# distributed. You can use the `frequency` generator for weighted random
# choices.
# 
# :: Generator a... -> Generator b
choice = (...as) -> do
                    Generator.derive {
                      to-string: -> "<Choice (#{as})>"
                      next: -> do
                               gen = pick-one as
                               make-value (value gen), (as-generator gen)
                    }


#### λ frequency
# Constructs a new `Generator` that alternatively chooses between one of
# the given `Generator`s using a weighted random selection.
#
# :: (Number, Generator a)... -> Generator b
frequency = (...as) -> do
                       gs = concat-map (([w,g]) -> replicate w, g), as
                       representation = ([w, g]) -> w + ':' + g

                       (choice ...gs).derive {
                         to-string: -> "<Frequency (#{as.map representation}>"
                       }


#### λ sequence
# Constructs a new `Generator` that yields the combination of several
# `Generator`s.
#
# :: Generator a... -> Generator b
sequence = (...as) -> do
                      Generator.derive {
                        to-string: -> "<Sequence (#{gs})>"
                        next: -> make-value (as.map values), this
                      }


#### λ sized
# Constructs a new `Generator` with a new complexity `size` hint.
#
# :: Number -> Generator a -> Generator b
sized = (n, gen) --> (as-generator gen).derive { size: n }


#### λ label
# Constructs a new, custom labelled, `Generator`.
#
# :: String -> Generator a -> Generator a
label = (name, gen) --> (as-generator gen).derive { to-string: -> "<#name>" }


#### λ transform
# Constructs a new `Generator` that transforms the value of another
# `Generator`.
#
# :: (a -> b) -> Generator a -> Generator b
transform = (gen) -> do
                     g = as-generator gen
                     g.derive {
                       next: -> make-value (value g), this
                     }


#### λ repeat
# Constructs a new `Generator` that repeats a given `Generator`.
#
# :: Generator a -> Generator b
repeat = (gen) -> do
                  gen := as-generator gen
                  gen.derive {
                    to-string: -> "<Repeat #{gen}>"
                    next: -> do
                             range  = [1 to (choose-int 0, @size)]
                             make-value (range.map value), this
                  }




### -- Exports ---------------------------------------------------------
module.exports = {
  make-value
  value

  Generator
  
  as-generator
  choice
  frequency
  sequence
  size
  label
  transform
  repeat
}
