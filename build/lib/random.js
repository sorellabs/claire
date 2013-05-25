(function(){
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
