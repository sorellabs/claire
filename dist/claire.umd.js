;(function(e,t,n,r){function i(r){if(!n[r]){if(!t[r]){if(e)return e(r);throw new Error("Cannot find module '"+r+"'")}var s=n[r]={exports:{}};t[r][0](function(e){var n=t[r][1][e];return i(n?n:e)},s,s.exports)}return n[r].exports}for(var s=0;s<r.length;s++)i(r[s]);return i})(typeof require!=="undefined"&&require,{1:[function(require,module,exports){(function(){
  var merge, ref$, forAll, slice$ = [].slice;
  merge = function(){
    var as;
    as = slice$.call(arguments);
    return as.reduce(curry$(function(x$, y$){
      return import$(x$, y$);
    }));
  };
  module.exports = merge((ref$ = require('./property'), forAll = ref$.forAll, ref$), require('./generating'), require('./check'), {
    data: require('./data')
  });
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
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

},{"./property":2,"./check":3,"./generating":4,"./data":5}],5:[function(require,module,exports){(function(){
  var ref$, chooseInt, choose, asGenerator, choice, frequency, sequence, recursive, size, label, transform, repeat, join, char, toInteger, toUnsignedInteger, toObject, Null, Undefined, Bool, Num, Byte, Char, Str, Int, UInt, Positive, Negative, NumChar, UpperChar, LowerChar, AlphaChar, AlphaNumChar, AlphaStr, NumStr, AlphaNumStr, Id, start, chars, rest, List, Map, Nothing, Falsy, Any, slice$ = [].slice;
  ref$ = require('./random'), chooseInt = ref$.chooseInt, choose = ref$.choose;
  ref$ = require('./generating'), asGenerator = ref$.asGenerator, choice = ref$.choice, frequency = ref$.frequency, sequence = ref$.sequence, recursive = ref$.recursive, size = ref$.size, label = ref$.label, transform = ref$.transform, repeat = ref$.repeat;
  join = function(it){
    return it.join('');
  };
  char = String.fromCharCode;
  toInteger = function(n){
    return n | 0;
  };
  toUnsignedInteger = function(n){
    return n >>> 0;
  };
  toObject = function(as){
    return as.reduce(function(r, arg$){
      var k, v;
      k = arg$[0], v = arg$[1];
      return r[k + ""] = v, r;
    }, {});
  };
  Null = asGenerator(null);
  Undefined = asGenerator(void 8);
  Bool = choice(true, false);
  Num = label('num', asGenerator(function(s){
    return choose(-s, s);
  }));
  Byte = label('byte', asGenerator(function(_){
    return toInteger(choose(0, 255));
  }));
  Char = label('char', transform(char, Byte));
  Str = label('str', transform(join, repeat(Char)));
  Int = label('int', transform(toInteger, Num));
  UInt = label('uint', transform(toUnsignedInteger, Num));
  Positive = label('positive', asGenerator(function(s){
    return choose(1, s);
  }));
  Negative = label('negative', asGenerator(function(s){
    return choose(-1, -s);
  }));
  NumChar = label('num-char', transform(char, function(){
    return chooseInt(48, 57);
  }));
  UpperChar = label('upper-char', transform(char, function(){
    return chooseInt(65, 90);
  }));
  LowerChar = label('lower-char', transform(char, function(){
    return chooseInt(97, 122);
  }));
  AlphaChar = frequency([1, UpperChar], [9, LowerChar]);
  AlphaNumChar = frequency([1, NumChar], [9, AlphaChar]);
  AlphaStr = transform(join, repeat(AlphaChar));
  NumStr = transform(join, repeat(NumChar));
  AlphaNumStr = transform(join, repeat(AlphaNumChar));
  Id = (start = frequency([1, '_'], [2, '$'], [9, AlphaChar]), chars = frequency([1, NumChar], [9, start]), rest = transform(join, repeat(chars)), label('id', transform(join, sequence(start, rest))));
  List = function(){
    var as;
    as = slice$.call(arguments);
    return repeat(choice.apply(null, as));
  };
  Map = function(){
    var as;
    as = slice$.call(arguments);
    return transform(toObject, repeat(sequence(Id, choice.apply(null, as))));
  };
  Nothing = choice(Null, Undefined);
  Falsy = choice(Nothing, false, 0, '');
  Any = choice(Nothing, Bool, Num, Str, recursive(function(){
    return List(Any);
  }), recursive(function(){
    return Map(Any);
  }));
  module.exports = {
    Null: Null,
    Undefined: Undefined,
    Bool: Bool,
    Num: Num,
    Byte: Byte,
    Char: Char,
    Str: Str,
    Int: Int,
    UInt: UInt,
    Positive: Positive,
    Negative: Negative,
    NumChar: NumChar,
    UpperChar: UpperChar,
    LowerChar: LowerChar,
    AlphaChar: AlphaChar,
    AlphaNumChar: AlphaNumChar,
    AlphaStr: AlphaStr,
    NumStr: NumStr,
    AlphaNumStr: AlphaNumStr,
    Id: Id,
    Array: List,
    Object: Map,
    Nothing: Nothing,
    Falsy: Falsy,
    Any: Any
  };
}).call(this);

},{"./random":6,"./generating":4}],6:[function(require,module,exports){(function(){
  var floor, random, choose, chooseInt, pickOne;
  floor = Math.floor, random = Math.random;
  choose = function(a, b){
    return random() * (b - a) + a;
  };
  chooseInt = function(a, b){
    return floor(choose(a, b));
  };
  pickOne = function(as){
    return as[chooseInt(0, as.length)];
  };
  module.exports = {
    choose: choose,
    chooseInt: chooseInt,
    pickOne: pickOne
  };
}).call(this);

},{}],2:[function(require,module,exports){(function(){
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
      var this$ = this;
      return function(){
        return test(config, this$);
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

},{"./check":3,"boo":7}],3:[function(require,module,exports){(function(){
  var makeError, Base, ref$, values, reduce, sortBy, map, frozen, keys, round, defaultConfig, EFailure, EAbandoned, percentage, withDefaults, status, failedP, describeVerdict, describeIgnored, labelHistogram, describeFailures, describeReport, Report, check, test;
  makeError = require('flaw');
  Base = require('boo').Base;
  ref$ = require('prelude-ls'), values = ref$.values, reduce = ref$.reduce, sortBy = ref$.sortBy, map = ref$.map;
  frozen = Object.freeze;
  keys = Object.keys;
  round = Math.round;
  defaultConfig = {
    times: 100,
    verbose: false
  };
  EFailure = makeError('<property failed>');
  EAbandoned = makeError('<property abandoned>');
  percentage = function(num, total){
    return round((num / total) * 100);
  };
  withDefaults = function(config){
    config == null && (config = {});
    return import$(import$({}, defaultConfig), config);
  };
  status = function(result){
    return result.kind || 'rejected';
  };
  failedP = function(result){
    var ref$;
    return (ref$ = status(result)) == 'failed' || ref$ == 'rejected';
  };
  describeVerdict = function(report){
    var passed, failed, all, ignored;
    passed = report.passed.length;
    failed = report.failed.length;
    all = report.all.length;
    ignored = report.ignored.length;
    switch (report.verdict) {
    case 'passed':
      return "+ OK passed " + passed + " tests.";
    case 'failed':
      return "! Falsified after " + (all - ignored) + " tests, " + failed + " failed.";
    case 'abandoned':
      return "? Aborted after " + all + " tests.";
    default:
      return "/ Unknown verdict. Likely this test report lacks any data.";
    }
  };
  describeIgnored = function(report){
    var ignored, ignoredPct;
    ignored = report.ignored.length;
    ignoredPct = percentage(ignored, report.all.length);
    if (ignoredPct > 50) {
      return ignored + " (" + ignoredPct + "%) tests ignored.";
    } else {
      return '';
    }
  };
  labelHistogram = function(report){
    var total, labels, k, v;
    total = report.all.length;
    labels = map(function(arg$){
      var p, key;
      p = arg$[0], key = arg$[1];
      return "o " + p + "% - " + key;
    })(
    sortBy(function(x, y){
      return x < y;
    })(
    (function(){
      var ref$, results$ = [];
      for (k in ref$ = report.labels) {
        v = ref$[k];
        results$.push([percentage(v.length, total), k]);
      }
      return results$;
    }())));
    if (labels.length) {
      return "> Collected test data:\n    " + labels.join('\n    ');
    } else {
      return '';
    }
  };
  describeFailures = function(report){
    var label, errorFor, arg, rejectionFor, errors;
    label = function(as){
      switch (false) {
      case !as.length:
        return "» The following labels were provided: " + JSON.stringify(as);
      default:
        return '';
      }
    };
    errorFor = function(kind, e){
      switch (false) {
      case kind !== 'failed':
        return "» Threw " + ((e != null ? e.stack : void 8) || e) + "\n";
      default:
        return '';
      }
    };
    arg = function(a, n){
      return "  " + n + " - " + JSON.stringify(a.value) + " (" + a.generator + ")";
    };
    rejectionFor = function(kind, e){
      if (kind !== 'rejected') {
        return '';
      } else {
        return "» Reason: " + JSON.stringify(e.value) + "\n";
      }
    };
    errors = report.failed.map(function(a, n){
      return ": Failure #" + (n + 1) + " -----------------------------------------------------------\n  " + rejectionFor(a.kind, a) + "\n  " + label(a.labels) + "\n  " + errorFor(a.kind, a.value) + "\n  » The following arguments were provided:\n  " + a.arguments.map(arg).join('\n  ');
    });
    switch (false) {
    case !errors.join('').trim():
      return errors.join('\n---\n');
    default:
      return '';
    }
  };
  describeReport = curry$(function(verbose, report){
    var text, total, ignored, ignoredPct, hasLabels;
    text = (report + "").split(/\n/).map(function(s){
      return "  " + s;
    }).join('\n');
    total = report.all.length;
    ignored = report.ignored.length;
    ignoredPct = percentage(ignored, total);
    hasLabels = !!keys(report.labels).length;
    if (verbose || ignoredPct > 50 || hasLabels) {
      return typeof console != 'undefined' && console !== null ? console.log(text) : void 8;
    }
  });
  Report = Base.derive({
    init: function(property){
      this.property = property;
      this.passed = [];
      this.failed = [];
      this.ignored = [];
      this.all = [];
      this.labels = {};
      return this.verdict = null;
    },
    add: function(result){
      var this$ = this;
      this.all.push(result);
      result.labels.map(function(a){
        var ref$, key$;
        return ((ref$ = this$.labels)[key$ = a + ""] || (ref$[key$] = [])).push(result);
      });
      switch (status(result)) {
      case 'held':
        return this.passed.push(result);
      case 'failed':
        return this.failed.push(result);
      case 'rejected':
        return this.failed.push(result);
      case 'ignored':
        return this.ignored.push(result);
      }
    },
    toString: function(){
      return "" + describeVerdict(this) + " " + describeIgnored(this) + "\n" + labelHistogram(this) + "\n" + describeFailures(this);
    }
  });
  check = curry$(function(max, property){
    var report, ignored, shouldRun, result;
    report = Report.make(property);
    ignored = 0;
    shouldRun = true;
    while (max && shouldRun) {
      result = property.run();
      report.add(result);
      switch (status(result)) {
      case 'held':
        --max;
        break;
      case 'rejected':
        shouldRun = false;
        break;
      case 'failed':
        shouldRun = false;
        break;
      case 'ignored':
        if (++ignored > 1000) {
          shouldRun = false;
        }
      }
    }
    report.verdict = (function(){
      switch (false) {
      case !(ignored > 1000):
        return 'abandoned';
      case !(max > 0):
        return 'failed';
      default:
        return 'passed';
      }
    }());
    return frozen(report);
  });
  test = curry$(function(config, property){
    var c, report;
    c = withDefaults(config);
    report = check(c.times, property);
    switch (report.verdict) {
    case 'passed':
      return describeReport(c.verbose, report);
    case 'failed':
      throw EFailure(report);
    case 'abandoned':
      throw EAbandoned(report);
    }
  });
  module.exports = {
    check: check,
    test: test,
    Report: Report
  };
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
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

},{"flaw":8,"boo":7,"prelude-ls":9}],4:[function(require,module,exports){(function(){
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

},{"./random":6,"boo":7,"prelude-ls":9}],7:[function(require,module,exports){/// boo.js --- Base primitives for prototypical OO
//
// Copyright (c) 2011 Quildreen "Sorella" Motta <quildreen@gmail.com>
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation files
// (the "Software"), to deal in the Software without restriction,
// including without limitation the rights to use, copy, modify, merge,
// publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

/// Module boo
void function(root, exports) {

  //// -- Aliases -------------------------------------------------------------
  var slice        = [].slice
  var keys         = Object.keys
  var inherit      = Object.create
  var define       = Object.defineProperty
  var descriptor   = Object.getOwnPropertyDescriptor
  var has_getter_p = function () {
                       try {
                         return true === Object.create( {}
                                                      , { x: { get:
                                                               function(){
                                                                 return true }}}).x }
                       catch(e){ return false }}()


  
  //// -- Interfaces ----------------------------------------------------------

  ///// Interface DataObject
  // DataObject :: { "to_data" -> () -> Object }

  ///// Interface Mixin
  // Mixin :: Object | DataObject

  
  //// -- Helpers -------------------------------------------------------------

  ///// Function copy_property
  // :internal:
  // Copies a property from ``source`' to ``target`'.
  //
  // copy_property! :: Object, target:Object*, String -> target
  function copy_property(source, target, property) {
    !has_getter_p?     target[property] = source[property]
    : /* otherwise */  define(target, property, descriptor(source, property))

    return target
  }

  ///// Function data_obj_p
  // :internal:
  // Checks if the given subject matches the ``DataObject`` interface
  //
  // data_obj_p :: Any -> Bool
  function data_obj_p(subject) {
    return subject != null
    &&     typeof subject.to_data == 'function' }


  ///// Function resolve_mixins
  // :internal:
  // Returns the proper object for the given mixin.
  //
  // resolve_mixin :: Mixin -> Object
  function resolve_mixin(subject) {
    return data_obj_p(subject)?  subject.to_data()
    :      /* otherwise */       subject }


  ///// Function fast_extend
  // :internal:
  // Extends the target object with the provided mixins, using a
  // right-most precedence rule — when a there's a property conflict, the
  // property defined in the last object wins.
  //
  // ``DataObject``s are properly handled by the ``resolve_mixin``
  // function.
  //
  // :warning: low-level
  //    This function is not meant to be called directly from end-user
  //    code, use the ``extend`` function instead.
  //
  // fast_extend! :: target:Object*, [Mixin] -> target
  function fast_extend(object, mixins) {
    var i, j, len, mixin, props, key
    for (i = 0, len = mixins.length; i < len; ++i) {
      mixin = resolve_mixin(mixins[i])
      props = keys(mixin)
      for (j = props.length; j--;) {
        key         = props[j]
        copy_property(mixin, object, key) }}

    return object }


  
  //// -- Basic primitives ----------------------------------------------------

  ///// Function extend
  // Extends the target object with the provided mixins, using a
  // right-most precedence rule.
  //
  // :see-also:
  //   - ``fast_extend`` — lower level function.
  //   - ``merge``       — pure version.
  //
  // extend! :: target:Object*, Mixin... -> target
  function extend(target) {
    return fast_extend(target, slice.call(arguments, 1)) }


  ///// Function merge
  // Creates a new object that merges the provided mixins, using a
  // right-most precedence rule.
  //
  // :see-also:
  //   - ``extend`` — impure version.
  //
  // merge :: Mixin... -> Object
  function merge() {
    return fast_extend({}, arguments) }


  ///// Function derive
  // Creates a new object inheriting from the given prototype and extends
  // the new instance with the provided mixins.
  //
  // derive :: proto:Object, Mixin... -> Object <| proto
  function derive(proto) {
    return fast_extend(inherit(proto), slice.call(arguments, 1)) }


  ///// Function make
  // Constructs a new instance of the given object.
  //
  // If the object provides an ``init`` function, that function is
  // invoked to do initialisation on the new instance.
  //
  // make :: proto:Object, Any... -> Object <| proto
  function make(base) {
    return Base.make.apply(base, slice.call(arguments, 1)) }


  
  //// -- Root object ---------------------------------------------------------

  ///// Object Base
  // The root object for basing all the OOP code. Provides the previous
  // primitive combinators in an easy and OOP-way.
  var Base = {

    ////// Function make
    // Constructs new instances of the object the function is being
    // applied to.
    //
    // If the object provides an ``init`` function, that function is
    // invoked to do initialisation on the new instance.
    //
    // make :: @this:Object, Any... -> Object <| this
    make:
    function _make() {
      var result = inherit(this)
      if (typeof result.init == 'function')
        result.init.apply(result, arguments)

      return result }

    ////// Function derive
    // Constructs a new object that inherits from the object this function
    // is being applied to, and extends it with the provided mixins.
    //
    // derive :: @this:Object, Mixin... -> Object <| this
  , derive:
    function _derive() {
      return fast_extend(inherit(this), arguments) }}


  
  //// -- Exports -------------------------------------------------------------
  exports.extend   = extend
  exports.merge    = merge
  exports.derive   = derive
  exports.make     = make
  exports.Base     = Base
  exports.internal = { data_obj_p    : data_obj_p
                     , fast_extend   : fast_extend
                     , resolve_mixin : resolve_mixin
                     , copy_property : copy_property
                     }

}
( this
, typeof exports == 'undefined'?  this.boo = this.boo || {}
  /* otherwise, yay modules! */:  exports
)

},{}],8:[function(require,module,exports){(function(){
  var makeFrom, make, raise;
  makeFrom = curry$(function(type, name, message){
    var options, ref$;
    options = arguments[3] || {};
    return import$((ref$ = type.call(clone$(type.prototype), message), ref$.name = name, ref$), options);
  });
  make = curry$(function(name, message){
    return makeFrom(Error, name, message, arguments[2]);
  });
  raise = function(error){
    throw error;
  };
  module.exports = (make.from = makeFrom, make.raise = raise, make.make = make, make);
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
  function clone$(it){
    function fun(){} fun.prototype = it;
    return new fun;
  }
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

},{}],9:[function(require,module,exports){// prelude.ls 0.6.0
// Copyright (c) 2012 George Zahariev
// Released under the MIT License
// raw.github.com/gkz/prelude-ls/master/LICNSE
var objToFunc, each, map, filter, reject, partition, find, first, head, tail, last, initial, empty, values, keys, length, cons, append, join, reverse, foldl, fold, foldl1, fold1, foldr, foldr1, unfoldr, andList, orList, any, all, unique, sort, sortBy, compare, sum, product, average, mean, concat, concatMap, listToObj, maximum, minimum, scanl, scan, scanl1, scan1, scanr, scanr1, replicate, take, drop, splitAt, takeWhile, dropWhile, span, breakIt, zip, zipWith, zipAll, zipAllWith, compose, curry, id, flip, fix, lines, unlines, words, unwords, max, min, negate, abs, signum, quot, rem, div, mod, recip, pi, tau, exp, sqrt, ln, pow, sin, tan, cos, asin, acos, atan, atan2, truncate, round, ceiling, floor, isItNaN, even, odd, gcd, lcm, toString$ = {}.toString, slice$ = [].slice;
exports.objToFunc = objToFunc = function(obj){
  return function(key){
    return obj[key];
  };
};
exports.each = each = curry$(function(f, xs){
  var i$, x, len$;
  if (toString$.call(xs).slice(8, -1) === 'Object') {
    for (i$ in xs) {
      x = xs[i$];
      f(x);
    }
  } else {
    for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
      x = xs[i$];
      f(x);
    }
  }
  return xs;
});
exports.map = map = curry$(function(f, xs){
  var type, key, x, res$, i$, len$, result, results$ = {};
  if (toString$.call(f).slice(8, -1) !== 'Function') {
    f = objToFunc(f);
  }
  type = toString$.call(xs).slice(8, -1);
  if (type === 'Object') {
    for (key in xs) {
      x = xs[key];
      results$[key] = f(x);
    }
    return results$;
  } else {
    res$ = [];
    for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
      x = xs[i$];
      res$.push(f(x));
    }
    result = res$;
    if (type === 'String') {
      return result.join('');
    } else {
      return result;
    }
  }
});
exports.filter = filter = curry$(function(f, xs){
  var type, key, x, res$, i$, len$, result, results$ = {};
  if (toString$.call(f).slice(8, -1) !== 'Function') {
    f = objToFunc(f);
  }
  type = toString$.call(xs).slice(8, -1);
  if (type === 'Object') {
    for (key in xs) {
      x = xs[key];
if (f(x)) {
        results$[key] = x;
      }
    }
    return results$;
  } else {
    res$ = [];
    for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
      x = xs[i$];
      if (f(x)) {
        res$.push(x);
      }
    }
    result = res$;
    if (type === 'String') {
      return result.join('');
    } else {
      return result;
    }
  }
});
exports.reject = reject = curry$(function(f, xs){
  var type, key, x, res$, i$, len$, result, results$ = {};
  if (toString$.call(f).slice(8, -1) !== 'Function') {
    f = objToFunc(f);
  }
  type = toString$.call(xs).slice(8, -1);
  if (type === 'Object') {
    for (key in xs) {
      x = xs[key];
if (!f(x)) {
        results$[key] = x;
      }
    }
    return results$;
  } else {
    res$ = [];
    for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
      x = xs[i$];
      if (!f(x)) {
        res$.push(x);
      }
    }
    result = res$;
    if (type === 'String') {
      return result.join('');
    } else {
      return result;
    }
  }
});
exports.partition = partition = curry$(function(f, xs){
  var type, passed, failed, key, x, i$, len$;
  if (toString$.call(f).slice(8, -1) !== 'Function') {
    f = objToFunc(f);
  }
  type = toString$.call(xs).slice(8, -1);
  if (type === 'Object') {
    passed = {};
    failed = {};
    for (key in xs) {
      x = xs[key];
      (f(x) ? passed : failed)[key] = x;
    }
  } else {
    passed = [];
    failed = [];
    for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
      x = xs[i$];
      (f(x) ? passed : failed).push(x);
    }
    if (type === 'String') {
      passed = passed.join('');
      failed = failed.join('');
    }
  }
  return [passed, failed];
});
exports.find = find = curry$(function(f, xs){
  var i$, x, len$;
  if (toString$.call(f).slice(8, -1) !== 'Function') {
    f = objToFunc(f);
  }
  if (toString$.call(xs).slice(8, -1) === 'Object') {
    for (i$ in xs) {
      x = xs[i$];
      if (f(x)) {
        return x;
      }
    }
  } else {
    for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
      x = xs[i$];
      if (f(x)) {
        return x;
      }
    }
  }
});
exports.head = head = exports.first = first = function(xs){
  if (!xs.length) {
    return;
  }
  return xs[0];
};
exports.tail = tail = function(xs){
  if (!xs.length) {
    return;
  }
  return xs.slice(1);
};
exports.last = last = function(xs){
  if (!xs.length) {
    return;
  }
  return xs[xs.length - 1];
};
exports.initial = initial = function(xs){
  if (!xs.length) {
    return;
  }
  return xs.slice(0, xs.length - 1);
};
exports.empty = empty = function(xs){
  var x;
  if (toString$.call(xs).slice(8, -1) === 'Object') {
    for (x in xs) {
      return false;
    }
    return true;
  }
  return !xs.length;
};
exports.values = values = function(obj){
  var i$, x, results$ = [];
  for (i$ in obj) {
    x = obj[i$];
    results$.push(x);
  }
  return results$;
};
exports.keys = keys = function(obj){
  var x, results$ = [];
  for (x in obj) {
    results$.push(x);
  }
  return results$;
};
exports.length = length = function(xs){
  if (toString$.call(xs).slice(8, -1) === 'Object') {
    xs = values(xs);
  }
  return xs.length;
};
exports.cons = cons = curry$(function(x, xs){
  if (toString$.call(xs).slice(8, -1) === 'String') {
    return x + xs;
  } else {
    return [x].concat(xs);
  }
});
exports.append = append = curry$(function(xs, ys){
  if (toString$.call(ys).slice(8, -1) === 'String') {
    return xs + ys;
  } else {
    return xs.concat(ys);
  }
});
exports.join = join = curry$(function(sep, xs){
  if (toString$.call(xs).slice(8, -1) === 'Object') {
    xs = values(xs);
  }
  return xs.join(sep);
});
exports.reverse = reverse = function(xs){
  if (toString$.call(xs).slice(8, -1) === 'String') {
    return xs.split('').reverse().join('');
  } else {
    return xs.slice().reverse();
  }
};
exports.fold = fold = exports.foldl = foldl = curry$(function(f, memo, xs){
  var i$, x, len$;
  if (toString$.call(xs).slice(8, -1) === 'Object') {
    for (i$ in xs) {
      x = xs[i$];
      memo = f(memo, x);
    }
  } else {
    for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
      x = xs[i$];
      memo = f(memo, x);
    }
  }
  return memo;
});
exports.fold1 = fold1 = exports.foldl1 = foldl1 = curry$(function(f, xs){
  return fold(f, xs[0], xs.slice(1));
});
exports.foldr = foldr = curry$(function(f, memo, xs){
  return fold(f, memo, xs.reverse());
});
exports.foldr1 = foldr1 = curry$(function(f, xs){
  xs.reverse();
  return fold(f, xs[0], xs.slice(1));
});
exports.unfoldr = exports.unfold = unfoldr = curry$(function(f, b){
  var that;
  if ((that = f(b)) != null) {
    return [that[0]].concat(unfoldr(f, that[1]));
  } else {
    return [];
  }
});
exports.andList = andList = function(xs){
  return fold(function(memo, x){
    return memo && x;
  }, true, xs);
};
exports.orList = orList = function(xs){
  return fold(function(memo, x){
    return memo || x;
  }, false, xs);
};
exports.any = any = curry$(function(f, xs){
  if (toString$.call(f).slice(8, -1) !== 'Function') {
    f = objToFunc(f);
  }
  return fold(function(memo, x){
    return memo || f(x);
  }, false, xs);
});
exports.all = all = curry$(function(f, xs){
  if (toString$.call(f).slice(8, -1) !== 'Function') {
    f = objToFunc(f);
  }
  return fold(function(memo, x){
    return memo && f(x);
  }, true, xs);
});
exports.unique = unique = function(xs){
  var result, i$, x, len$;
  result = [];
  if (toString$.call(xs).slice(8, -1) === 'Object') {
    for (i$ in xs) {
      x = xs[i$];
      if (!in$(x, result)) {
        result.push(x);
      }
    }
  } else {
    for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
      x = xs[i$];
      if (!in$(x, result)) {
        result.push(x);
      }
    }
  }
  if (toString$.call(xs).slice(8, -1) === 'String') {
    return result.join('');
  } else {
    return result;
  }
};
exports.sort = sort = function(xs){
  return xs.concat().sort(function(x, y){
    switch (false) {
    case !(x > y):
      return 1;
    case !(x < y):
      return -1;
    default:
      return 0;
    }
  });
};
exports.sortBy = sortBy = curry$(function(f, xs){
  if (!xs.length) {
    return [];
  }
  return xs.concat().sort(f);
});
exports.compare = compare = curry$(function(f, x, y){
  switch (false) {
  case !(f(x) > f(y)):
    return 1;
  case !(f(x) < f(y)):
    return -1;
  default:
    return 0;
  }
});
exports.sum = sum = function(xs){
  var result, i$, x, len$;
  result = 0;
  if (toString$.call(xs).slice(8, -1) === 'Object') {
    for (i$ in xs) {
      x = xs[i$];
      result += x;
    }
  } else {
    for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
      x = xs[i$];
      result += x;
    }
  }
  return result;
};
exports.product = product = function(xs){
  var result, i$, x, len$;
  result = 1;
  if (toString$.call(xs).slice(8, -1) === 'Object') {
    for (i$ in xs) {
      x = xs[i$];
      result *= x;
    }
  } else {
    for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
      x = xs[i$];
      result *= x;
    }
  }
  return result;
};
exports.mean = mean = exports.average = average = function(xs){
  return sum(xs) / length(xs);
};
exports.concat = concat = function(xss){
  return fold(append, [], xss);
};
exports.concatMap = concatMap = curry$(function(f, xs){
  return concat(map(f, xs));
});
exports.listToObj = listToObj = function(xs){
  var result, i$, len$, x;
  result = {};
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    result[x[0]] = x[1];
  }
  return result;
};
exports.maximum = maximum = function(xs){
  return fold1(max, xs);
};
exports.minimum = minimum = function(xs){
  return fold1(min, xs);
};
exports.scan = scan = exports.scanl = scanl = curry$(function(f, memo, xs){
  var last, x;
  last = memo;
  if (toString$.call(xs).slice(8, -1) === 'Object') {
    return [memo].concat((function(){
      var i$, ref$, results$ = [];
      for (i$ in ref$ = xs) {
        x = ref$[i$];
        results$.push(last = f(last, x));
      }
      return results$;
    }()));
  } else {
    return [memo].concat((function(){
      var i$, ref$, len$, results$ = [];
      for (i$ = 0, len$ = (ref$ = xs).length; i$ < len$; ++i$) {
        x = ref$[i$];
        results$.push(last = f(last, x));
      }
      return results$;
    }()));
  }
});
exports.scan1 = scan1 = exports.scanl1 = scanl1 = curry$(function(f, xs){
  return scan(f, xs[0], xs.slice(1));
});
exports.scanr = scanr = curry$(function(f, memo, xs){
  xs.reverse();
  return scan(f, memo, xs).reverse();
});
exports.scanr1 = scanr1 = curry$(function(f, xs){
  xs.reverse();
  return scan(f, xs[0], xs.slice(1)).reverse();
});
exports.replicate = replicate = curry$(function(n, x){
  var result, i;
  result = [];
  i = 0;
  for (; i < n; ++i) {
    result.push(x);
  }
  return result;
});
exports.take = take = curry$(function(n, xs){
  switch (false) {
  case !(n <= 0):
    if (toString$.call(xs).slice(8, -1) === 'String') {
      return '';
    } else {
      return [];
    }
    break;
  case !!xs.length:
    return xs;
  default:
    return xs.slice(0, n);
  }
});
exports.drop = drop = curry$(function(n, xs){
  switch (false) {
  case !(n <= 0):
    return xs;
  case !!xs.length:
    return xs;
  default:
    return xs.slice(n);
  }
});
exports.splitAt = splitAt = curry$(function(n, xs){
  return [take(n, xs), drop(n, xs)];
});
exports.takeWhile = takeWhile = curry$(function(p, xs){
  var result, i$, len$, x;
  if (!xs.length) {
    return xs;
  }
  if (toString$.call(p).slice(8, -1) !== 'Function') {
    p = objToFunc(p);
  }
  result = [];
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    if (!p(x)) {
      break;
    }
    result.push(x);
  }
  if (toString$.call(xs).slice(8, -1) === 'String') {
    return result.join('');
  } else {
    return result;
  }
});
exports.dropWhile = dropWhile = curry$(function(p, xs){
  var i, i$, len$, x;
  if (!xs.length) {
    return xs;
  }
  if (toString$.call(p).slice(8, -1) !== 'Function') {
    p = objToFunc(p);
  }
  i = 0;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    if (!p(x)) {
      break;
    }
    ++i;
  }
  return drop(i, xs);
});
exports.span = span = curry$(function(p, xs){
  return [takeWhile(p, xs), dropWhile(p, xs)];
});
exports.breakIt = breakIt = curry$(function(p, xs){
  return span(compose$([not$, p]), xs);
});
exports.zip = zip = curry$(function(xs, ys){
  var result, i, ref$, len$, zs, j, len1$, z, ref1$;
  result = [];
  for (i = 0, len$ = (ref$ = [xs, ys]).length; i < len$; ++i) {
    zs = ref$[i];
    for (j = 0, len1$ = zs.length; j < len1$; ++j) {
      z = zs[j];
      if (i === 0) {
        result.push([]);
      }
      if ((ref1$ = result[j]) != null) {
        ref1$.push(z);
      }
    }
  }
  return result;
});
exports.zipWith = zipWith = curry$(function(f, xs, ys){
  var i$, ref$, len$, zs, results$ = [];
  if (toString$.call(f).slice(8, -1) !== 'Function') {
    f = objToFunc(f);
  }
  if (!xs.length || !ys.length) {
    return [];
  } else {
    for (i$ = 0, len$ = (ref$ = zip.call(this, xs, ys)).length; i$ < len$; ++i$) {
      zs = ref$[i$];
      results$.push(f.apply(this, zs));
    }
    return results$;
  }
});
exports.zipAll = zipAll = function(){
  var xss, result, i, len$, xs, j, len1$, x, ref$;
  xss = slice$.call(arguments);
  result = [];
  for (i = 0, len$ = xss.length; i < len$; ++i) {
    xs = xss[i];
    for (j = 0, len1$ = xs.length; j < len1$; ++j) {
      x = xs[j];
      if (i === 0) {
        result.push([]);
      }
      if ((ref$ = result[j]) != null) {
        ref$.push(x);
      }
    }
  }
  return result;
};
exports.zipAllWith = zipAllWith = function(f){
  var xss, i$, ref$, len$, xs, results$ = [];
  xss = slice$.call(arguments, 1);
  if (toString$.call(f).slice(8, -1) !== 'Function') {
    f = objToFunc(f);
  }
  if (!xss[0].length || !xss[1].length) {
    return [];
  } else {
    for (i$ = 0, len$ = (ref$ = zipAll.apply(this, xss)).length; i$ < len$; ++i$) {
      xs = ref$[i$];
      results$.push(f.apply(this, xs));
    }
    return results$;
  }
};
exports.compose = compose = function(){
  var funcs;
  funcs = slice$.call(arguments);
  return function(){
    var args, i$, ref$, len$, f;
    args = arguments;
    for (i$ = 0, len$ = (ref$ = funcs).length; i$ < len$; ++i$) {
      f = ref$[i$];
      args = [f.apply(this, args)];
    }
    return args[0];
  };
};
exports.curry = curry = function(f){
  return curry$(f);
};
exports.id = id = function(x){
  return x;
};
exports.flip = flip = curry$(function(f, x, y){
  return f(y, x);
});
exports.fix = fix = function(f){
  return function(g, x){
    return function(){
      return f(g(g)).apply(null, arguments);
    };
  }(function(g, x){
    return function(){
      return f(g(g)).apply(null, arguments);
    };
  });
};
exports.lines = lines = function(str){
  if (!str.length) {
    return [];
  }
  return str.split('\n');
};
exports.unlines = unlines = function(strs){
  return strs.join('\n');
};
exports.words = words = function(str){
  if (!str.length) {
    return [];
  }
  return str.split(/[ ]+/);
};
exports.unwords = unwords = function(strs){
  return strs.join(' ');
};
exports.max = max = curry$(function(x, y){
  if (x > y) {
    return x;
  } else {
    return y;
  }
});
exports.min = min = curry$(function(x, y){
  if (x > y) {
    return y;
  } else {
    return x;
  }
});
exports.negate = negate = function(x){
  return -x;
};
exports.abs = abs = Math.abs;
exports.signum = signum = function(x){
  switch (false) {
  case !(x < 0):
    return -1;
  case !(x > 0):
    return 1;
  default:
    return 0;
  }
};
exports.quot = quot = curry$(function(x, y){
  return ~~(x / y);
});
exports.rem = rem = curry$(function(x, y){
  return x % y;
});
exports.div = div = curry$(function(x, y){
  return Math.floor(x / y);
});
exports.mod = mod = curry$(function(x, y){
  var ref$;
  return ((x) % (ref$ = y) + ref$) % ref$;
});
exports.recip = recip = function(x){
  return 1 / x;
};
exports.pi = pi = Math.PI;
exports.tau = tau = pi * 2;
exports.exp = exp = Math.exp;
exports.sqrt = sqrt = Math.sqrt;
exports.ln = ln = Math.log;
exports.pow = pow = curry$(function(x, y){
  return Math.pow(x, y);
});
exports.sin = sin = Math.sin;
exports.tan = tan = Math.tan;
exports.cos = cos = Math.cos;
exports.asin = asin = Math.asin;
exports.acos = acos = Math.acos;
exports.atan = atan = Math.atan;
exports.atan2 = atan2 = curry$(function(x, y){
  return Math.atan2(x, y);
});
exports.truncate = truncate = function(x){
  return ~~x;
};
exports.round = round = Math.round;
exports.ceiling = ceiling = Math.ceil;
exports.floor = floor = Math.floor;
exports.isItNaN = isItNaN = function(x){
  return x !== x;
};
exports.even = even = function(x){
  return x % 2 === 0;
};
exports.odd = odd = function(x){
  return x % 2 !== 0;
};
exports.gcd = gcd = curry$(function(x, y){
  var z;
  x = Math.abs(x);
  y = Math.abs(y);
  while (y !== 0) {
    z = x % y;
    x = y;
    y = z;
  }
  return x;
});
exports.lcm = lcm = curry$(function(x, y){
  return Math.abs(Math.floor(x / gcd(x, y) * y));
});
exports.installPrelude = function(target){
  var ref$;
  if (!((ref$ = target.prelude) != null && ref$.isInstalled)) {
    import$(target, exports);
    target.prelude.isInstalled = true;
  }
};
exports.prelude = exports;
function curry$(f, args){
  return f.length > 1 ? function(){
    var params = args ? args.concat() : [];
    return params.push.apply(params, arguments) < f.length && arguments.length ?
      curry$.call(this, f, params) : f.apply(this, params);
  } : f;
}
function in$(x, arr){
  var i = 0, l = arr.length >>> 0;
  while (i < l) if (x === arr[i++]) return true;
  return false;
}
function compose$(fs){
  return function(){
    var i, args = arguments;
    for (i = fs.length; i > 0; --i) { args = [fs[i-1].apply(this, args)]; }
    return args[0];
  };
}
function not$(x){ return !x; }
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
},{}]},{},[1]);