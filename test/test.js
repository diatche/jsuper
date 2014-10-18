/**
 * Created by diatche on 15/10/14.
 */

(function() {
    /*global $super */
    /*global beforeEach, afterEach, describe, expect, it, spyOn, xdescribe, xit */

    'use strict';

    var should = require("should"),
        jsuper = require('../index.js'),
        Promise = require("promise"),
        counter = {},
        obj;

    describe('$super()', function() {
        function NoSuper() {
            counter.NoSuper += 1;
            return this;
        }
        function CallsSuper() {
            if ($super.apply(this, arguments) === this) {
                counter.CallsSuper += 1;
            }
            return this;
        }
        inherits(CallsSuper, NoSuper);

        function CallsSuperX2() {
            if ($super.apply(this, arguments) === this) {
                counter.CallsSuperX2 += 1;
            }
            return this;
        }
        inherits(CallsSuperX2, CallsSuper);

        it('should always be defined', function() {
            should.exist($super);
        });
        it('should throw an error when called on global', function() {
            should($super).throw();
        });
        it('should throw an error when called outside an instance method', function() {
            should(function() {
                $super.apply({});
            }).throw();
        });
        it('should throw an error when called in a constructor without a super constructor without new operator', function() {
            should(function() {
                //noinspection JSPotentiallyInvalidConstructorUsage
                CallsSuper();
            }).throw();
        });
        it('should call super constructor', function() {
            counter.NoSuper = 0;
            obj = new CallsSuper();
            counter.NoSuper.should.be.exactly(1);
        });
        it('should call super constructor of all subclasses', function() {
            counter.NoSuper = 0;
            counter.CallsSuper = 0;
            obj = new CallsSuperX2();
            obj.should.be.instanceOf(CallsSuperX2);
            counter.CallsSuper.should.be.exactly(1);
            counter.NoSuper.should.be.exactly(1);
        });
        it('should not break asynchronously', function(done) {
            var promises = [];
            for (var i = 0, c = 100; i < c; i++) {
                //noinspection JSHint
                promises[i] = new Promise(function(fulfil) {
                    fulfil(new CallsSuperX2());
                });
            }
            //noinspection JSUnresolvedFunction
            Promise.all(promises).nodeify(done);
        });
    });

    describe('$super.$super()', function() {
        function NoSuper() {
            counter.NoSuper += 1;
        }
        function CallsSuper() {
            counter.CallsSuper += 1;
            $super.apply(this, arguments);
        }
        inherits(CallsSuper, NoSuper);

        function CallsSuperX2() {
            counter.CallsSuperX2 += 1;
            $super.$super.apply(this, arguments);
        }
        inherits(CallsSuperX2, CallsSuper);

        it('should not call skipped super constructor', function() {
            counter.NoSuper = 0;
            counter.CallsSuper = 0;
            obj = new CallsSuperX2();
            counter.CallsSuper.should.be.exactly(0);
            counter.NoSuper.should.be.exactly(1);
        });
    });

    describe('jsuper()', function() {
        function NoJSuper() {
            counter.NoJSuper += 1;
            return this;
        }
        it('constructors should call specified super constructors using $super variable', function() {
            var CallsJSuper = jsuper(function _CallsJSuper() {
                this.should.be.instanceOf(CallsJSuperX2);
                $super();
                counter.CallsJSuper += 1;
            }, NoJSuper);
            inherits(CallsJSuper, NoJSuper);

            var CallsJSuperX2 = jsuper(function _CallsJSuperX2() {
                this.should.be.instanceOf(CallsJSuperX2);
                $super();
                counter.CallsJSuperX2 += 1;
            }, CallsJSuper);
            inherits(CallsJSuperX2, CallsJSuper);

            counter.NoJSuper = 0;
            counter.CallsJSuper = 0;
            obj = new CallsJSuperX2();
            obj.should.be.instanceOf(CallsJSuperX2);
            counter.CallsJSuper.should.be.exactly(1);
            counter.NoJSuper.should.be.exactly(1);
        });
        it('constructors should not call skipped super constructors using $super variable', function() {
            var CallsJSuper = jsuper(function CallsJSuper() {
                counter.CallsJSuper += 1;
                $super();
            }, NoJSuper);
            inherits(CallsJSuper, NoJSuper);

            var CallsJSuperX2 = jsuper(function CallsJSuperX2() {
                counter.CallsJSuperX2 += 1;
                $super.$super();
            }, CallsJSuper);
            inherits(CallsJSuperX2, CallsJSuper);

            counter.NoJSuper = 0;
            counter.CallsJSuper = 0;
            obj = new CallsJSuperX2();
            counter.CallsJSuper.should.be.exactly(0);
            counter.NoJSuper.should.be.exactly(1);
        });

        it('constructors should call specified super constructors using $super argument', function() {
            /** @function */
            var CallsJSuper = jsuper(function _CallsJSuper($super) {
                this.should.be.instanceOf(CallsJSuperX2);
                $super();
                counter.CallsJSuper += 1;
            }, NoJSuper);
            inherits(CallsJSuper, NoJSuper);

            var CallsJSuperX2 = jsuper(function _CallsJSuperX2($super) {
                this.should.be.instanceOf(CallsJSuperX2);
                $super();
                counter.CallsJSuperX2 += 1;
            }, CallsJSuper);
            inherits(CallsJSuperX2, CallsJSuper);

            counter.NoJSuper = 0;
            counter.CallsJSuper = 0;
            obj = new CallsJSuperX2();
            obj.should.be.instanceOf(CallsJSuperX2);
            counter.CallsJSuper.should.be.exactly(1);
            counter.NoJSuper.should.be.exactly(1);
        });
        it('constructors should not call skipped super constructors using $super argument', function() {
            var CallsJSuper = jsuper(function CallsJSuper($super) {
                counter.CallsJSuper += 1;
                $super();
            }, NoJSuper);
            inherits(CallsJSuper, NoJSuper);

            var CallsJSuperX2 = jsuper(function CallsJSuperX2($super) {
                counter.CallsJSuperX2 += 1;
                $super.$super();
            }, CallsJSuper);
            inherits(CallsJSuperX2, CallsJSuper);

            counter.NoJSuper = 0;
            counter.CallsJSuper = 0;
            obj = new CallsJSuperX2();
            counter.CallsJSuper.should.be.exactly(0);
            counter.NoJSuper.should.be.exactly(1);
        });
    });

    /* Source: inherits */
    function inherits(sub, sup) {
        sub.super_ = sup;
        sub.prototype = Object.create(sup.prototype, {
            constructor: {
                value: sub,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
    }
})();