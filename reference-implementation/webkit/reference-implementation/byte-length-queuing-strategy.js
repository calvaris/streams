require('../resources/testharness');

require('./utils/streams-utils');

// This is updated till https://github.com/whatwg/streams/commit/ec5ffa036308d9f6350d2946560d48cdbf090939

test(function() {
    var strategy = new ByteLengthQueuingStrategy({ highWaterMark: 4 });
}, 'Can construct a ByteLengthQueuingStrategy with a valid high water mark');

test(function() {
    for (var highWaterMark of [-Infinity, NaN, 'foo', {}, function () {}]) {
        var strategy = new ByteLengthQueuingStrategy({ highWaterMark });
        assert_true(Object.is(strategy.highWaterMark, highWaterMark), highWaterMark + ' gets set correctly');
    }
}, 'Can construct a ByteLengthQueuingStrategy with any value as its high water mark');

test(function() {
    var highWaterMark = 1;
    var highWaterMarkObjectGetter = {
        get highWaterMark() { return highWaterMark; },
    };
    var error = new Error('wow!');
    var highWaterMarkObjectGetterThrowing = {
        get highWaterMark() { throw error; },
    };
    assert_throws(new TypeError(), function() { new ByteLengthQueuingStrategy(); }, 'construction fails with undefined');
    assert_throws(new TypeError(), function() { new ByteLengthQueuingStrategy(null); }, 'construction fails with null');
    new ByteLengthQueuingStrategy('potato'); // Construction succeeds with a random non-object type.
    new ByteLengthQueuingStrategy({}); // Construction succeeds with an object without a highWaterMark property.
    new ByteLengthQueuingStrategy(highWaterMarkObjectGetter); // Construction succeeds with an object with a highWaterMark getter.
    assert_throws(error, function() { new ByteLengthQueuingStrategy(highWaterMarkObjectGetterThrowing); },
                  'construction fails with an object with a throwing highWaterMark getter');
}, 'ByteLengthQueuingStrategy constructor behaves as expected with wrong arguments');

test(function() {
    var size = 1024;
    var chunk = { byteLength: size };
    var chunkGetter = {
        get byteLength() { return size; },
    }
    var error = new Error('wow!');
    var chunkGetterThrowing = {
        get byteLength() { throw error; },
    }
    assert_throws(new TypeError(), function() { ByteLengthQueuingStrategy.prototype.size(); }, 'size fails with undefined');
    assert_throws(new TypeError(), function() { ByteLengthQueuingStrategy.prototype.size(null); }, 'size fails with null');
    assert_equals(ByteLengthQueuingStrategy.prototype.size('potato'), undefined,
                  'size succeeds with undefined with a random non-object type');
    assert_equals(ByteLengthQueuingStrategy.prototype.size({}), undefined,
                  'size succeeds with undefined with an object without hwm property');
    assert_equals(ByteLengthQueuingStrategy.prototype.size(chunk), size,
                  'size succeeds with the right amount with an object with a hwm');
    assert_equals(ByteLengthQueuingStrategy.prototype.size(chunkGetter), size,
                  'size succeeds with the right amount with an object with a hwm getter');
    assert_throws(error, function() { ByteLengthQueuingStrategy.prototype.size(chunkGetterThrowing); },
                  'size fails with the error thrown by the getter');
}, 'ByteLengthQueuingStrategy size behaves as expected with wrong arguments');

test(function() {
    var strategy = new ByteLengthQueuingStrategy({ highWaterMark: 4 });

    assert_object_equals(Object.getOwnPropertyDescriptor(strategy, 'highWaterMark'),
                         { value: 4, writable: true, enumerable: true, configurable: true },
                         'highWaterMark property should be a data property with the value passed the connstructor');
    assert_equals(typeof strategy.size, 'function');
}, 'ByteLengthQueuingStrategy instances have the correct properties');

var test1 = async_test('Closing a writable stream with in-flight writes below the high water mark delays the close call properly');
test1.step(function() {
    var isDone = false;
    var ws = new WritableStream(
        {
            write: function(chunk) {
                return new Promise(test1.step_func(function(resolve) {
                    setTimeout(test1.step_func(function() {
                        isDone = true;
                        resolve();
                    }), 500);
                }));
            },
            close: function() {
                assert_true(isDone, 'close is only called once the promise has been resolved');
                test1.done();
            }
        },
        new ByteLengthQueuingStrategy({ highWaterMark: 1024 * 16 })
    );

    ws.write({ byteLength: 1024 });
    ws.close();
});
