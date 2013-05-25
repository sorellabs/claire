(function(){
  var ref$, Base, derive, concatMap, replicate, pickOne, chooseInt, floor, callableP, generatorP, compute, makeValue, value, Generator, asGenerator, bind, choice, frequency, sequence, sized, recursive, label, transform, repeat, slice$ = [].slice;
  ref$ = require('boo'), Base = ref$.Base, derive = ref$.derive;
  ref$ = require('prelude-ls'), concatMap = ref$.concatMap, replicate = ref$.replicate;
  ref$ = require('./random'), pickOne = ref$.pickOne, chooseInt = ref$.chooseInt;
  floor = Math.floor;
  callableP = function(a){
    return typeof a === 'function';
  };
  generatorP = function(a){
    return 'next' in Object(a);
  };
  compute = function(size, a, gen){
    switch (false) {
    case !callableP(a):
      return a(size != null
        ? size
        : gen.size);
    default:
      return a;
    }
  };
  makeValue = curry$(function(value, gen){
    return {
      generator: gen,
      value: value
    };
  });
  value = curry$(function(n, ctx, gen){
    return asGenerator(gen).next.call(ctx, n).value;
  });
  Generator = Base.derive({
    size: 100,
    next: function(n){
      throw Error('unimplemented');
    },
    shrink: function(a){
      throw Error('unimplemented');
    },
    then: function(f){
      return bind(this, f);
    },
    toString: function(){
      return '<Generator>';
    }
  });
  asGenerator = function(a){
    switch (false) {
    case !generatorP(a):
      return a;
    default:
      return Generator.derive({
        toString: function(){
          return "<" + a + ">";
        },
        next: function(n){
          return makeValue(compute(n, a, this), this);
        }
      });
    }
  };
  bind = function(gen, f){
    return Generator.derive({
      next: function(n){
        var v, r;
        v = value(n, this, asGenerator(gen));
        r = value(n, this, asGenerator(f(v)));
        return makeValue(r, this);
      }
    });
  };
  choice = function(){
    var as;
    as = slice$.call(arguments);
    return Generator.derive({
      toString: function(){
        return "<Choice (" + as + ")>";
      },
      next: function(n){
        var gen;
        gen = asGenerator(pickOne(as));
        return makeValue(value(n, this, gen), gen);
      }
    });
  };
  frequency = function(){
    var as, gs, representation;
    as = slice$.call(arguments);
    gs = concatMap(function(arg$){
      var w, g;
      w = arg$[0], g = arg$[1];
      return replicate(w, g);
    }, as);
    representation = function(arg$){
      var w, g;
      w = arg$[0], g = arg$[1];
      return w + ':' + g;
    };
    return choice.apply(null, gs).derive({
      toString: function(){
        return "<Frequency (" + as.map(representation) + ">";
      }
    });
  };
  sequence = function(){
    var as;
    as = slice$.call(arguments);
    return Generator.derive({
      toString: function(){
        return "<Sequence (" + as.map(asGenerator) + ")>";
      },
      next: function(n){
        return makeValue(as.map(value(n, this)), this);
      }
    });
  };
  sized = curry$(function(f, gen){
    var g;
    g = asGenerator(gen);
    return g.derive({
      next: function(n){
        return g.next(f(n));
      }
    });
  });
  recursive = function(gen){
    return Generator.derive({
      toString: function(){
        return "<Recursive>";
      },
      next: function(n){
        var g;
        n = floor((n != null
          ? n
          : this.size) / 2);
        g = compute(n, gen, this);
        return makeValue(value(n, this, g), this);
      }
    });
  };
  label = curry$(function(name, gen){
    return asGenerator(gen).derive({
      toString: function(){
        return "<" + name + ">";
      }
    });
  });
  transform = curry$(function(f, gen){
    var g;
    g = asGenerator(gen);
    return g.derive({
      next: function(n){
        return makeValue(f(value(n, this, g)), this);
      }
    });
  });
  repeat = function(gen){
    gen = asGenerator(gen);
    return gen.derive({
      toString: function(){
        return "<Repeat " + gen + ">";
      },
      next: function(n){
        var size, range, res$, i$, to$, ridx$, this$ = this;
        size = n != null
          ? n
          : this.size;
        res$ = [];
        for (i$ = 1, to$ = chooseInt(0, size); i$ <= to$; ++i$) {
          ridx$ = i$;
          res$.push(ridx$);
        }
        range = res$;
        return makeValue(range.map(function(){
          return value(size, this$, gen);
        }), this);
      }
    });
  };
  module.exports = {
    makeValue: makeValue,
    value: value,
    Generator: Generator,
    asGenerator: asGenerator,
    bind: bind,
    choice: choice,
    frequency: frequency,
    sequence: sequence,
    sized: sized,
    recursive: recursive,
    label: label,
    transform: transform,
    repeat: repeat
  };
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
