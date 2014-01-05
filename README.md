Claire 
======

[![Build Status](https://secure.travis-ci.org/robotlolita/claire.png?branch=master)](https://travis-ci.org/robotlolita/claire)
[![NPM version](https://badge.fury.io/js/claire.png)](http://badge.fury.io/js/claire)
[![Dependencies Status](https://david-dm.org/robotlolita/claire.png)](https://david-dm.org/robotlolita/claire)
[![experimental](http://hughsk.github.io/stability-badges/dist/experimental.svg)](http://github.com/hughsk/stability-badges)


Claire is a random testing library for both property-based testing
([QuickCheck][]-like) and random program generation ([ScalaCheck][] command's
like), which allows you to express your code's behaviours and invariants
in a clear way.

[QuickCheck]: https://github.com/nick8325/quickcheck
[ScalaCheck]: https://github.com/rickynils/scalacheck

## Example 

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


## Installing

The easiest way is to grab it from NPM. If you're running in a Browser
environment, you can use [Browserify][]

    $ npm install claire


### Using with CommonJS

If you're not using NPM, [Download the latest release][release], and require
the `claire.umd.js` file:

```js
var claire = require('claire')
```


### Using with AMD

[Download the latest release][release], and require the `claire.umd.js`
file:

```js
require(['claire'], function(claire) {
  ( ... )
})
```


### Using without modules

[Download the latest release][release], and load the `claire.umd.js`
file. The properties are exposed in the global `claire` object:

```html
<script src="/path/to/claire.umd.js"></script>
```


### Compiling from source

If you want to compile this library from the source, you'll need [Git][],
[Make][], [Node.js][], and run the following commands:

    $ git clone git://github.com/robotlolita/claire.git
    $ cd claire
    $ npm install
    $ make bundle
    
This will generate the `dist/claire.umd.js` file, which you can load in
any JavaScript environment.

    
## Documentation

You can [read the documentation online][docs] or build it yourself:

    $ git clone git://github.com/robotlolita/claire.git
    $ cd claire
    $ npm install
    $ make documentation

Then open the file `docs/manual/build/html/index.html` in your browser.


## Platform support

This library assumes an ES5 environment, but can be easily supported in ES3
platforms by the use of shims. Just include [es5-shim][] :)


## Licence

Copyright (c) 2013-2014 Quildreen Motta.

Released under the [MIT licence](https://github.com/robotlolita/claire/blob/master/LICENCE).

<!-- links -->
[Browserify]: http://browserify.org/
[Git]: http://git-scm.com/
[Make]: http://www.gnu.org/software/make/
[Node.js]: http://nodejs.org/
[es5-shim]: https://github.com/kriskowal/es5-shim
[docs]: http://claire.readthedocs.org/
<!-- [release: https://github.com/robotlolita/claire/releases/download/v$VERSION/claire-$VERSION.tar.gz] -->
[release]: https://github.com/robotlolita/claire/releases/download/v1.0.0/claire-1.0.0.tar.gz
<!-- [/release] -->
