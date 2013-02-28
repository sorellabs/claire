global <<< require 'claire-mocha'
global <<< require '../src/generating'
{ for-all } = require '../src'
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

  o 'λ sized' -> do
                 for-all (sized 5, (repeat 'a'))
                 .satisfy -> it.length < 5

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
                     
