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
    assert_throws(new TypeError(), function() { new ByteLengthQueuingStrategy(); }, 'construction fails with undefined');
    assert_throws(new TypeError(), function() { new ByteLengthQueuingStrategy(null); }, 'construction fails with null');
    new ByteLengthQueuingStrategy('potato'); // Construction succeeds with a random non-object type.
    new ByteLengthQueuingStrategy({}); // Construction succeeds with an object without hwm property.
    new ByteLengthQueuingStrategy(highWaterMarkObjectGetter); // Construction succeeds with an object with a hwm getter.
    assert_throws(error, function() { new ByteLengthQueuingStrategy(highWaterMarkObjectGetterThrowing); }, 'construction fails with the error thrown by the getter');
}, 'ByteLengthQueuingStrategy constructor behaves with wrong parameters');

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
    assert_throws(new TypeError(), function() { ByteLengthQueuingStrategy.prototype.size(); }, 'size fails with undefined');
    assert_throws(new TypeError(), function() { ByteLengthQueuingStrategy.prototype.size(null); }, 'size fails with null');
    assert_equals(ByteLengthQueuingStrategy.prototype.size('potato'), undefined, 'size succeeds with undefined with a random non-object type');
    assert_equals(ByteLengthQueuingStrategy.prototype.size({}), undefined), 'size succeeds with undefined with an object without hwm property';
    assert_equals(ByteLengthQueuingStrategy.prototype.size(chunk), size, 'size succeeds with the right amount with an object with a hwm');
    assert_equals(ByteLengthQueuingStrategy.prototype.size(chunkGetter), size, 'size succeeds with the right amount with an object with a hwm getter');
    assert_throws(error, function() { ByteLengthQueuingStrategy.prototype.size(chunkGetterThrowing); }, 'size fails with the error thrown by the getter');
}, 'ByteLengthQueuingStrategy size method behaves correctly');
