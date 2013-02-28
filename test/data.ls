global <<< require 'prelude-ls'
global <<< require 'claire-mocha'
global <<< require '../lib/data'
{ for-all } = require '../lib'


describe '{M} Generators' ->
  describe '-- Primitive data types' ->
    o 'Null' -> for-all Null .satisfy (is null)

    o 'Undefined' -> for-all Undefined .satisfy (is void)

    o 'Bool' -> do
                for-all Bool
                .satisfy -> (it is true) || (it is false)
                .classify -> it

    o 'Num' -> for-all Num .satisfy (is 'Number') . (typeof!)

    o 'Byte' -> for-all Byte .satisfy -> 0 <= it < 255

    o 'Char' -> for-all Char .satisfy -> (it.length is 1) && \
                                         (typeof! it is 'String')

    o 'Str' -> for-all Str .satisfy (is 'String') . (typeof!)


  describe '-- Specialised numeric types' ->
    max-int = Math.pow 2, 32

    o 'Int' -> for-all Int .satisfy -> -max-int <= it < max-int

    o 'UInt' -> for-all UInt .satisfy -> 0 <= it < max-int

    o 'Positive' -> for-all Positive .satisfy (> 0)

    o 'Negative' -> for-all Negative .satisfy (< 0)


  describe '-- Specialised textual types' ->
    o 'NumChar' -> for-all NumChar .satisfy (== /\d/)

    o 'UpperChar' -> for-all UpperChar .satisfy (== /[A-Z]/)

    o 'LowerChar' -> for-all LowerChar .satisfy (== /[a-z]/)

    o 'AlphaChar' -> for-all AlphaChar .satisfy (== /[a-zA-Z]/)

    o 'AlphaNumChar' -> for-all AlphaNumChar .satisfy (== /[a-zA-Z0-9]/)

    o 'AlphaStr' -> do
                    for-all AlphaStr
                    .given -> it.length > 0
                    .satisfy (== /[a-zA-Z]+/)

    o 'NumStr' -> do
                  for-all NumStr
                  .given -> it.length > 0
                  .satisfy (== /[0-9]+/)

    o 'AlphaNumStr' -> do
                       for-all AlphaNumStr
                       .given -> it.length > 0
                       .satisfy (== /[a-zA-Z0-9]+/)

    o 'Id' -> do
              for-all Id
              .satisfy (== /[\$_a-zA-Z][\$_a-zA-Z0-9]*/)
              .classify -> | it.length is 1 => 'trivial'
                           | it.length > 1  => 'ok'


  describe '-- Container data types' ->
    o 'List(Byte)' -> do
                      for-all (List Byte)
                      .satisfy -> it.every (x) -> 0 <= x < 255

    o 'List(Bool, Byte)' -> do
                            for-all (List Bool, Byte)
                            .satisfy ->
                               it.every ((x) ->
                                 | typeof x is 'number' => 0 <= x < 255
                                 | otherwise            => !!x is x)

    o 'Map(Bool)' -> for-all (Map Bool) .satisfy (o) ->
                       ((keys o).every (== /[\$_a-zA-Z][\$_a-zA-Z0-9]*/)) && \
                       ((values o).every -> !!it is it)


  describe '-- Umbrella type unions' ->
    o 'Nothing' -> for-all Nothing .satisfy (~= null)

    o 'Falsy' -> for-all Falsy .satisfy -> !it
