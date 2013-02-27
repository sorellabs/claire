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

{ choose-int, choose } = require './random'
{ make-value, choice, as-generator, repeat, frequency, combine, sized } = require './generating'

{ pow } = Math
{ from-char-code: char } = String
join = (as) -> as.join ''


Null         = as-generator null
Undefined    = as-generator void
Nothing      = choice Null, Undefined
Bool         = choice true, false
Num          = as-generator ((s) -> choose -s, s), 'num'
PosNum       = as-generator ((s) -> choose 1, s), 'pos-num'
NegNum       = as-generator ((s) -> choose -1, -s), 'neg-num'
Int          = as-generator ((s) -> choose-int -s, s), 'int'
PosInt       = as-generator ((s) -> choose-int 1, s), 'pos-int'
NegInt       = as-generator ((s) -> choose-int -1, s), 'neg-int'
Char         = as-generator ((s) -> char (choose-int 0, s)), 'char'
ANSIChar     = (sized 127 Char)
ASCIIChar    = (sized 255 Char)
NumChar      = as-generator (-> char (choose-int 48, 57)), 'num-char'
UpperChar    = as-generator (-> char (choose-int 65, 90)), 'upper-char'
LowerChar    = as-generator (-> char (choose-int 97, 122)), 'lower-char'
AlphaChar    = frequency [1, UpperChar], [9, LowerChar]
AlphaNumChar = frequency [1, NumChar], [9, AlphaChar]
Identifier   = combine join, LowerChar, (repeat AlphaNumChar, join)
Str          = repeat Char, join
AlphaStr     = repeat AlphaChar, join
NumStr       = repeat NumChar, join
AlphaNumStr  = repeat AlphaNumChar, join
List         = (...as) -> repeat (choice ...as)
Falsy        = choice false, void, null, 0, ''
Any          = choice Nothing, Bool, Int, Num, Char, Str, List



### -- Exports ---------------------------------------------------------
module.exports = {
  Null
  Undefined
  Nothing
  Bool
  Num
  PosNum
  NegNum
  Int
  PosInt
  NegInt
  Char
  ANSIChar
  ASCIIChar
  NumChar
  UpperChar
  LowerChar
  AlphaChar
  AlphaNumChar
  Identifier
  Str
  AlphaStr
  NumStr
  AlphaNumStr
  List
  Falsy
  Any
}