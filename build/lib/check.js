(function(){
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
