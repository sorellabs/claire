(function(){
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
