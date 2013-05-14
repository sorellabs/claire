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


### -- Aliases ---------------------------------------------------------
floor = Math.floor


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
# :: Number -> a -> Generator a -> a
# :: Number -> (a -> b) -> Generator b -> b
compute = (size, a, gen) ->
  | callable-p a => a (size ? gen.size)
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
# :: Number -> Generator a -> a
value = (n, ctx, gen) --> ((as-generator gen).next.call ctx, n).value


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
  # :: Number -> Value a
  next: (n) -> ...

  ##### λ shrink
  # Continually shrinks a value into the most minimal case within the
  # context of this generator.
  #
  # :: a -> [a]
  shrink: (a) -> ...

  ##### λ then
  # Monadic bind: shoves a value from a monad into a monad-returning function.
  #
  # :: (a -> Generator b) -> Generator b
  then: (f) -> bind this, f

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
                        next: (n) -> make-value (compute n, a, this), this
                      }


##### λ bind
# Monadic bind for generators
#
# :: Generator a -> (a -> Generator b) -> Generator b
bind = (gen, f) -> do
                   Generator.derive {
                     next: (n) -> do
                                  v = value n, this, (as-generator gen)
                                  r = value n, this, (as-generator (f v))
                                  make-value r, this
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
                      next: (n) -> do
                                   gen = as-generator (pick-one as)
                                   make-value (value n, this, gen), gen
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
                        to-string: -> "<Sequence (#{as.map as-generator})>"
                        next: (n) -> make-value (as.map (value n, this)), this
                      }


#### λ sized
# Constructs a new `Generator` with a new complexity `size` hint.
#
# :: (Number -> Number) -> Generator a -> Generator b
sized = (f, gen) --> do
                     g = as-generator gen
                     g.derive { next: (n) -> g.next (f n) }


#### λ recursive
# Constructs a new `Generator` that takes a function or recursive
# generator, and halves the size at each recursive invocation.
#
# The function is late bound, so you can use it for direct and indirect
# recursive generators easily :3
#
# :: (Number -> Generator a) -> Generator b
# :: Generator a -> Generator b
recursive = (gen) -> do
                     Generator.derive {
                       to-string: -> "<Recursive>"
                       next: (n) -> do
                                    n := floor ((n ? @size) / 2)
                                    g  = compute n, gen, this
                                    make-value (value n, this, g), this
                     }


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
transform = (f, gen) --> do
                         g = as-generator gen
                         g.derive {
                           next: (n) -> make-value (f (value n, this, g)), this
                         }


#### λ repeat
# Constructs a new `Generator` that repeats a given `Generator`.
#
# :: Generator a -> Generator b
repeat = (gen) -> do
                  gen := as-generator gen
                  gen.derive {
                    to-string: -> "<Repeat #{gen}>"
                    next: (n) -> do
                                 size  = n ? @size
                                 range = [1 to (choose-int 0, size)]
                                 make-value (range.map ~> value size, this, gen), this
                  }




### -- Exports ---------------------------------------------------------
module.exports = {
  make-value
  value

  Generator
  
  as-generator
  bind
  choice
  frequency
  sequence
  sized
  recursive
  label
  transform
  repeat
}
