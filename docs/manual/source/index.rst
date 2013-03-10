Claire —at a glance—
====================

Claire is a library for **property-based testing** for JavaScript
applications. Just like Haskell's `QuickCheck`_ or Scala's `ScalaCheck`_,
Claire works by generating random values within a given data space and
verifying if the properties declared for those values hold.



.. rst-class:: overview-list

Guides
------

.. hlist::
   :columns: 2

   * :doc:`Getting Started <quickstart/index>`
        A lightning introduction to Claire, so you can jump straight to
        testing.

   * :doc:`Discover Claire <user/index>`
        A thorough tour on Claire's concepts for leeching all you can to test
        your code-bases better.

   * :doc:`Extending Claire <dev/index>`
        Explains Claire's architecture, so you can extend Claire to support new
        types, combinators and test runners.

   * `API Reference`_
        A quick reference on Claire's API, including plenty of usage examples
        and cross-references.


.. index:: platform support

Platform Support
----------------

Claire runs on all ECMAScript 5-compliant platforms without problems. It's been
successfully tested in the following platforms:

.. raw:: html

   <ul class="platform-support">
     <li class="ie">7.0+</li>
     <li class="safari">5.1</li>
     <li class="firefox">15.0+</li>
     <li class="opera">10.0+</li>
     <li class="chrome">21.0+</li>
     <li class="nodejs">0.6+</li>
   </ul>

For legacy, ES3 platforms, like IE's JScript, you'll have to provide support
for the following methods:

  * Object.keys
  * Object.create
  * Object.getPrototypeOf
  * Object.freeze *(as an identity function)*
  * Array.prototype.indexOf
  * Array.prototype.forEach
  * Array.prototype.filter
  * Array.prototype.map
  * Array.prototype.reduce
  * Array.prototype.some
  * Array.prototype.every
  * String.prototype.trim

The nice `es5-shim`_ library should take care of handling all of those for
you.


.. index:: support, tracker, issues

Support
-------

Claire uses the `Github tracker`_ for tracking bugs and new features.


.. index:: licence, license

Licence
-------

MIT/X11.


.. _Github tracker: https://github.com/killdream/claire/issues
.. _es5-shim: https://github.com/kriskowal/es5-shim
.. _QuickCheck: https://github.com/nick8325/quickcheck
.. _ScalaCheck: https://github.com/rickynils/scalacheck
.. _API Reference: _static/api/index.html
