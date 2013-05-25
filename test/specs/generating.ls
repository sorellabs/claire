describe = (require 'brofist')!
assert = require 'assert'

{ keys } = require 'prelude-ls'

{ as-generator, bind, Generator \
, choice, frequency, sequence, recursive, sized \
, label, transform, repeat } = require '../../lib/generating'
{ for-all, data } = require '../../lib'
_ = require '../../lib/data'

module.exports = describe '{M} Generating' (o) ->
  o 'λ as-generator<a>' -> do
                           g = (as-generator 'a')
                           assert.equal g.to-string!, '<a>'
                           for-all g .satisfy (is 'a') .as-test!!


  o 'λ as-generator<Gen a>' -> do
                               g = (as-generator Generator)
                               assert.equal g, Generator
  
  o 'λ bind<a, b>' do
                   g = data.Int
                   f = (v) -> (as-generator [v, v-1])
                   for-all (bind g, f)
                   .satisfy -> it[1] is (it[0] - 1)
                   .as-test!

  o 'Generator#then<f>' do
                        g = data.Int
                        f = (v) -> (as-generator [v, v-1])
                        for-all (g.then f)
                        .satisfy -> it[1] is (it[0] - 1)
                        .as-test!

  o 'λ choice<a...>' do
                     for-all (choice 'a', 'b')
                     .satisfy  -> it in <[ a b ]>
                     .classify -> it
                     .as-test!

  o 'λ frequency<a...>' do
                        for-all (frequency [1, 'a'], [5, 'b'])
                        .satisfy  -> it in <[ a b ]>
                        .classify -> it
                        .as-test!

  o 'λ sequence<a,b>' do
                      for-all (sequence 'a', 'b')
                      .satisfy ([a, b]) -> (a is 'a') && (b is 'b')
                      .as-test!

  o 'λ recursive<a>' do
                     a = sequence('a', (recursive (n) -> | n == 0 => 'a'
                                                         | _      =>  a))
                     for-all (sized (-> 20), a)
                     .satisfy  -> ("#it".replace /,/g, '').length is 6
                     .as-test!

  o 'λ sized' do
              for-all (sized (-> 5), (choice _.Num, _.Str, (_.Array _.Int), (_.Object _.Int)))
              .satisfy -> switch typeof! it
                 | \Number => -5 <= it < 5
                 | \String => it.length < 5
                 | \Array  => it.length < 5
                 | \Object => (keys it).length < 5
              .classify (typeof!)
              .as-test!

  o 'λ label' -> do
                 g = (label 'a', 'b')
                 assert.equal g.to-string!, '<a>'
                 for-all g .satisfy (is 'b') .as-test!!


  o 'λ transform' do
                  for-all (transform (.to-upper-case!), 'a')
                  .satisfy (is 'A')
                  .as-test!

  o 'λ repeat' do
               for-all (repeat 'a')
               .given   -> it.length > 0
               .satisfy -> it.every (is 'a')
               .as-test!
