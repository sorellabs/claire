(function(){
  var forAll, expect, e, toString$ = {}.toString;
  import$(global, require('claire-mocha'));
  import$(global, require('../lib/generating'));
  import$(global, require('../lib/data'));
  import$(global, require('prelude-ls'));
  forAll = require('../lib').forAll;
  expect = require('chai').expect;
  e = it;
  describe('{M} Generating', function(){
    o('λ as-generator<a>', function(){
      var g;
      g = asGenerator('a');
      expect(g.toString()).to.equal('<a>');
      return forAll(g).satisfy((function(it){
        return it === 'a';
      }));
    });
    e('λ as-generator<Gen a>', function(){
      var g;
      g = asGenerator(Generator);
      return expect(g).to.equal(Generator);
    });
    o('λ choice<a...>', function(){
      return forAll(choice('a', 'b')).satisfy(function(it){
        return it == 'a' || it == 'b';
      }).classify(function(it){
        return it;
      });
    });
    o('λ frequency<a...>', function(){
      return forAll(frequency([1, 'a'], [5, 'b'])).satisfy(function(it){
        return it == 'a' || it == 'b';
      }).classify(function(it){
        return it;
      });
    });
    o('λ sequence<a,b>', function(){
      return forAll(sequence('a', 'b')).satisfy(function(arg$){
        var a, b;
        a = arg$[0], b = arg$[1];
        return a === 'a' && b === 'b';
      });
    });
    o('λ sized', function(){
      return forAll(sized(5, choice(Num, Str, List(Int), Map(Int)))).satisfy(function(it){
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
      }));
    });
    o('λ label', function(){
      var g;
      g = label('a', 'b');
      expect(g.toString()).to.equal('<a>');
      return forAll(g).satisfy((function(it){
        return it === 'b';
      }));
    });
    o('λ transform', function(){
      return forAll(transform(function(it){
        return it.toUpperCase();
      }, 'a')).satisfy((function(it){
        return it === 'A';
      }));
    });
    return o('λ repeat', function(){
      return forAll(repeat('a')).given(function(it){
        return it.length > 0;
      }).satisfy(function(it){
        return it.every((function(it){
          return it === 'a';
        }));
      });
    });
  });
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);
