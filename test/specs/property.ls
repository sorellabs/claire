describe = (require 'brofist')!
assert = require 'assert'

{Property, for-all} = require '../../lib/property'
{Generator, make-value} = require '../../lib'

Nat = Generator.derive {
  init: -> @current = 0
  next: -> make-value (++@current), this
}

module.exports = describe '{M} property' (o, describe) ->
  describe '{} Property' (o, describe) ->
    describe 'λ satisfy' (o) ->
      o 'Should return a new property for the given law.' ->
        f = (==)
        p = Property.make []
        q = p.satisfy f
        (assert q.invariant is f)
        (assert p.invariant isnt f)
      
    describe 'λ classify' (o) ->
      o 'Should add a new classifier to the property.' ->
        f = (+); g = (-)
        p = (Property.make []).classify f
        q = p.classify g

        assert.deep-equal p.classifiers, [f]
        assert.deep-equal q.classifiers, [f, g]

    describe 'λ given' (o) ->
      o 'Should add a new implication to the property.' ->
        f = (==); g = (<=)
        p = (Property.make []).given f
        q = p.given g

        assert.deep-equal p.implications, [f]
        assert.deep-equal q.implications, [f, g]

    describe 'λ run' (o) ->
      o 'Should run the invariant once.' ->
        p = Property.make [Nat.make!] .satisfy (-> it)
        assert p.run!value == 1
        assert p.run!value == 2

      o 'Should reject if the assertion fails.' ->
        p = Property.make [Nat.make!] .satisfy (== 2)
        assert p.run!kind == \rejected

      o 'Should use the return of the invariant as the failure reason.' ->
        p = Property.make [Nat.make!] .satisfy (-> 'boo')
        assert p.run!value == 'boo'
      
      o 'Should fail when invariant throws an error.' ->
        p = Property.make [Nat.make!] .satisfy (-> throw new Error)
        assert p.run!kind == \failed
      
      o 'Should return an undecided result if any implications don`t hold.' ->
        p = Property.make [Nat.make!] .satisfy (-> true) .given Boolean .given (> 1)
        assert p.run!kind == \ignored
      
      o 'Should succeed if the assertion holds.' ->
        p = Property.make [Nat.make!] .satisfy (== 1)
        assert p.run!kind == \held

      o 'Should add a list of all classifiers to the Result object.' ->
        p = Property.make [Nat.make!] .satisfy (-> true) .classify (typeof!) .classify (> 1)
        assert.deep-equal p.run!labels, ['Number', false]
        assert.deep-equal p.run!labels, ['Number', true]

      o 'Should include the list of arguments in the Result object.' ->
        nat1 = Nat.make!
        nat2 = Nat.make!
        nat1.next!

        p = Property.make [nat1, nat2] .satisfy (-> true)

        assert.deep-equal p.run!arguments, [{value:2,generator:nat1}, {value:1,generator:nat2}]

    describe 'λ as-test()' (o) ->
      o 'Should run in the context passed to as-test.' ->
        ctx = {}
        p = Property.make [] .satisfy (-> this is ctx)
        p.as-test!.call ctx

      # Other properties to be checked in the check.ls



        
