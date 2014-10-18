/**
 * Created by diatche on 12/10/14.
 */

/**
 * An efficient and compact way of calling super constructors, methods, getters and setters.
 * @module jsuper
 */

/**
 * The next super variable.
 * @name $super
 * @function
 * @global
 */

//noinspection ThisExpressionReferencesGlobalObjectJS
(function(global) {
    'use strict';

    /**
     * Redefines properties which use the $super property.
     * @param {(Object|Function)} obj The object.
     * @param {Function} [sup] Super constructor.
     * @returns {(Object|Function)} The same object.
     */
    module.exports = function(obj, sup) {
        if (typeof obj === "function") {
            return defineSuperIfNeeded(obj, obj, sup);
        }
        Object.getOwnPropertyNames(obj).forEach(function(prop) {
            var desc = Object.getOwnPropertyDescriptor(obj, prop);
            //if (desc.value.configurable) {
            if (desc.value) {
                desc.value = defineSuperIfNeeded(obj, desc.value, sup);
            } else {
                if (desc.get) {
                    desc.get = defineSuperIfNeeded(obj, desc.get, sup);
                }
                if (desc.set) {
                    desc.set = defineSuperIfNeeded(obj, desc.set, sup);
                }
            }
            Object.defineProperty(obj, prop, desc);
            //}
        });
        return obj;
    };

    /**
     * The next super variable.
     * @type {Function}
     */
    global.$super = function $super_generic() {
        if (this !== target) {
            target = this;
            current = Object.getPrototypeOf(this);
        }
        previous = current;
        if (depth === 1) {
            current = Object.getPrototypeOf(current);
        } else {
            for (var i = 0; i < depth; i++) {
                current = Object.getPrototypeOf(current);
            }
            depth = 1;
        }
        var r = current.constructor.call(target, arguments);
        current = previous;
        return r;
    };

    /**
     * The next super variable.
     * @name $super
     * @function
     * @memberOf $super
     */
    Object.defineProperty($super, "$super", {
        get: function() {
            depth += 1;
            return $super;
        }
    });

    var current, previous, target, depth = 1,
        _argumentNamesExps = [
            /^[\s\(]*function[^(]*\(([^)]*)\)/,
            /\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g,
            /\s+/g /* Source: PrototypeJS */
        ];

    /**
     * @param obj
     * @param f
     * @param [sup]
     * @returns {*}
     */
    function defineSuperIfNeeded(obj, f, sup) {
        if (typeof f !== "function") {
            throw new TypeError("Bad function");
        }
        if (f.__superDefined) {
            return f;
        }

        var local = usesSuperLocally(f),
            glob = usesSuperGlobally(f),
            g, target, _super;

        if (!(local || glob)) {
            return f;
        }

        if (local) {
            var args = [undefined];
            g = function $super_local() {
                var len = arguments.length,
                    i;
                //noinspection JSUnusedAssignment
                target = this;
                args.length = 1;
                if (!args[0]) {
                    args[0] = _super || obj.$super;
                }
                for (i = 0; i < len; i++) {
                    args[i + 1] = arguments[i];
                }
                var r = f.apply(this, args);
                target = undefined;
                return r;
            };
        } else {
            var save;
            g = function $super_global() {
                /* global $super:true */
                save = $super;
                //noinspection JSUnusedAssignment
                target = this;
                //noinspection JSUndeclaredVariable
                $super = _super || obj.$super;
                var r = f.apply(this, arguments);
                //noinspection JSUndeclaredVariable
                $super = save;
                target = undefined;
                return r;
            };
        }
        g.__superDefined = true;
        if (f === obj) {
            obj = g;
        }

        if (!obj.hasOwnProperty("$super")) {
            Object.defineProperty(obj, "$super", {
                get: function() {
                    //noinspection JSUnresolvedVariable
                    if (!this.__super) {
                        if (!sup) {
                            sup = Object.getPrototypeOf(obj).constructor;
                        }
                        if (typeof sup !== "function") {
                            throw new TypeError("Bad super constructor");
                        }

                        _super = function $super_proxy() {
                            return sup.apply(target, arguments);
                        };
                        this.__super = _super;

                        Object.getOwnPropertyNames(sup.prototype).forEach(function (prop) {
                            var desc = Object.getOwnPropertyDescriptor(sup.prototype, prop);

                            if ("value" in desc) {
                                if (typeof desc.value === "function") {
                                    desc.value = forward(desc.value);
                                }
                            } else {
                                if ("get" in desc) {
                                    desc.get = forward(desc.get);
                                }
                                if ("set" in desc) {
                                    desc.set = forward(desc.set);
                                }
                            }

                            Object.defineProperty(_super, prop, desc);
                        });

                        Object.defineProperty(_super, "$super", {
                            get: function() {
                                return sup.$super;
                            }
                        });
                    }
                    //noinspection JSUnresolvedVariable
                    return this.__super;
                }
            });
        }

        return g;

        function forward(f) {
            return function $super_method() {
                return f.apply(target, arguments);
            };
        }
    }

    function usesSuperLocally(f) {
        return typeof f === "function" && argumentNames(f)[0] === "$super";
    }
    function usesSuperGlobally(f) {
        return typeof f === "function" && f.toString().indexOf("$super") > 0;
    }

    /* Source: PrototypeJS */
    function argumentNames(f) {
        var names = f.toString().match(_argumentNamesExps[0])[1]
            .replace(_argumentNamesExps[1], '')
            .replace(_argumentNamesExps[2], '').split(',');
        return names.length === 1 && !names[0] ? [] : names;
    }
})(global || this);