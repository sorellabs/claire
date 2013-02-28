(function(){
  var forAll, toString$ = {}.toString;
  import$(global, require('prelude-ls'));
  import$(global, require('claire-mocha'));
  import$(global, require('../lib/data'));
  forAll = require('../lib').forAll;
  describe('{M} Generators', function(){
    describe('-- Primitive data types', function(){
      o('Null', function(){
        return forAll(Null).satisfy((function(it){
          return it === null;
        }));
      });
      o('Undefined', function(){
        return forAll(Undefined).satisfy((function(it){
          return it === void 8;
        }));
      });
      o('Bool', function(){
        return forAll(Bool).satisfy(function(it){
          return it === true || it === false;
        }).classify(function(it){
          return it;
        });
      });
      o('Num', function(){
        return forAll(Num).satisfy(compose$([
          (function(it){
            return it === 'Number';
          }), (function(it){
            return toString$.call(it).slice(8, -1);
          })
        ]));
      });
      o('Byte', function(){
        return forAll(Byte).satisfy(function(it){
          return 0 <= it && it < 255;
        });
      });
      o('Char', function(){
        return forAll(Char).satisfy(function(it){
          return it.length === 1 && toString$.call(it).slice(8, -1) === 'String';
        });
      });
      return o('Str', function(){
        return forAll(Str).satisfy(compose$([
          (function(it){
            return it === 'String';
          }), (function(it){
            return toString$.call(it).slice(8, -1);
          })
        ]));
      });
    });
    describe('-- Specialised numeric types', function(){
      var maxInt;
      maxInt = Math.pow(2, 32);
      o('Int', function(){
        return forAll(Int).satisfy(function(it){
          return -maxInt <= it && it < maxInt;
        });
      });
      o('UInt', function(){
        return forAll(UInt).satisfy(function(it){
          return 0 <= it && it < maxInt;
        });
      });
      o('Positive', function(){
        return forAll(Positive).satisfy((function(it){
          return it > 0;
        }));
      });
      return o('Negative', function(){
        return forAll(Negative).satisfy((function(it){
          return it < 0;
        }));
      });
    });
    describe('-- Specialised textual types', function(){
      o('NumChar', function(){
        return forAll(NumChar).satisfy((function(it){
          return /\d/.exec(it);
        }));
      });
      o('UpperChar', function(){
        return forAll(UpperChar).satisfy((function(it){
          return /[A-Z]/.exec(it);
        }));
      });
      o('LowerChar', function(){
        return forAll(LowerChar).satisfy((function(it){
          return /[a-z]/.exec(it);
        }));
      });
      o('AlphaChar', function(){
        return forAll(AlphaChar).satisfy((function(it){
          return /[a-zA-Z]/.exec(it);
        }));
      });
      o('AlphaNumChar', function(){
        return forAll(AlphaNumChar).satisfy((function(it){
          return /[a-zA-Z0-9]/.exec(it);
        }));
      });
      o('AlphaStr', function(){
        return forAll(AlphaStr).given(function(it){
          return it.length > 0;
        }).satisfy((function(it){
          return /[a-zA-Z]+/.exec(it);
        }));
      });
      o('NumStr', function(){
        return forAll(NumStr).given(function(it){
          return it.length > 0;
        }).satisfy((function(it){
          return /[0-9]+/.exec(it);
        }));
      });
      o('AlphaNumStr', function(){
        return forAll(AlphaNumStr).given(function(it){
          return it.length > 0;
        }).satisfy((function(it){
          return /[a-zA-Z0-9]+/.exec(it);
        }));
      });
      return o('Id', function(){
        return forAll(Id).satisfy((function(it){
          return /[\$_a-zA-Z][\$_a-zA-Z0-9]*/.exec(it);
        })).classify(function(it){
          switch (false) {
          case it.length !== 1:
            return 'trivial';
          case !(it.length > 1):
            return 'ok';
          }
        });
      });
    });
    describe('-- Container data types', function(){
      o('List(Byte)', function(){
        return forAll(List(Byte)).satisfy(function(it){
          return it.every(function(x){
            return 0 <= x && x < 255;
          });
        });
      });
      o('List(Bool, Byte)', function(){
        return forAll(List(Bool, Byte)).satisfy(function(it){
          return it.every(function(x){
            switch (false) {
            case typeof x !== 'number':
              return 0 <= x && x < 255;
            default:
              return !!x === x;
            }
          });
        });
      });
      return o('Map(Bool)', function(){
        return forAll(Map(Bool)).satisfy(function(o){
          return keys(o).every((function(it){
            return /[\$_a-zA-Z][\$_a-zA-Z0-9]*/.exec(it);
          })) && values(o).every(function(it){
            return !!it === it;
          });
        });
      });
    });
    return describe('-- Umbrella type unions', function(){
      o('Nothing', function(){
        return forAll(Nothing).satisfy((function(it){
          return it == null;
        }));
      });
      return o('Falsy', function(){
        return forAll(Falsy).satisfy(function(it){
          return !it;
        });
      });
    });
  });
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
  function compose$(fs){
    return function(){
      var i, args = arguments;
      for (i = fs.length; i > 0; --i) { args = [fs[i-1].apply(this, args)]; }
      return args[0];
    };
  }
}).call(this);
