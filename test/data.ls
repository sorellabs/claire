require 'es5-shim'
{ keys, fold, values } = require 'prelude-ls'
{ o }                  = require 'claire-mocha'
{ sized }              = require '../lib/generating'
{ for-all }            = require '../lib'
_                      = require '../lib/data'


### -- Helpers ---------------------------------------------------------
size = (o) -> (keys o).length


### This assumes `o` has no circular references
depth = (o, n = 0) -> switch typeof! o
  | <[ Array Object ]> => fold ((x, a) -> x >? (depth a, n+1)), (n + 1), o
  | otherwise  => n

### -- Specification ---------------------------------------------------
describe '{M} Generators' ->
  describe '-- Primitive data types' ->
    o 'Null' -> for-all _.Null .satisfy (is null)

    o 'Undefined' -> for-all _.Undefined .satisfy (is void)

    o 'Bool' -> do
                for-all _.Bool
                .satisfy -> (it is true) || (it is false)
                .classify -> it

    o 'Num' -> for-all _.Num .satisfy (is 'Number') . (typeof!)

    o 'Byte' -> for-all _.Byte .satisfy -> 0 <= it < 255

    o 'Char' -> for-all _.Char .satisfy -> (it.length is 1) && \
                                         (typeof! it is 'String')

    o 'Str' -> for-all _.Str .satisfy (is 'String') . (typeof!)


  describe '-- Specialised numeric types' ->
    max-int = Math.pow 2, 32

    o 'Int' -> for-all _.Int .satisfy -> -max-int <= it < max-int

    o 'UInt' -> for-all _.UInt .satisfy -> 0 <= it < max-int

    o 'Positive' -> for-all _.Positive .satisfy (> 0)

    o 'Negative' -> for-all _.Negative .satisfy (< 0)


  describe '-- Specialised textual types' ->
    o 'NumChar' -> for-all _.NumChar .satisfy (== /\d/)

    o 'UpperChar' -> for-all _.UpperChar .satisfy (== /[A-Z]/)

    o 'LowerChar' -> for-all _.LowerChar .satisfy (== /[a-z]/)

    o 'AlphaChar' -> for-all _.AlphaChar .satisfy (== /[a-zA-Z]/)

    o 'AlphaNumChar' -> for-all _.AlphaNumChar .satisfy (== /[a-zA-Z0-9]/)

    o 'AlphaStr' -> do
                    for-all _.AlphaStr
                    .given -> it.length > 0
                    .satisfy (== /[a-zA-Z]+/)

    o 'NumStr' -> do
                  for-all _.NumStr
                  .given -> it.length > 0
                  .satisfy (== /[0-9]+/)

    o 'AlphaNumStr' -> do
                       for-all _.AlphaNumStr
                       .given -> it.length > 0
                       .satisfy (== /[a-zA-Z0-9]+/)

    o 'Id' -> do
              for-all _.Id
              .satisfy (== /[\$_a-zA-Z][\$_a-zA-Z0-9]*/)
              .classify -> | it.length is 1 => 'trivial'
                           | it.length > 1  => 'ok'


  describe '-- Container data types' ->
    o 'Array(Byte)' -> do
                      for-all (_.Array _.Byte)
                      .satisfy -> it.every (x) -> 0 <= x < 255

    o 'Array(Bool, Byte)' -> do
                            for-all (_.Array _.Bool, _.Byte)
                            .satisfy ->
                               it.every ((x) ->
                                 | typeof x is 'number' => 0 <= x < 255
                                 | otherwise            => !!x is x)

    o 'Object(Bool)' -> for-all (sized (-> 20), (_.Object _.Bool)) .satisfy (o) ->
                          ((keys o).every  (== /[\$_a-zA-Z][\$_a-zA-Z0-9]*/)) && \
                          ((values o).every -> it == !!it)


  describe '-- Umbrella type unions' ->
    o 'Nothing' -> for-all _.Nothing .satisfy (~= null)

    o 'Falsy' -> for-all _.Falsy .satisfy -> !it

    o 'Any' -> do
               for-all (sized (-> 20), _.Any)
               .satisfy -> switch typeof! it
                 | \Array    => ((depth it) < 5) && (it.length < 20)
                 | \Object   => ((depth it) < 5) && ((keys it).length < 20)
                 | \String   => it.length < 20
                 | \Number   => -20 <= it < 20
                 | otherwise => true
               .classify -> switch typeof! it
                 | \Array    => "Array: #{depth it}"
                 | \Object   => "Object: #{depth it}"
                 | otherwise => typeof! it
