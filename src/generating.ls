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

{ pick-one, choose-int } = require './random'
{ Base, derive } = require 'boo'
{ concat-map, replicate } = require 'prelude-ls'

id = (a) -> a

make-value = (value, gen) -->
  generator : gen
  value     : value

callable-p = (a) -> typeof a is 'function'

compute = (a, gen) ->
  | callable-p a => a gen.size
  | otherwise    => a

Generator = Base.derive {
  size: 100
  
  next: -> ...

  shrink: (a) -> ...

  to-string: -> '<Generator>'
}

as-generator = (a, label) -> 
  | 'next' of (Object a) => a
  | otherwise            => do
                            Generator.derive {
                              next: -> make-value (compute a, this), this
                              to-string: -> "<#{label or a}>"
                            }

choice = (...as) -> do
                    as := as.map as-generator
                    Generator.derive {
                      next: ->
                        gen = pick-one as
                        make-value gen.next!.value, gen

                      to-string: -> "<Choice (#{as})>"
                    }

sized = (n, gen) --> (as-generator gen).derive {
  size: n
}

repeat = (gen, reduce = id) -> do
                               gen := as-generator gen
                               gen.derive {
                                 next: ->
                                   range = [1 to (choose-int 0, @size)]
                                   xs    = reduce range.map (-> gen.next!value)
                                   make-value xs, this

                                 to-string: -> "<Repeat #{gen}>"
                               }

frequency = (...as) -> do
                       (choice (concat-map ([w, g]) -> replicate w, g)).derive {
                         to-string: ->
                           "<Frequency (#{as.map ([w,g]) -> w + ':' + g})>"
                       }

combine = (reduce, ...as) -> do
                             gs = as.map as-generator
                             Generator.derive {
                               next: ->
                                 xs = reduce (gs.map (g) -> g.next!value)
                                 make-value xs, this

                               to-string: ->
                                 "<Combine (#{gs})>"
                             }




### -- Exports ---------------------------------------------------------
module.exports = {
  Generator
  make-value
  as-generator
  choice
  sized
  repeat
  frequency
  combine
}
