(function(){
  var describe, assert, ref$, Property, forAll, Generator, makeValue, Nat, toString$ = {}.toString;
  describe = require('brofist')();
  assert = require('assert');
  ref$ = require('../../lib/property'), Property = ref$.Property, forAll = ref$.forAll;
  ref$ = require('../../lib'), Generator = ref$.Generator, makeValue = ref$.makeValue;
  Nat = Generator.derive({
    init: function(){
      return this.current = 0;
    },
    next: function(){
      return makeValue(++this.current, this);
    }
  });
  module.exports = describe('{M} property', function(o, describe){
    return describe('{} Property', function(o, describe){
      describe('λ satisfy', function(o){
        return o('Should return a new property for the given law.', function(){
          var f, p, q;
          f = curry$(function(x$, y$){
            return x$ === y$;
          });
          p = Property.make([]);
          q = p.satisfy(f);
          assert(q.invariant === f);
          return assert(p.invariant !== f);
        });
      });
      describe('λ classify', function(o){
        return o('Should add a new classifier to the property.', function(){
          var f, g, p, q;
          f = curry$(function(x$, y$){
            return x$ + y$;
          });
          g = curry$(function(x$, y$){
            return x$ - y$;
          });
          p = Property.make([]).classify(f);
          q = p.classify(g);
          assert.deepEqual(p.classifiers, [f]);
          return assert.deepEqual(q.classifiers, [f, g]);
        });
      });
      describe('λ given', function(o){
        return o('Should add a new implication to the property.', function(){
          var f, g, p, q;
          f = curry$(function(x$, y$){
            return x$ === y$;
          });
          g = curry$(function(x$, y$){
            return x$ <= y$;
          });
          p = Property.make([]).given(f);
          q = p.given(g);
          assert.deepEqual(p.implications, [f]);
          return assert.deepEqual(q.implications, [f, g]);
        });
      });
      describe('λ run', function(o){
        o('Should run the invariant once.', function(){
          var p;
          p = Property.make([Nat.make()]).satisfy(function(it){
            return it;
          });
          assert(p.run().value === 1);
          return assert(p.run().value === 2);
        });
        o('Should reject if the assertion fails.', function(){
          var p;
          p = Property.make([Nat.make()]).satisfy((function(it){
            return it === 2;
          }));
          return assert(p.run().kind === 'rejected');
        });
        o('Should use the return of the invariant as the failure reason.', function(){
          var p;
          p = Property.make([Nat.make()]).satisfy(function(){
            return 'boo';
          });
          return assert(p.run().value === 'boo');
        });
        o('Should fail when invariant throws an error.', function(){
          var p;
          p = Property.make([Nat.make()]).satisfy(function(){
            throw new Error;
          });
          return assert(p.run().kind === 'failed');
        });
        o('Should return an undecided result if any implications don`t hold.', function(){
          var p;
          p = Property.make([Nat.make()]).satisfy(function(){
            return true;
          }).given(Boolean).given((function(it){
            return it > 1;
          }));
          return assert(p.run().kind === 'ignored');
        });
        o('Should succeed if the assertion holds.', function(){
          var p;
          p = Property.make([Nat.make()]).satisfy((function(it){
            return it === 1;
          }));
          return assert(p.run().kind === 'held');
        });
        o('Should add a list of all classifiers to the Result object.', function(){
          var p;
          p = Property.make([Nat.make()]).satisfy(function(){
            return true;
          }).classify((function(it){
            return toString$.call(it).slice(8, -1);
          })).classify((function(it){
            return it > 1;
          }));
          assert.deepEqual(p.run().labels, ['Number', false]);
          return assert.deepEqual(p.run().labels, ['Number', true]);
        });
        return o('Should include the list of arguments in the Result object.', function(){
          var nat1, nat2, p;
          nat1 = Nat.make();
          nat2 = Nat.make();
          nat1.next();
          p = Property.make([nat1, nat2]).satisfy(function(){
            return true;
          });
          return assert.deepEqual(p.run().arguments, [
            {
              value: 2,
              generator: nat1
            }, {
              value: 1,
              generator: nat2
            }
          ]);
        });
      });
      return describe('λ as-test()', function(o){
        return o('Should run in the context passed to as-test.', function(){
          var ctx, p;
          ctx = {};
          p = Property.make([]).satisfy(function(){
            return this === ctx;
          });
          return p.asTest().call(ctx);
        });
      });
    });
  });
  function curry$(f, bound){
    var context,
    _curry = function(args) {
      return f.length > 1 ? function(){
        var params = args ? args.concat() : [];
        context = bound ? context || this : this;
        return params.push.apply(params, arguments) <
            f.length && arguments.length ?
          _curry.call(context, params) : f.apply(context, params);
      } : f;
    };
    return _curry();
  }
}).call(this);
