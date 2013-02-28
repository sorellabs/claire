(function(){
  var Base, frozen, values, validP, classify, verify, invalidate, applyProperty, makeResult, Property, forAll, slice$ = [].slice;
  Base = require('boo').Base;
  frozen = Object.freeze;
  values = function(it){
    return it.map(function(it){
      return it.value;
    });
  };
  validP = curry$(function(args, prop){
    switch (false) {
    case prop.implications.length !== 0:
      return true;
    default:
      return prop.implications.some(function(f){
        return f.apply(null, values(args));
      });
    }
  });
  classify = curry$(function(args, prop){
    return prop.classifiers.map(function(f){
      return f.apply(null, values(args));
    }).filter((function(it){
      return it != null;
    }));
  });
  verify = curry$(function(args, prop){
    return !!prop.invariant.apply(prop, values(args));
  });
  invalidate = curry$(function(args, prop){
    return makeResult(args, [], null);
  });
  applyProperty = curry$(function(args, prop){
    switch (false) {
    case !validP(args, prop):
      return makeResult(args, classify(args, prop), verify(args, prop));
    default:
      return invalidate(args, prop);
    }
  });
  makeResult = curry$(function(args, labels, ok){
    return {
      ok: ok,
      labels: labels,
      arguments: args
    };
  });
  Property = Base.derive({
    init: function(args){
      this.arguments = frozen(args) || [];
      this.classifiers = frozen([]);
      this.implications = frozen([]);
      return this;
    },
    invariant: function(){
      throw Error('unimplemented');
    },
    satisfy: function(f){
      return this.derive({
        invariant: f
      });
    },
    classify: function(f){
      return this.derive({
        classifiers: this.classifiers.concat([f])
      });
    },
    given: function(f){
      return this.derive({
        implications: this.implications.concat([f])
      });
    },
    run: function(){
      return applyProperty(this.arguments.map(function(g){
        return g.next();
      }), this);
    }
  });
  forAll = function(){
    var as;
    as = slice$.call(arguments);
    return Property.make(as);
  };
  module.exports = {
    Property: Property,
    forAll: forAll
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
