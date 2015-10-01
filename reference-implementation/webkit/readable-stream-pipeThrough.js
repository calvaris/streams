require('./resources/testharness');

require('./reference-implementation/utils/streams-utils');

require('./resources/gc');
var window = {}
window.gc = gc;

// This is updated till https://github.com/whatwg/streams/commit/ec5ffa036308d9f6350d2946560d48cdbf090939

test(function() {
    var input = {
        readable: { },
        writable: { }
    };
    var options = { };
    assert_throws(new TypeError(), function() { ReadableStream.prototype.pipeThrough.call(undefined, input, options); });
    assert_throws(new TypeError(), function() { ReadableStream.prototype.pipeThrough.call(null, input, options); });
    assert_throws(new TypeError(), function() { ReadableStream.prototype.pipeThrough.call(1, input, options); });
    assert_throws(new TypeError(), function() { ReadableStream.prototype.pipeThrough.call({ "pipeTo": "test" }, input, options); });
}, 'ReadableStream.prototype.pipeThrough should throw when "this" has no pipeTo method');

test(function() {
    var options = { };
    var thisValue = {
        pipeTo: function() {
            assert_unreached();
        }
    };

    assert_throws(new TypeError(), function() { ReadableStream.prototype.pipeThrough.call(thisValue, null, options); });
    assert_throws(new TypeError(), function() { ReadableStream.prototype.pipeThrough.call(thisValue, undefined, options); });
}, 'ReadableStream.prototype.pipeThrough should throw when passed argument is not an object');

test(function() {
    var options = { };
    var error = new TypeError("potato");

    var thisWrongValue = {
        get pipeTo() {
            throw error;
        }
    };
    assert_throws(error, function() { ReadableStream.prototype.pipeThrough.call(thisWrongValue, { readable: { }, writable: { } }, options); });

    var thisValue = {
        pipeTo: function() {
            assert_unreached();
        }
    };
    var wrongInput = {
        readable: { },
        get writable() {
            throw error;
        }
    };
    assert_throws(error, function() { ReadableStream.prototype.pipeThrough.call(thisValue, wrongInput, options); });

    var wrongInput2 = {
        get readable() {
            throw error;
        },
        writable: { }
    };
    var thisValue2 = {
        pipeTo: function() { }
    };
    assert_throws(error, function() { ReadableStream.prototype.pipeThrough.call(thisValue2, wrongInput2, options); });
}, 'ReadableStream.prototype.pipeThrough should throw when called getters are throwing');

test(function() {
    var count = 0;
    var thisValue = {
        pipeTo: function() {
            ++count;
        }
    };

    ReadableStream.prototype.pipeThrough.call(thisValue, { readable: { }, writable: { } });
    ReadableStream.prototype.pipeThrough.call(thisValue, { readable: { } }, { });
    ReadableStream.prototype.pipeThrough.call(thisValue, { writable: { } }, { });

    assert_equals(count, 3);
}, 'ReadableStream.prototype.pipeThrough should work with missing parameters');
