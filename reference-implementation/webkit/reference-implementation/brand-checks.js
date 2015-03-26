require('../resources/testharness');

require('./utils/streams-utils');

var ReadableStreamReader;

test(function() {
    assert_does_not_throw(function() {
        // It's not exposed globally, but we test a few of its properties here.
        ReadableStreamReader = (new ReadableStream()).getReader().constructor;
    });
}, 'Can get the ReadableStreamReader constructor indirectly');

function fakeReadableStream() {
    return {
        cancel: function(reason) { return Promise.resolve(); },
        pipeThrough: function({ writable, readable }, options) { return readable; },
        pipeTo: function(dest, { preventClose, preventAbort, preventCancel } = {}) { return Promise.resolve(); },
        getReader: function() { return new ReadableStream(new ReadableStream()); }
    };
}

function realReadableStream() {
    return new ReadableStream();
}

function fakeReadableStreamReader() {
    return {
        get closed() { return Promise.resolve(); },
        cancel: function(reason) { return Promise.resolve(); },
        read: function() { return Promise.resolve({ value: undefined, done: true }); },
        releaseLock: function() { return; }
    };
}

function fakeByteLengthQueuingStrategy() {
    return {
        shouldApplyBackpressure: function(queueSize) {
            return queueSize > 1;
        },
        size: function(chunk) {
            return chunk.byteLength;
        }
    };
}

function realByteLengthQueuingStrategy() {
    return new ByteLengthQueuingStrategy({ highWaterMark: 1 });
}

function fakeCountQueuingStrategy() {
    return {
        shouldApplyBackpressure(queueSize) {
            return queueSize > 1;
        },
        size(chunk) {
            return 1;
        }
    };
}

function realCountQueuingStrategy() {
    return new CountQueuingStrategy({ highWaterMark: 1 });
}

function getterRejects(test, obj, getterName, target, endTest) {
    const getter = Object.getOwnPropertyDescriptor(obj, getterName).get;

    getter.call(target).then(
        test.step_func(function() { assert_unreached(getterName + ' should not fulfill'); }),
        test.step_func(function(e) {
            assert_throws(new TypeError(), function() { throw e; }, getterName + ' should reject with a TypeError');
            if (endTest === true) {
                test.done();
            }
        }));
}

function methodRejects(test, obj, methodName, target, endTest) {
    const method = obj[methodName];

    method.call(target).then(
        test.step_func(function() { assert_unreached(methodName + ' should not fulfill'); }),
        test.step_func(function(e) {
            assert_throws(new TypeError(), function() { throw e; }, methodName + ' should reject with a TypeError');
            if (endTest === true) {
                test.done();
            }
        }));
}

function methodThrows(obj, methodName, target) {
    const method = obj[methodName];

    assert_throws(new TypeError(), function() { method.call(target); }, methodName + ' should throw a TypeError');
}

test(function() {
    assert_throws(new TypeError(), function() { new ReadableStreamReader(fakeReadableStream()); }, 'Contructing a ReadableStreamReader should throw');
}, 'ReadableStreamReader enforces a brand check on its argument');

var test1 = async_test('ReadableStreamReader.prototype.closed enforces a brand check');
test1.step(function() {
    getterRejects(test1, ReadableStreamReader.prototype, 'closed', fakeReadableStreamReader());
    getterRejects(test1, ReadableStreamReader.prototype, 'closed', realReadableStream(), true);
});

var test2 = async_test('ReadableStreamReader.prototype.cancel enforces a brand check');
test2.step(function() {
    methodRejects(test2, ReadableStreamReader.prototype, 'cancel', fakeReadableStreamReader());
    methodRejects(test2, ReadableStreamReader.prototype, 'cancel', realReadableStream(), true);
});

var test3 = async_test('ReadableStreamReader.prototype.read enforces a brand check');
test3.step(function() {
    methodRejects(test3, ReadableStreamReader.prototype, 'read', fakeReadableStreamReader());
    methodRejects(test3, ReadableStreamReader.prototype, 'read', realReadableStream(), true);
});

test(function() {
    methodThrows(ReadableStreamReader.prototype, 'releaseLock', fakeReadableStreamReader());
    methodThrows(ReadableStreamReader.prototype, 'releaseLock', realReadableStream());
}, 'ReadableStreamReader.prototype.releaseLock enforces a brand check');

test(function() {
    methodThrows(ByteLengthQueuingStrategy.prototype, 'shouldApplyBackpressure', fakeByteLengthQueuingStrategy());
    methodThrows(ByteLengthQueuingStrategy.prototype, 'shouldApplyBackpressure', realCountQueuingStrategy());
}, 'ByteLengthQueuingStrategy.prototype.shouldApplyBackpressure enforces a brand check');

test(function() {
    const thisValue = null;
    const returnValue = { 'returned from': 'byteLength getter' };
    const chunk = {
        get byteLength() {
            return returnValue;
        }
    };

    assert_equals(ByteLengthQueuingStrategy.prototype.size.call(thisValue, chunk), returnValue);
}, 'ByteLengthQueuingStrategy.prototype.size should work generically on its this and its arguments');

test(function() {
    methodThrows(CountQueuingStrategy.prototype, 'shouldApplyBackpressure', fakeCountQueuingStrategy());
    methodThrows(CountQueuingStrategy.prototype, 'shouldApplyBackpressure', realByteLengthQueuingStrategy());
}, 'CountQueuingStrategy.prototype.shouldApplyBackpressure enforces a brand check');

test(function() {
    const thisValue = null;
    const chunk = {
        get byteLength() {
            throw new TypeError('shouldn\'t be called');
        }
    };

    assert_equals(CountQueuingStrategy.prototype.size.call(thisValue, chunk), 1);
}, 'CountQueuingStrategy.prototype.size should work generically on its this and its arguments');