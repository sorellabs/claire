Claire
======

[![Build Status](https://travis-ci.org/killdream/claire.png)](https://travis-ci.org/killdream/claire)


Claire is a random testing library for both property-based testing
(QuickCheck-like) and random program generation (ScalaCheck command's
like), which allows you to express your code's behaviours and invariants
in a clear way.


### Example

These uses the Claire API to collect data about a test. To have something that
makes sense of the collected data and works out of the box for testing, check
out [Claire for Mocha][claire-mocha].

```js
var claire = require('claire')
var _      = claire.data

// Simple universal quantifier
var concat_p = claire.forAll ( _.List(_.Int), _.List(_.Int) )
                     .satisfy(function(xs, ys) {
                                return xs.length + ys.length
                                    == xs.concat(ys).length })

// Checking returns a Report with meta-data about the tests.
claire.check(100, concat_p)
// (Object <| Report) => { property: { invariant: [Function] }
//                       , passed: [ { ok: true, labels: [], arguments: [Object] }, ... ]
//                       , failed: []
//                       , ignored: []
//                       , all: [ { ok: true, labels: [], arguments: [Object] }, ... ]
//                       , labels: {}
//                       , veredict: 'passed' }


// Conditional properties
var sqrt_p = claire.forAll ( _.Int )
                   .given  (function(n){ return n > 0 })
                   .satisfy(function(n){ return Math.sqrt(n * n) == n })

// The report can be made human-readable by just calling `.toString()'
claire.check(100, sqrt_p).toString()
// (String) => "+ OK passed 100 tests. 129 (56%) tests ignored."


// Data classifiers
var reverse_p = claire.forAll ( _.List(_.Int), _.List(_.Int) )
                      .satisfy(function(xs, ys) {
                                 (reverse(xs.concat(ys)) + '')
                                 == (reverse(ys).concat(reverse(xs)) + '') })
                      .classify(function(xs, ys) {
                                  return xs.length == 0? 'trivial'
                                       : ys.length == 0? 'trivial'
                                       : /* otherwise */ 'ok' })
                                       
claire.check(100, reverse_p).toString()
// (String) => "+ OK passed 100 tests. 
//              > Collected test data:
//                  o 85% - ok
//                  o 15% - trivial"
```


### Installing

Just grab it from NPM:

```js
npm install claire
```


### Documentation

A reference of the API can be built using [Calliope][]:

```js
$ npm install -g calliope
$ calliope build
```

A fully narrated documentation explaining the concepts behind the
library is planned for a future release.


### Tests

You can run all tests using Mocha:

```js
$ npm test
```


### Licence

MIT/X11. ie.: do whatever you want.


[claire-mocha]: http://github.com/killdream/claire-mocha.git
[Calliope]: http://github.com/killdream/calliope.git
