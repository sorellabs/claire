global.claire-config = times: 1

global <<< require 'claire-mocha'
global <<< require '../lib/generating'
global <<< require '../lib/data'
global <<< require 'prelude-ls'
{ for-all } = require '../lib'
{ expect } = require 'chai'

e = it

describe '{M} Generating' ->
  o 'λ as-generator<a>' -> do
                           g = (as-generator 'a')
                           expect g.to-string! .to.equal '<a>'
                           for-all g .satisfy (is 'a')

  e 'λ as-generator<Gen a>' -> do
                               g = (as-generator Generator)
                               expect g .to.equal Generator

  o 'λ choice<a...>' -> do
                        for-all (choice 'a', 'b')
                        .satisfy  -> it in <[ a b ]>
                        .classify -> it

  o 'λ frequency<a...>' -> do
                           for-all (frequency [1, 'a'], [5, 'b'])
                           .satisfy  -> it in <[ a b ]>
                           .classify -> it

  o 'λ sequence<a,b>' -> do
                         for-all (sequence 'a', 'b')
                         .satisfy ([a, b]) -> (a is 'a') && (b is 'b')

  o 'λ recursive<a>' -> do
                        a = sequence('a', (recursive (n) -> | n == 0 => 'a'
                                                            | _      =>  a))
                        for-all (sized (-> 20), a)
                        .satisfy  -> ("#it".replace /,/g, '').length is 6

  o 'λ sized' -> do
                 for-all (sized (-> 5), (choice Num, Str, (List Int), (Map Int)))
                 .satisfy -> switch typeof! it
                    | \Number => -5 <= it < 5
                    | \String => it.length < 5
                    | \Array  => it.length < 5
                    | \Object => (keys it).length < 5
                 .classify (typeof!)

  o 'λ label' -> do
                 g = (label 'a', 'b')
                 expect g.to-string! .to.equal '<a>'
                 for-all g .satisfy (is 'b')

  o 'λ transform' -> do
                     for-all (transform (.to-upper-case!), 'a')
                     .satisfy (is 'A')

  o 'λ repeat' -> do
                  for-all (repeat 'a')
                  .given   -> it.length > 0
                  .satisfy -> it.every (is 'a')
