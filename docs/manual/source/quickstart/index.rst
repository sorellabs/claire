=================
 Getting Started
=================

This document will guide you through the basics of Claire. This is a quick
introduction, but once you finish this page you'll know all you need to start
writing property tests for your code-base, and even integrate them with your
favourite test runner!


What is Claire?
===============

Claire is a tool for automatically testing your code. It uses a concept known
as **property-based testing**, where you write high-level specifications of how
each *unit* should behave, and the tool generates the test data for you,
randomly.

For example::

    // Addition should be commutative
    var commutative_p = forAll( _.Int, _.Int ).satisfy(function(a, b) {
                          return a + b == b + a
                        })


Why would you use it?
=====================

Since Claire generates random data, the data-space your test cases cover gets
larger and larger the more you run your tests. This means that every time you
run the test cases, you have more chances of catching bugs that weren't
previously caught, even if you don't change anything in your code. This can
highly increase the confidence you have in a code base.

Claire does not proof that a code base has no bugs, instead it is a tool to
increase the test space (and thus the number of bugs you can catch), and help
you analyse the data that makes a particular test fail.

Besides that, Claire allows you to have high-level specifications for how your
program should behave (like `BDD`_), and potentially reduce the amount of lines
of code spent with test cases, while increasing the overall test coverage.


Writing properties
==================

As said before, Claire uses **Properties** to describe the behaviour of an unit
of code (a module, a function, etc.). These properties are described by
JavaScript functions, and define what the expected behaviour is for a given set
of data.

Let's go back to the previous example of commutative property for
addition. This property says that no matter which order addition is performed,
the result should always be the same, and it is encoded in Claire like this::

    var claire = require('claire')
    var _      = claire.data
    var forAll = claire.forAll

    var commutative_p = forAll( _.Int, _.Int ).satisfy( function(a, b) {
                          return a + b == b + a
                        })


In plain English, that means: 

    For all pairs of integers (as ``a`` and ``b``), the sum of these integers
    yields the same result, regardless of the order in which it's performed.

.. warning::
   Properties are only considered successful if they return ``true``. Any other
   value will result on the property being rejected.


Now, ``forAll`` is a function that takes some *data generators* and returns a
``Property`` object. This object knows how to randomly generate the test data
and check if the property holds for that data. You can check if the property
holds for one case by using the ``asTest`` method.

.. note::

   There are lots of built-in test generators for Claire. The usual data types
   are there: ``Int``, ``Num``, ``Bool``, ``Array(x)`` and ``Object(x)``. You
   can always look at the ``data.ls`` source to see all the built-in ones.


The ``asTest`` returns a function that can be used within any test runner that
depends on exceptions: which would likely be all of them. It logs the result if
the test succeeds (in verbose mode), and throws an error if it fails. So, let's
use it::

    commutative_p.asTest({ verbose: true, times: 100 })()
    // + OK passed 100 tests. 


So, it tells us that Claire ran 100 tests for the property and all of them
passed. But what if it had failed? Well, let's see another property::

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


Now, it does tell us pretty loudly that the property didn't held. And that it
failed in the very first test too! It also provides information about which
arguments were given to the property, and a stack trace, which we can ignore
for now.

So, Claire says that the ``identity_p`` property failed for the integer
``93``. If we analyse the property again, we'll see that it specifies that the
the sum of any integer with 1 equals that same integer. This is clearly not the
case for addition, as ``94`` does not equal ``93``. If we fix that and run the
property again, we'll get a success::

    var identity_p = forAll(_.Int).satisfy(function(a) {
                       return a == a + 0
                     })

    identity_p.asTest({ verbose: true, times: 100 })()
    // + OK passed 100 tests.


Conditional tests
=================

Some properties only hold for a given data subset. For example::

    var sqrt_p = forAll(_.Int).satisfy(function(a) {
                   return Math.sqrt(a * a) == a
                 })

    sqrt_p.asTest()()
    // <property failed>: ! Falsified after 2 tests, 1 failed. 
    //
    // : Failure #1 --------------------
    //
    //
    // : The following arguments were provided:
    //   0 - -11 (<int>)


So, quite unsurprisingly, negative numbers don't work with this property, but
the ``Int`` generator gives you both positive and negative numbers. So, instead
of writing a new generator, Claire allows you to define a **conditional
property**::

    var sqrt_p = forAll(_.Int)
                 .given(  function(a){ return a > 0 })
                 .satisfy(function(a){ return Math.sqrt(a * a) == a })

    sqrt_p.asTest({ verbose: true })()
    // + OK passed 100 tests. 124 (55%) tests ignored.


The ``given`` method allows you to specify the subset of data that a property
applies to. You get the same arguments as the ``satisfy`` method, and return a
``Boolean`` indicating whether to test the property for the generated data or
not.

.. note::

   Claire does provide the ``Positive`` and ``Negative`` generators, which
   produce only positive and negative numbers, respectively.


Now it tells you that the property succeeded for 100 test cases, but a large
number of test cases (124, or 55%) were ignored. You can decide whether this is
an indication to doubt a property or not, in which case you can try running
more tests::

    sqrt_p.asTest({ verbose: true, times: 1000 })()
    // <property abandoned>: ? Aborted after 1956 tests. 1001 (51%) tests ignored.


If too many tests are ignored, Claire might decide to stop testing so you can
review the generators and conditions in a property.


Analysing test results
======================

Of course, not all your properties will be as simple as the addition
properties, so you need better tools to analyse the test results and decide if
they are trustworthy or not, and assess why they're failing.

For this, Claire allows you to *classify* the generated test cases, so you can
analyse which test data has been tested by the property. This is done by the
``classify`` method::

    function sorted(xs) {
      return xs.slice()
               .sort(function(a, b){ return a - b })
    }
 
    var sorted_p = forAll( _.Array(_.Int) )
                   .satisfy(function(xs) {
                     xs = sorted(xs)
                     return xs.every(function(a, i) {
                                       return i == 0
                                           || a >= xs[i - 1]
                                    })
                   })
                   .classify(function(xs) {
                     return xs.length == 0?  'empty'
                          : xs.length == 1?  'trivial'
                          :                  '> 1'
                   })

    sorted_p.asTest({ verbose: true })()
    //  + OK passed 100 tests. 
    //  > Collected test data:
    //      o 98% - > 1
    //      o 1% - trivial
    //      o 1% - empty

While sorting lists with one or no elements are trivial (it's already sorted!),
you can see that the majority of the data given (98%) passes the test. This is
a good indication that the property is likely to be trustworthy, and you can
keep running test cases to increase the confidence in the property::

    sorted_p.asTest({ verbose: true, times: 10000 })()
    //  + OK passed 10000 tests. 
    //  > Collected test data:
    //      o 98% - > 1
    //      o 1% - trivial
    //      o 1% - empty


Integrating with a test runner
==============================

Assuming your test runner takes a function and expects that function to throw
an exception if the test goes wrong, you can just use the ``asTest`` method of
the ``Property`` object to integrate with the test runner. For example, this
would work on Mocha::


    describe('Addition', function() {
      it('Should be commutative', forAll(_.Int, _.Int).satisfy(function(a, b) {
                                    return a + b == b + a
                                  }).asTest())
    })


Where to go from here?
======================

Now that you get the idea behind Claire, you can start writing your properties
to test the behaviours in your code bases. Be sure to check the :doc:`Discover
Claire <../user/index>` documentation to learn everything you can get from the
library.



.. _BDD: http://en.wikipedia.org/wiki/Behavior-driven_development
