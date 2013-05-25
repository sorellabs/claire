describe = (require 'brofist')!

{ keys, fold, values } = require 'prelude-ls'

{ sized }              = require '../../lib/generating'
{ for-all }            = require '../../lib'
_                      = require '../../lib/data'

### -- Helpers ---------------------------------------------------------
size = (o) -> (keys o).length


### This assumes `o` has no circular references
depth = (o, n = 0) -> switch typeof! o
  | <[ Array Object ]> => fold ((x, a) -> x >? (depth a, n+1)), (n + 1), o
  | otherwise  => n

### -- Specification ---------------------------------------------------
module.exports = describe '{M} Generators' (o, describe) ->
  describe '-- Primitive data types' (o) ->
    o 'Null' do
             for-all _.Null
             .satisfy (is null)
             .as-test!

    o 'Undefined' do
                  for-all _.Undefined
                  .satisfy (is void)
                  .as-test!

    o 'Bool' do
             for-all _.Bool
             .satisfy -> (it is true) || (it is false)
             .classify -> it
             .as-test!

    o 'Num' do
            for-all _.Num
            .satisfy (is 'Number') . (typeof!)
            .as-test!

    o 'Byte' do
             for-all _.Byte
             .satisfy -> (0 <= it < 255) and ((it .|. 0) is it)
             .as-test! 

    o 'Char' do
             for-all _.Char
             .satisfy -> (it.length is 1) && \
                         (typeof! it is 'String')
             .as-test!

    o 'Str' do
            for-all _.Str
            .satisfy (is 'String') . (typeof!)
            .as-test!


  describe '-- Specialised numeric types' (o) ->
    max-int = Math.pow 2, 32

    o 'Int' do
            for-all _.Int
            .satisfy -> -max-int <= it < max-int
            .as-test!

    o 'UInt' do
             for-all _.UInt
             .satisfy -> 0 <= it < max-int
             .as-test!

    o 'Positive' do
                 for-all _.Positive
                 .satisfy (> 0)
                 .as-test!

    o 'Negative' do
                 for-all _.Negative
                 .satisfy (< 0)
                 .as-test!


  describe '-- Specialised textual types' (o) ->
    o 'NumChar' do
                for-all _.NumChar
                .satisfy Boolean . (== /\d/)
                .as-test!

    o 'UpperChar' do
                  for-all _.UpperChar
                  .satisfy Boolean . (== /[A-Z]/)
                  .as-test!

    o 'LowerChar' do
                  for-all _.LowerChar
                  .satisfy Boolean . (== /[a-z]/)
                  .as-test!

    o 'AlphaChar' do
                  for-all _.AlphaChar
                  .satisfy Boolean . (== /[a-zA-Z]/)
                  .as-test!

    o 'AlphaNumChar' do
                     for-all _.AlphaNumChar
                     .satisfy Boolean . (== /[a-zA-Z0-9]/)
                     .as-test!

    o 'AlphaStr' do
                 for-all _.AlphaStr
                 .given -> it.length > 0
                 .satisfy Boolean . (== /[a-zA-Z]+/)
                 .as-test!

    o 'NumStr' do
               for-all _.NumStr
               .given -> it.length > 0
               .satisfy Boolean . (== /[0-9]+/)
               .as-test!

    o 'AlphaNumStr' do
                    for-all _.AlphaNumStr
                    .given -> it.length > 0
                    .satisfy Boolean . (== /[a-zA-Z0-9]+/)
                    .as-test!

    o 'Id' do
           for-all _.Id
           .satisfy Boolean . (== /[\$_a-zA-Z][\$_a-zA-Z0-9]*/)
           .classify -> | it.length is 1 => 'trivial'
                        | it.length > 1  => 'ok'
           .as-test!


  describe '-- Container data types' (o) ->
    o 'Array(Byte)'  do
                    for-all (_.Array _.Byte)
                    .satisfy -> it.every (x) -> 0 <= x < 255
                    .as-test!

    o 'Array(Bool, Byte)' do
                          for-all (_.Array _.Bool, _.Byte)
                          .satisfy ->
                             it.every ((x) ->
                               | typeof x is 'number' => 0 <= x < 255
                               | otherwise            => !!x is x)
                          .as-test!

    o 'Object(Bool)' do
                     for-all (sized (-> 20), (_.Object _.Bool))
                     .satisfy (o) ->
                       ((keys o).every  (== /[\$_a-zA-Z][\$_a-zA-Z0-9]*/)) && \
                       ((values o).every -> it == !!it)
                     .as-test!


  describe '-- Umbrella type unions' (o) ->
    o 'Nothing' do
                for-all _.Nothing
                .satisfy (~= null)
                .as-test!

    o 'Falsy' do
              for-all _.Falsy
              .satisfy -> !it
              .as-test!

    o 'Any' do
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
            .as-test!
