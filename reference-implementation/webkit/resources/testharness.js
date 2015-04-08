/*global self*/
/*jshint latedef: nofunc*/
(function()
{
    var tapeTest = require('tape-catch');
    var self = undefined;

    function same_value(x, y) {
        if (y !== y) {
            //NaN case
            return x !== x;
        }
        if (x === 0 && y === 0) {
            //Distinguish +0 and -0
            return 1/x === 1/y;
        }
        return x === y;
    }

    function assert(expected_true, error, function_name, description)
    {
        if (expected_true !== true) {
            self.setError(error, function_name, description);
        }
    }

    function assert_equals(actual, expected, description)
    {
        if (typeof actual != typeof expected) {
            self.setError("expected (" + typeof expected + ") but got (" + typeof actual + ")", "assert_equals", description);
            return;
        }
        assert(same_value(actual, expected), "expected " + expected + " but got " + actual, "assert_equals", description);
    }

    function assert_unreached(description)
    {
        self.setError(description, 'assert_unreached');
    };

    function assert_does_not_throw(func, description)
    {
        try {
            func.call(this);
        } catch (e) {
            self.setError(func + " should run smoothly but it threw " + e, "assert_does_not_throw", description);
        }
    }

    function assert_throws(code, func, description)
    {
        try {
            func.call(this);
            self.setError(func + " did not throw", "assert_throws", description);
        } catch (e) {
            if (code === null) {
                return;
            }
            if (typeof code === "object") {
                assert(typeof e == "object" && "name" in e && e.name == code.name, func + " threw " + e + " (" + e.name + ") expected " + code + " (" + code.name + ")", "assert_throws", description);
                return;
            }

            var code_name_map = {
                INDEX_SIZE_ERR: 'IndexSizeError',
                HIERARCHY_REQUEST_ERR: 'HierarchyRequestError',
                WRONG_DOCUMENT_ERR: 'WrongDocumentError',
                INVALID_CHARACTER_ERR: 'InvalidCharacterError',
                NO_MODIFICATION_ALLOWED_ERR: 'NoModificationAllowedError',
                NOT_FOUND_ERR: 'NotFoundError',
                NOT_SUPPORTED_ERR: 'NotSupportedError',
                INVALID_STATE_ERR: 'InvalidStateError',
                SYNTAX_ERR: 'SyntaxError',
                INVALID_MODIFICATION_ERR: 'InvalidModificationError',
                NAMESPACE_ERR: 'NamespaceError',
                INVALID_ACCESS_ERR: 'InvalidAccessError',
                TYPE_MISMATCH_ERR: 'TypeMismatchError',
                SECURITY_ERR: 'SecurityError',
                NETWORK_ERR: 'NetworkError',
                ABORT_ERR: 'AbortError',
                URL_MISMATCH_ERR: 'URLMismatchError',
                QUOTA_EXCEEDED_ERR: 'QuotaExceededError',
                TIMEOUT_ERR: 'TimeoutError',
                INVALID_NODE_TYPE_ERR: 'InvalidNodeTypeError',
                DATA_CLONE_ERR: 'DataCloneError'
            };

            var name = code in code_name_map ? code_name_map[code] : code;

            var name_code_map = {
                IndexSizeError: 1,
                HierarchyRequestError: 3,
                WrongDocumentError: 4,
                InvalidCharacterError: 5,
                NoModificationAllowedError: 7,
                NotFoundError: 8,
                NotSupportedError: 9,
                InvalidStateError: 11,
                SyntaxError: 12,
                InvalidModificationError: 13,
                NamespaceError: 14,
                InvalidAccessError: 15,
                TypeMismatchError: 17,
                SecurityError: 18,
                NetworkError: 19,
                AbortError: 20,
                URLMismatchError: 21,
                QuotaExceededError: 22,
                TimeoutError: 23,
                InvalidNodeTypeError: 24,
                DataCloneError: 25,

                UnknownError: 0,
                ConstraintError: 0,
                DataError: 0,
                TransactionInactiveError: 0,
                ReadOnlyError: 0,
                VersionError: 0
            };

            if (!(name in name_code_map)) {
                self.setError('Test bug: unrecognized DOMException code "' + code + '"', 'assert_throws');
                return;
            }

            var required_props = { code: name_code_map[name] };

            if (required_props.code === 0 ||
               ("name" in e && e.name !== e.name.toUpperCase() && e.name !== "DOMException")) {
                // New style exception: also test the name property.
                required_props.name = name;
            }

            assert(typeof e == "object", func + " threw " + e + " with type " + typeof e + " is not an object", "assert_throws", description);

            for (var prop in required_props) {
                assert(typeof e == "object" && prop in e && e[prop] == required_props[prop], func + " threw " + e + " that is not a DOMException " + code + ": property " + prop + " is equal to " + e[prop] + " expected " + required_props[prop], "assert_throws", description);
            }
        }
    }
    function assert_true(actual, description)
    {
        assert(actual === true, "expected true got " + actual, "assert_true", description);
    }

    function assert_false(actual, description)
    {
        assert(actual === false, "expected false got " + actual, "assert_false", description);
    }

    function assert_not_equals(actual, expected, description)
    {
        assert(!same_value(actual, expected), "got disallowed value " + actual, "assert_not_equals", description);
    }

    function assert_array_equals(actual, expected, description)
    {
        assert(actual.length === expected.length, "lengths differ, expected " + expected.length + " got " + actual.lenght, "assert_array_equals", description);

        for (var i = 0; i < actual.length; i++) {
            assert(actual.hasOwnProperty(i) === expected.hasOwnProperty(i), "property " + i + ", property expected to be " + expected.hasOwnProperty(i) ? "present" : "missing" + " but was " + actual.hasOwnProperty(i) ? "present" : "missing","assert_array_equals", description);
            assert(same_value(expected[i], actual[i]), "property " + i + ", expected " + expected[i] + " but got " + actual[i], "assert_array_equals", description);
        }
    }

    function assert_object_equals(actual, expected, description)
    {
         //This needs to be improved a great deal
         function check_equal(actual, expected, stack)
         {
             stack.push(actual);

             var p;
             for (p in actual) {
                 assert(expected.hasOwnProperty(p), "unexpected property " + p, "assert_object_equals", description);

                 if (typeof actual[p] === "object" && actual[p] !== null) {
                     if (stack.indexOf(actual[p]) === -1) {
                         check_equal(actual[p], expected[p], stack);
                     }
                 } else {
                     assert(same_value(actual[p], expected[p]), "property " + p + " expected " + expected + " got " + actual, "assert_object_equals", description);
                 }
             }
             for (p in expected) {
                 assert(actual.hasOwnProperty(p), "expected property " + p + " missing", "assert_object_equals", description);
             }
             stack.pop();
         }
         check_equal(actual, expected, []);
    }

    function assert_greater_than(actual, expected, description)
    {
        assert(typeof actual === "number", "expected a number but got a " + typeof actual, "assert_greater_than", description);

        assert(actual > expected, "expected a number greater than " + expected + " but got " + actual, "assert_greater_than", description);
    }

    function _assert_own_property(name) {
        return function(object, property_name, description)
        {
            assert(object.hasOwnProperty(property_name), "expected property " + property_name + " missing", name, description);
        };
    }

    function AsyncTest(description) {
        this._description = description;
        this._error = undefined;
        this._finished = false;
    };

    AsyncTest.prototype.setError = function (error, function_name, description)
    {
        if (this._finished || this._error != undefined) {
            // We keep only the first error
            return;
        }

        this._error = 'error ' + error;
        if (function_name != undefined) {
            this._error += ' in ' + function_name;
        }
        if (description != undefined) {
            this._error += ', ' + description;
        }
        this.done();
    }

    AsyncTest.prototype.step = function(testFunction)
    {
        if (this._finished) {
            return;
        }

        function wrapTest(tapeTest)
        {
            self = this;
            this._tapeTest = tapeTest;
            testFunction();
        };
        tapeTest(this._description, wrapTest.bind(this));
    };

    AsyncTest.prototype.step = function(testFunction)
    {
        if (this._finished) {
            return;
        }

        function wrapTest(tapeTest)
        {
            self = this;
            this._tapeTest = tapeTest;
            testFunction();
        };
        tapeTest(this._description, wrapTest.bind(this));
    };

    AsyncTest.prototype.step_func = function(testFunction)
    {
        if (this._finished) {
            return;
        }

        return testFunction;
    };

    AsyncTest.prototype.done = function()
    {
        if (this._finished) {
            return;
        }

        this._finished = true;
        if (this._error != undefined) {
            this._tapeTest.fail(this._error);
        } else {
            this._tapeTest.pass('done');
        }
        this._tapeTest.end();
        delete this._tapeTest;
    };

    function async_test(description)
    {
        self = new AsyncTest(description);
        return self;
    };

    function test(testFunction, description)
    {
        var test = async_test(description);
        function wrapTest()
        {
            self = test;
            testFunction();
            test.done();
        }
        test.step(wrapTest);
    };

    function expose(object, name)
    {
        var components = name.split(".");
        var target = global;
        for (var i = 0; i < components.length - 1; i++) {
            if (!(components[i] in target)) {
                target[components[i]] = {};
            }
            target = target[components[i]];
        }
        target[components[components.length - 1]] = object;
    }

    expose(assert_equals, 'assert_equals');
    expose(assert_unreached, 'assert_unreached');
    expose(assert_throws, 'assert_throws');
    expose(assert_does_not_throw, 'assert_does_not_throw');
    expose(assert_true, "assert_true");
    expose(assert_false, "assert_false");
    expose(assert_not_equals, "assert_not_equals");
    expose(assert_array_equals, "assert_array_equals");
    expose(assert_object_equals, "assert_object_equals");
    expose(assert_greater_than, "assert_greater_than");
    expose(_assert_own_property("assert_exists"), "assert_exists");
    expose(_assert_own_property("assert_own_property"), "assert_own_property");
    expose(test, 'test');
    expose(async_test, 'async_test');
})();
