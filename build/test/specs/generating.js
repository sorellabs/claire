(function(){
  var describe, assert, keys, ref$, asGenerator, bind, Generator, choice, frequency, sequence, recursive, sized, label, transform, repeat, forAll, data, _, toString$ = {}.toString;
  describe = require('brofist')();
  assert = require('assert');
  keys = require('prelude-ls').keys;
  ref$ = require('../../lib/generating'), asGenerator = ref$.asGenerator, bind = ref$.bind, Generator = ref$.Generator, choice = ref$.choice, frequency = ref$.frequency, sequence = ref$.sequence, recursive = ref$.recursive, sized = ref$.sized, label = ref$.label, transform = ref$.transform, repeat = ref$.repeat;
  ref$ = require('../../lib'), forAll = ref$.forAll, data = ref$.data;
  _ = require('../../lib/data');
  module.exports = describe('{M} Generating', function(o){
    var g, f, a;
    o('λ as-generator<a>', function(){
      var g;
      g = asGenerator('a');
      assert.equal(g.toString(), '<a>');
      return forAll(g).satisfy((function(it){
        return it === 'a';
      })).asTest()();
    });
    o('λ as-generator<Gen a>', function(){
      var g;
      g = asGenerator(Generator);
      return assert.equal(g, Generator);
    });
    o('λ bind<a, b>', (g = data.Int, f = function(v){
      return asGenerator([v, v - 1]);
    }, forAll(bind(g, f)).satisfy(function(it){
      return it[1] === it[0] - 1;
    }).asTest()));
    o('Generator#then<f>', (g = data.Int, f = function(v){
      return asGenerator([v, v - 1]);
    }, forAll(g.then(f)).satisfy(function(it){
      return it[1] === it[0] - 1;
    }).asTest()));
    o('λ choice<a...>', forAll(choice('a', 'b')).satisfy(function(it){
      return it == 'a' || it == 'b';
    }).classify(function(it){
      return it;
    }).asTest());
    o('λ frequency<a...>', forAll(frequency([1, 'a'], [5, 'b'])).satisfy(function(it){
      return it == 'a' || it == 'b';
    }).classify(function(it){
      return it;
    }).asTest());
    o('λ sequence<a,b>', forAll(sequence('a', 'b')).satisfy(function(arg$){
      var a, b;
      a = arg$[0], b = arg$[1];
      return a === 'a' && b === 'b';
    }).asTest());
    o('λ recursive<a>', (a = sequence('a', recursive(function(n){
      switch (false) {
      case n !== 0:
        return 'a';
      default:
        return a;
      }
    })), forAll(sized(function(){
      return 20;
    }, a)).satisfy(function(it){
      return (it + "").replace(/,/g, '').length === 6;
    }).asTest()));
    o('λ sized', forAll(sized(function(){
      return 5;
    }, choice(_.Num, _.Str, _.Array(_.Int), _.Object(_.Int)))).satisfy(function(it){
      switch (toString$.call(it).slice(8, -1)) {
      case 'Number':
        return -5 <= it && it < 5;
      case 'String':
        return it.length < 5;
      case 'Array':
        return it.length < 5;
      case 'Object':
        return keys(it).length < 5;
      }
    }).classify((function(it){
      return toString$.call(it).slice(8, -1);
    })).asTest());
    o('λ label', function(){
      var g;
      g = label('a', 'b');
      assert.equal(g.toString(), '<a>');
      return forAll(g).satisfy((function(it){
        return it === 'b';
      })).asTest()();
    });
    o('λ transform', forAll(transform(function(it){
      return it.toUpperCase();
    }, 'a')).satisfy((function(it){
      return it === 'A';
    })).asTest());
    return o('λ repeat', forAll(repeat('a')).given(function(it){
      return it.length > 0;
    }).satisfy(function(it){
      return it.every((function(it){
        return it === 'a';
      }));
    }).asTest());
  });
}).call(this);
