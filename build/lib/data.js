(function(){
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
