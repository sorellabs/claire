(function(){
  var Base, test, frozen, makeResult, invalidate, hold, reject, fail, values, validP, classify, verify, applyProperty, Property, forAll, slice$ = [].slice;
  Base = require('boo').Base;
  test = require('./check').test;
  frozen = Object.freeze;
  makeResult = curry$(function(kind, value, args, labels){
    return {
      kind: kind,
      value: value,
      labels: labels,
      arguments: args
    };
  });
  invalidate = curry$(function(args){
    return makeResult('ignored', null, args, []);
  });
  hold = makeResult('held', true);
  reject = makeResult('rejected');
  fail = makeResult('failed');
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
      return prop.implications.every(function(f){
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
  verify = curry$(function(args, labels, prop){
    var result, e;
    try {
      result = prop.invariant.apply(prop, values(args));
      if (result === true) {
        return hold(args, labels);
      } else {
        return reject(result, args, labels);
      }
    } catch (e$) {
      e = e$;
      return fail(e, args, labels);
    }
  });
  applyProperty = curry$(function(args, prop){
    switch (false) {
    case !validP(args, prop):
      return verify(args, classify(args, prop), prop);
    default:
      return invalidate(args);
    }
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
    },
    asTest: function(config){
      var prop;
      prop = this;
      return function(){
        return test(config, prop.derive({
          invariant: prop.invariant.bind(this)
        }));
      };
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
