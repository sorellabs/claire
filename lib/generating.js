(function(){
  var ref$, Base, derive, concatMap, replicate, pickOne, chooseInt, callableP, generatorP, compute, makeValue, value, Generator, asGenerator, choice, frequency, sequence, sized, label, transform, repeat, slice$ = [].slice;
  ref$ = require('boo'), Base = ref$.Base, derive = ref$.derive;
  ref$ = require('prelude-ls'), concatMap = ref$.concatMap, replicate = ref$.replicate;
  ref$ = require('./random'), pickOne = ref$.pickOne, chooseInt = ref$.chooseInt;
  callableP = function(a){
    return typeof a === 'function';
  };
  generatorP = function(a){
    return 'next' in Object(a);
  };
  compute = function(a, gen){
    switch (false) {
    case !callableP(a):
      return a(gen.size);
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
  value = curry$(function(ctx, gen){
    return asGenerator(gen).next.call(ctx).value;
  });
  Generator = Base.derive({
    size: 10,
    next: function(){
      throw Error('unimplemented');
    },
    shrink: function(a){
      throw Error('unimplemented');
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
        next: function(){
          return makeValue(compute(a, this), this);
        }
      });
    }
  };
  choice = function(){
    var as;
    as = slice$.call(arguments);
    return Generator.derive({
      toString: function(){
        return "<Choice (" + as + ")>";
      },
      next: function(){
        var gen;
        gen = pickOne(as);
        return makeValue(value(this, gen), asGenerator(gen));
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
        return "<Sequence (" + gs + ")>";
      },
      next: function(){
        return makeValue(as.map(value(this)), this);
      }
    });
  };
  sized = curry$(function(n, gen){
    return asGenerator(gen).derive({
      size: n
    });
  });
  label = curry$(function(name, gen){
    return asGenerator(gen).derive({
      toString: function(){
        return "<" + name + ">";
      }
    });
  });
  transform = function(f, gen){
    var g;
    g = asGenerator(gen);
    return g.derive({
      next: function(){
        return makeValue(f(value(this, g)), this);
      }
    });
  };
  repeat = function(gen){
    gen = asGenerator(gen);
    return gen.derive({
      toString: function(){
        return "<Repeat " + gen + ">";
      },
      next: function(){
        var range, res$, i$, to$, ridx$, this$ = this;
        res$ = [];
        for (i$ = 1, to$ = chooseInt(0, this.size); i$ <= to$; ++i$) {
          ridx$ = i$;
          res$.push(ridx$);
        }
        range = res$;
        return makeValue(range.map(function(){
          return value(this$, gen);
        }), this);
      }
    });
  };
  module.exports = {
    makeValue: makeValue,
    value: value,
    Generator: Generator,
    asGenerator: asGenerator,
    choice: choice,
    frequency: frequency,
    sequence: sequence,
    sized: sized,
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
