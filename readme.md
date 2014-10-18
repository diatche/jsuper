JSuper provides an efficient way of defining a class-like super variable on any JavaScript function or object.

Defines a global $super function which when used inside a defined function, calls the constructor of the inherited prototype. All properties of the inherited prototype can be used as normal.

Because $super is defined globally, consider the following:

```js
// Correct
var jsuper = require('jsuper');

// Incorrect, global $super function has been overridden.
var $super = require('jsuper');
```

If a function's first argument is $super, then the inherited proxy is hooked to that variable instead. Note that the argument is invisible outside the function. This is identical behaviour to PrototypeJS. The above caution does not apply in this case.

Documentation coming soon!

### Performance

***Case: No super***

Operations/second: N

```js
function F() {}

for (var i = 0; i < M; i++) {
    new F();
}
// N = time / M
```

***Case Single super call***

Operations/second: 0.7 * N

```js
/* global $super */

var F1 = JSuper(function _F1() {
    $super();
});
util.inherits(F1, F);

for (var i = 0; i < M; i++) {
    new F1();
}
// N = time / M
```

***Case Nested super call***

Operations/second: 0.3 * N

```js
var F2 = JSuper(function _F2() {
    $super();
});
util.inherits(F2, F1);

for (var i = 0; i < M; i++) {
    new F2();
}
// N = time / M
```
