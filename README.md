# Claire [![Build Status](https://travis-ci.org/killdream/claire.png)](https://travis-ci.org/killdream/claire) ![Dependencies Status](https://david-dm.org/killdream/claire.png)


Claire is a random testing library for both property-based testing
([QuickCheck][]-like) and random program generation ([ScalaCheck][] command's
like), which allows you to express your code's behaviours and invariants
in a clear way.

[QuickCheck]: https://github.com/nick8325/quickcheck
[ScalaCheck]: https://github.com/rickynils/scalacheck

### Example 

```js
var claire = require('claire')
var _      = claire.data
var forAll = claire.forAll

var commutative_p = forAll( _.Int, _.Int ).satisfy( function(a, b) {
                      return a + b == b + a
                    }).asTest()
// + OK passed 100 tests.


var identity_p = forAll(_.Int).satisfy(function(a) {
                   return a == a + 1
                 })

identity_p.asTest({ verbose: true, times: 100 })()
// <property failed>: ! Falsified after 1 tests, 1 failed.
//
// : Failure #1 --------------------
//
//
// : The following arguments were provided:
//   0 - 93 (<int>)
//
// (Stack trace)
```


### Installing

The easiest way is to grab it from NPM (use [Browserify][] if you're on a
browser):

    $ npm install claire
    
If you **really** want to continue suffering with old and terrible module
systems (or use no module system at all), you can run `make bundle` yourself:

    $ git clone git://github.com/killdream/claire
    $ cd claire
    $ npm install
    $ make bundle
    # Then use `dist/claire.umd.js` wherever you want.
    
[browserify]: https://github.com/substack/node-browserify


### Documentation

A reference of the API can be built using [Calliope][]:

    $ npm install -g calliope
    $ calliope build


A fully narrated documentation explaining the concepts behind the
library is planned for a future release. Current WIP can be found at
http://claire.readthedocs.org/.

[Calliope]: http://github.com/killdream/calliope.git


### Platform support

Claire should work neatly in all ES5 platforms. ES3 platforms (IE8-,
etc) can use [es5-shim][] to provide the fallbacks necessary.

[es5-shim]: https://github.com/kriskowal/es5-shim

Things are frozen to ensure immutability, but legacy engines can do
without, so `Object.freeze = function(a) { return a }` is okay.

[![browser support](https://ci.testling.com/killdream/claire.png)](http://ci.testling.com/killdream/claire)


### Tests

For node:

    $ npm test

For the browser:

    $ npm install -g brofist-browser
    $ make test
    $ brofist-browser serve test/specs
    # Then point your browsers to the URL on yer console


### Licence

MIT/X11. ie.: do whatever you want.
