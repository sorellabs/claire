## Module data #########################################################
#
# Core data generators.
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
{ choose-int, choose } = require './random'

{ as-generator                              \
, choice, frequency, sequence               \
, recursive, size, label, transform, repeat } = require './generating'


### -- Helpers ---------------------------------------------------------

#### λ join
# :internal:
# Joins a list of things without a separator
#
# :: [a] -> String
join = (.join '')


#### λ char
# :internal:
# Converts some character code to a String character.
#
# :: Number -> String
char = String.from-char-code


#### λ to-integer
# :internal:
# Converts a Number to an Integer.
#
# :: Number -> Int32
to-integer = (n) -> n .|. 0


#### λ to-unsigned-integer
# :internal:
# Converts a Number to an unsigned Integer.
#
# :: Number -> UInt32
to-unsigned-integer = (n) -> n .>>>. 0


#### λ to-object
# :internal:
# Folds a list of pairs into an object.
#
# :: [String, a] -> { String -> a }
to-object = (as) -> as.reduce ((r, [k,v]) -> r <<< { "#k": v }), {}


### -- Primitive data types --------------------------------------------
Null      = as-generator null
Undefined = as-generator void
Bool      = choice true, false
Num       = label 'num'  (as-generator (s) -> choose -s, s)
Byte      = label 'byte' (as-generator (_) -> to-integer (choose 0, 255))
Char      = label 'char' (transform char, Byte)
Str       = label 'str'  (transform join, (repeat Char))


### -- Specialised numeric types ---------------------------------------
Int      = label 'int' (transform to-integer, Num)
UInt     = label 'uint' (transform to-unsigned-integer, Num)
Positive = label 'positive' (as-generator (s) -> choose 1, s)
Negative = label 'negative' (as-generator (s) -> choose -1, -s)


### -- Specialised textual types ---------------------------------------
NumChar      = label 'num-char' (transform char, -> choose-int 48, 57)
UpperChar    = label 'upper-char' (transform char, -> choose-int 65, 90)
LowerChar    = label 'lower-char' (transform char, -> choose-int 97, 122)
AlphaChar    = frequency [1, UpperChar], [9, LowerChar]
AlphaNumChar = frequency [1, NumChar], [9, AlphaChar]
AlphaStr     = transform join, (repeat AlphaChar)
NumStr       = transform join, (repeat NumChar)
AlphaNumStr  = transform join, (repeat AlphaNumChar)

Id           = do
               start = frequency [1, '_'], [2, '$'], [9, AlphaChar]
               chars = frequency [1, NumChar], [9, start]
               rest  = transform join, (repeat chars)

               label 'id' (transform join, (sequence start, rest))


### -- Container data types --------------------------------------------
List = (...as) -> repeat (choice ...as)
Map  = (...as) -> transform to-object, (repeat (sequence Id, (choice ...as)))


### -- Umbrella type unions --------------------------------------------
Nothing = choice Null, Undefined
Falsy   = choice Nothing, false, 0, ''
Any     = choice Nothing, Bool, Num, Str, (recursive -> (List Any)), (recursive -> (Map Any))

# TODO: Date, RegExp, Truthy


### -- Exports ---------------------------------------------------------
module.exports = {
  # Primitives
  Null, Undefined, Bool, Num, Byte, Char, Str

  # Numbers
  Int, UInt, Positive, Negative

  # Strings
  NumChar, UpperChar, LowerChar, AlphaChar, AlphaNumChar, AlphaStr,
  NumStr, AlphaNumStr, Id

  # Containers
  Array: List, Object: Map

  # Umbrella
  Nothing, Falsy, Any
}
