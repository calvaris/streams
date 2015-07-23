require('./resources/testharness');

require('./reference-implementation/utils/streams-utils');

test(function() {
    var highWaterMark = 1
    var highWaterMarkObjectGetter = {
        get highWaterMark() { return highWaterMark; },
    }
    var error = new Error("wow!");
    var highWaterMarkObjectGetterThrowing = {
        get highWaterMark() { throw error; },
    }
    assert_throws(new TypeError(), function() { new CountQueuingStrategy(); }, 'construction fails with undefined');
    assert_throws(new TypeError(), function() { new CountQueuingStrategy(null); }, 'construction fails with null');
    new CountQueuingStrategy('potato'); // Construction succeeds with a random non-object type.
    new CountQueuingStrategy({}); // Construction succeeds with an object without hwm property.
    new CountQueuingStrategy(highWaterMarkObjectGetter); // Construction succeeds with an object with a hwm getter.
    assert_throws(error, function() { new CountQueuingStrategy(highWaterMarkObjectGetterThrowing); }, 'construction fails with the error thrown by the getter');
}, 'CountQueuingStrategy constructor behaves with wrong parameters');

test(function() {
    var size = 1024;
    var chunk = { byteLength: size };
    var chunkGetter = {
        get byteLength() { return size; },
    }
    var error = new Error("wow!");
    var chunkGetterThrowing = {
        get byteLength() { throw error; },
    }
    assert_equals(CountQueuingStrategy.prototype.size(), 1, 'size returns 1 with undefined');
    assert_equals(CountQueuingStrategy.prototype.size(null), 1, 'size returns 1 with null');
    assert_equals(CountQueuingStrategy.prototype.size('potato'), 1, 'size returns 1 with non-object type');
    assert_equals(CountQueuingStrategy.prototype.size({}), 1, 'size returns 1 with empty object');
    assert_equals(CountQueuingStrategy.prototype.size(chunk), 1, 'size returns 1 with a chunk');
    assert_equals(CountQueuingStrategy.prototype.size(chunkGetter), 1, 'size returns 1 with chunk getter');
    assert_equals(CountQueuingStrategy.prototype.size(chunkGetterThrowing), 1, 'size returns 1 with chunk getter that throws');
}, 'CountQueuingStrategy size method behaves correctly');
