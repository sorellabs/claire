Claire
======

[![Build Status](https://travis-ci.org/killdream/claire.png)](https://travis-ci.org/killdream/claire)


Claire is a random testing library for both property-based testing
(QuickCheck-like) and random program generation (ScalaCheck command's
like), which allows you to express your code's behaviours and invariants
in a clear way.


### Example

```js
var claire = require('claire')
var _ = claire.data

// Checks if all numbers are Even
var even_p = claire.forAll(_.int)
                   .satisfy(function(n) { return n % 2 == 0 })

claire.check(100, even_p)
// => (Object) { "status": "failed"
//             , "passed": 12
//             , "ignored": 0
//             , "total": 12
//             , "reason": { "args": [3] }}

// Checks if a subset of all numbers are Even
var even_p2 = claire.forAll(_.int)
                    .given(function(n){ return n % 2 == 0 })
                    .satisfy(function(n){ return n % 2 == 0 })

claire.check(100, even_p2)
// => (Object) { "status": "passed"
//             , "passed": 100
//             , "ignored": 0
//             , "total": 100 }
```


### Installing

Just grab it from NPM:

```js
npm install claire
```


### Licence

MIT/X11. ie.: do whatever you want.


