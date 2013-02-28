(function(){
  var Base, ref$, values, reduce, frozen, round, percentage, status, failedP, describeVeredict, describeIgnored, labelHistogram, describeFailures, Report, check;
  Base = require('boo').Base;
  ref$ = require('prelude-ls'), values = ref$.values, reduce = ref$.reduce;
  frozen = Object.freeze;
  round = Math.round;
  percentage = function(num, total){
    return round((num / total) * 100);
  };
  status = function(result){
    switch (false) {
    case result.ok !== true:
      return 'passed';
    case result.ok !== false:
      return 'failed';
    default:
      return 'ignored';
    }
  };
  failedP = function(result){
    return result.ok === false;
  };
  describeVeredict = function(report){
    var passed, failed, all, ignored;
    passed = report.passed.length;
    failed = report.failed.length;
    all = report.all.length;
    ignored = report.ignored.length;
    switch (report.veredict) {
    case 'passed':
      return "+ OK passed " + passed + " tests.";
    case 'failed':
      return "! Falsified after " + (all - ignored) + " tests, " + failed + " failed.";
    case 'abandoned':
      return "? Aborted after " + all + " tests.";
    default:
      return "/ Unknown veredict. Likely this test report lacks any data.";
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
    var total, labels, res$, k, ref$, v;
    total = report.all.length;
    res$ = [];
    for (k in ref$ = report.labels) {
      v = ref$[k];
      res$.push("o " + percentage(v.length, total) + "% - " + k);
    }
    labels = res$;
    if (labels.length) {
      return "> Collected test data:\n    " + labels.join('\n    ');
    } else {
      return '';
    }
  };
  describeFailures = function(report){
    var label, arg, errors;
    label = function(as){
      switch (false) {
      case !as.length:
        return ": The following labels were provided: " + JSON.stringify(as);
      default:
        return '';
      }
    };
    arg = function(a, n){
      return "  " + n + " - " + a.value + " (" + a.generator + ")";
    };
    errors = report.failed.map(function(a, n){
      return ": Failure #" + (n + 1) + "\n" + label(a.labels) + "\n: The following arguments were provided:\n" + a.arguments.map(arg).join('\n  ');
    });
    switch (false) {
    case !errors.join('').trim():
      return errors.join('\n---\n');
    default:
      return '';
    }
  };
  Report = Base.derive({
    init: function(property){
      this.property = property;
      this.passed = [];
      this.failed = [];
      this.ignored = [];
      this.all = [];
      this.labels = {};
      return this.veredict = null;
    },
    add: function(result){
      var this$ = this;
      this.all.push(result);
      result.labels.map(function(a){
        var ref$, key$;
        return ((ref$ = this$.labels)[key$ = a + ""] || (ref$[key$] = [])).push(result);
      });
      switch (status(result)) {
      case 'passed':
        return this.passed.push(result);
      case 'failed':
        return this.failed.push(result);
      case 'ignored':
        return this.ignored.push(result);
      }
    },
    toString: function(){
      return "" + describeVeredict(this) + " " + describeIgnored(this) + "\n" + labelHistogram(this) + "\n" + describeFailures(this);
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
      case 'passed':
        --max;
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
    report.veredict = (function(){
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
  module.exports = {
    check: check
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
