(function(){
  var describe, ref$, keys, fold, values, sized, forAll, _, size, depth, toString$ = {}.toString;
  describe = require('brofist')();
  ref$ = require('prelude-ls'), keys = ref$.keys, fold = ref$.fold, values = ref$.values;
  sized = require('../../lib/generating').sized;
  forAll = require('../../lib').forAll;
  _ = require('../../lib/data');
  size = function(o){
    return keys(o).length;
  };
  depth = function(o, n){
    n == null && (n = 0);
    switch (toString$.call(o).slice(8, -1)) {
    case 'Array':
    case 'Object':
      return fold(function(x, a){
        var ref$;
        return x > (ref$ = depth(a, n + 1)) ? x : ref$;
      }, n + 1, o);
    default:
      return n;
    }
  };
  module.exports = describe('{M} Generators', function(o, describe){
    describe('-- Primitive data types', function(o){
      o('Null', forAll(_.Null).satisfy((function(it){
        return it === null;
      })).asTest());
      o('Undefined', forAll(_.Undefined).satisfy((function(it){
        return it === void 8;
      })).asTest());
      o('Bool', forAll(_.Bool).satisfy(function(it){
        return it === true || it === false;
      }).classify(function(it){
        return it;
      }).asTest());
      o('Num', forAll(_.Num).satisfy(compose$([
        (function(it){
          return it === 'Number';
        }), (function(it){
          return toString$.call(it).slice(8, -1);
        })
      ])).asTest());
      o('Byte', forAll(_.Byte).satisfy(function(it){
        return (0 <= it && it < 255) && (it | 0) === it;
      }).asTest());
      o('Char', forAll(_.Char).satisfy(function(it){
        return it.length === 1 && toString$.call(it).slice(8, -1) === 'String';
      }).asTest());
      return o('Str', forAll(_.Str).satisfy(compose$([
        (function(it){
          return it === 'String';
        }), (function(it){
          return toString$.call(it).slice(8, -1);
        })
      ])).asTest());
    });
    describe('-- Specialised numeric types', function(o){
      var maxInt;
      maxInt = Math.pow(2, 32);
      o('Int', forAll(_.Int).satisfy(function(it){
        return -maxInt <= it && it < maxInt;
      }).asTest());
      o('UInt', forAll(_.UInt).satisfy(function(it){
        return 0 <= it && it < maxInt;
      }).asTest());
      o('Positive', forAll(_.Positive).satisfy((function(it){
        return it > 0;
      })).asTest());
      return o('Negative', forAll(_.Negative).satisfy((function(it){
        return it < 0;
      })).asTest());
    });
    describe('-- Specialised textual types', function(o){
      o('NumChar', forAll(_.NumChar).satisfy(compose$([
        Boolean, (function(it){
          return /\d/.exec(it);
        })
      ])).asTest());
      o('UpperChar', forAll(_.UpperChar).satisfy(compose$([
        Boolean, (function(it){
          return /[A-Z]/.exec(it);
        })
      ])).asTest());
      o('LowerChar', forAll(_.LowerChar).satisfy(compose$([
        Boolean, (function(it){
          return /[a-z]/.exec(it);
        })
      ])).asTest());
      o('AlphaChar', forAll(_.AlphaChar).satisfy(compose$([
        Boolean, (function(it){
          return /[a-zA-Z]/.exec(it);
        })
      ])).asTest());
      o('AlphaNumChar', forAll(_.AlphaNumChar).satisfy(compose$([
        Boolean, (function(it){
          return /[a-zA-Z0-9]/.exec(it);
        })
      ])).asTest());
      o('AlphaStr', forAll(_.AlphaStr).given(function(it){
        return it.length > 0;
      }).satisfy(compose$([
        Boolean, (function(it){
          return /[a-zA-Z]+/.exec(it);
        })
      ])).asTest());
      o('NumStr', forAll(_.NumStr).given(function(it){
        return it.length > 0;
      }).satisfy(compose$([
        Boolean, (function(it){
          return /[0-9]+/.exec(it);
        })
      ])).asTest());
      o('AlphaNumStr', forAll(_.AlphaNumStr).given(function(it){
        return it.length > 0;
      }).satisfy(compose$([
        Boolean, (function(it){
          return /[a-zA-Z0-9]+/.exec(it);
        })
      ])).asTest());
      return o('Id', forAll(_.Id).satisfy(compose$([
        Boolean, (function(it){
          return /[\$_a-zA-Z][\$_a-zA-Z0-9]*/.exec(it);
        })
      ])).classify(function(it){
        switch (false) {
        case it.length !== 1:
          return 'trivial';
        case !(it.length > 1):
          return 'ok';
        }
      }).asTest());
    });
    describe('-- Container data types', function(o){
      o('Array(Byte)', forAll(_.Array(_.Byte)).satisfy(function(it){
        return it.every(function(x){
          return 0 <= x && x < 255;
        });
      }).asTest());
      o('Array(Bool, Byte)', forAll(_.Array(_.Bool, _.Byte)).satisfy(function(it){
        return it.every(function(x){
          switch (false) {
          case typeof x !== 'number':
            return 0 <= x && x < 255;
          default:
            return !!x === x;
          }
        });
      }).asTest());
      return o('Object(Bool)', forAll(sized(function(){
        return 20;
      }, _.Object(_.Bool))).satisfy(function(o){
        return keys(o).every((function(it){
          return /[\$_a-zA-Z][\$_a-zA-Z0-9]*/.exec(it);
        })) && values(o).every(function(it){
          return it === !!it;
        });
      }).asTest());
    });
    return describe('-- Umbrella type unions', function(o){
      o('Nothing', forAll(_.Nothing).satisfy((function(it){
        return it == null;
      })).asTest());
      o('Falsy', forAll(_.Falsy).satisfy(function(it){
        return !it;
      }).asTest());
      return o('Any', forAll(sized(function(){
        return 20;
      }, _.Any)).satisfy(function(it){
        switch (toString$.call(it).slice(8, -1)) {
        case 'Array':
          return depth(it) < 5 && it.length < 20;
        case 'Object':
          return depth(it) < 5 && keys(it).length < 20;
        case 'String':
          return it.length < 20;
        case 'Number':
          return -20 <= it && it < 20;
        default:
          return true;
        }
      }).classify(function(it){
        switch (toString$.call(it).slice(8, -1)) {
        case 'Array':
          return "Array: " + depth(it);
        case 'Object':
          return "Object: " + depth(it);
        default:
          return toString$.call(it).slice(8, -1);
        }
      }).asTest());
    });
  });
  function compose$(fs){
    return function(){
      var i, args = arguments;
      for (i = fs.length; i > 0; --i) { args = [fs[i-1].apply(this, args)]; }
      return args[0];
    };
  }
}).call(this);
