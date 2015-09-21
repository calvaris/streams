require('../resources/testharness');

require('./utils/streams-utils');

// This is updated till ec5ffa0 of the spec.

var ReadableStreamReader;
var ReadableStreamController;

test(function() {
    // It's not exposed globally, but we test a few of its properties here.
    ReadableStreamReader = (new ReadableStream()).getReader().constructor;
}, 'Can get the ReadableStreamReader constructor indirectly');

test(function() {
    // It's not exposed globally, but we test a few of its properties here.
    new ReadableStream({
        start: function(c) {
            ReadableStreamController = c.constructor;
        }
    });
}, 'Can get the ReadableStreamController constructor indirectly');

function fakeReadableStream() {
    return {
        cancel: function(reason) { return Promise.resolve(); },
        getReader: function() { return new ReadableStream(new ReadableStream()); },
        pipeThrough: function(obj, options) { return obj.readable; },
        pipeTo: function() { return Promise.resolve(); },
        tee: function() { return [realReadableStream(), realReadableStream()]; }
    };
}

function realReadableStream() {
    return new ReadableStream();
}

function fakeWritableStream() {
  return {
    get closed() { return Promise.resolve(); },
    get ready() { return Promise.resolve(); },
    get state() { return 'closed' },
    abort(reason) { return Promise.resolve(); },
    close() { return Promise.resolve(); },
    write(chunk) { return Promise.resolve(); }
  };
}

function realWritableStream() {
  return new WritableStream();
}

function fakeReadableStreamReader() {
    return {
        get closed() { return Promise.resolve(); },
        cancel: function(reason) { return Promise.resolve(); },
        read: function() { return Promise.resolve({ value: undefined, done: true }); },
        releaseLock: function() { return; }
    };
}

function fakeReadableStreamController() {
    return {
        close: function() { },
        enqueue: function(chunk) { },
        error: function(e) { }
    };
}

function fakeByteLengthQueuingStrategy() {
    return {
        highWaterMark: 0,
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
        highWaterMark: 0,
        size: function(chunk) {
            return 1;
        }
    }
}

function realCountQueuingStrategy() {
    return new CountQueuingStrategy({ highWaterMark: 1 });
}

function getterRejects(test, obj, getterName, target, endTest) {
    var getter = Object.getOwnPropertyDescriptor(obj, getterName).get;

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
    var method = obj[methodName];

    method.call(target).then(
        test.step_func(function() { assert_unreached(methodName + ' should not fulfill'); }),
        test.step_func(function(e) {
            assert_throws(new TypeError(), function() { throw e; }, methodName + ' should reject with a TypeError');
            if (endTest === true) {
                test.done();
            }
        }));
}

function getterThrows(obj, getterName, target) {
  var getter = Object.getOwnPropertyDescriptor(obj, getterName).get;

    assert_throws(new TypeError(), function() { getter.call(target); }, getterName + ' should throw a TypeError');
}

function methodThrows(obj, methodName, target) {
    var method = obj[methodName];

    assert_throws(new TypeError(), function() { method.call(target); }, methodName + ' should throw a TypeError');
}

var test1 = async_test('ReadableStream.prototype.cancel enforces a brand check');
test1.step(function() {
    methodRejects(test1, ReadableStream.prototype, 'cancel', fakeReadableStream());
    methodRejects(test1, ReadableStream.prototype, 'cancel', realWritableStream(), true);
});

test(function() {
    methodThrows(ReadableStream.prototype, 'getReader', fakeReadableStream());
    methodThrows(ReadableStream.prototype, 'getReader', realWritableStream());
}, 'ReadableStream.prototype.getReader enforces a brand check');

test(function() {
    var pipeToArguments;
    var thisValue = {
        pipeTo: function() {
            pipeToArguments = arguments;
        }
    };

    var input = { readable: {}, writable: {} };
    var options = {};
    var result = ReadableStream.prototype.pipeThrough.call(thisValue, input, options);

    assert_array_equals(pipeToArguments, [input.writable, options], 'correct arguments should be passed to thisValue.pipeTo');
    assert_equals(result, input.readable, 'return value should be the passed readable property');
}, 'ReadableStream.prototype.pipeThrough works generically on its this and its arguments');

test(function() {
    ReadableStream.prototype.pipeTo.call(fakeReadableStream(), fakeWritableStream()); // Check it does not throw.
}, 'ReadableStream.prototype.pipeTo works generically on its this and its arguments');

test(function() {
    methodThrows(ReadableStream.prototype, 'tee', fakeReadableStream());
    methodThrows(ReadableStream.prototype, 'tee', realWritableStream());
}, 'ReadableStream.prototype.tee enforces a brand check');

test(function() {
    assert_throws(new TypeError(), function() { new ReadableStreamReader(fakeReadableStream()); }, 'Constructing a ReadableStreamReader should throw');
}, 'ReadableStreamReader enforces a brand check on its argument');

var test2 = async_test('ReadableStreamReader.prototype.closed enforces a brand check');
test2.step(function() {
    getterRejects(test2, ReadableStreamReader.prototype, 'closed', fakeReadableStreamReader());
    getterRejects(test2, ReadableStreamReader.prototype, 'closed', realReadableStream(), true);
});

var test3 = async_test('ReadableStreamReader.prototype.cancel enforces a brand check');
test3.step(function() {
    methodRejects(test3, ReadableStreamReader.prototype, 'cancel', fakeReadableStreamReader());
    methodRejects(test3, ReadableStreamReader.prototype, 'cancel', realReadableStream(), true);
});

var test4 = async_test('ReadableStreamReader.prototype.read enforces a brand check');
test4.step(function() {
    methodRejects(test4, ReadableStreamReader.prototype, 'read', fakeReadableStreamReader());
    methodRejects(test4, ReadableStreamReader.prototype, 'read', realReadableStream(), true);
});

var test5 = async_test('ReadableStreamReader.prototype.read enforces a brand check');
test5.step(function() {
    methodRejects(test5, ReadableStreamReader.prototype, 'read', fakeReadableStreamReader());
    methodRejects(test5, ReadableStreamReader.prototype, 'read', realReadableStream(), true);
});

test(function() {
    methodThrows(ReadableStreamReader.prototype, 'releaseLock', fakeReadableStreamReader());
    methodThrows(ReadableStreamReader.prototype, 'releaseLock', realReadableStream());
}, 'ReadableStreamReader.prototype.releaseLock enforces a brand check');

test(function() {
    assert_throws(new TypeError(), function() { new ReadableStreamController(fakeReadableStream()); }, 'Constructing a ReadableStreamController should throw');
}, 'ReadableStreamController enforces a brand check on its argument');

test(function() {
    assert_throws(new TypeError(), function() { new ReadableStreamController(realReadableStream()); }, 'Constructing a ReadableStreamController should throw');
}, 'ReadableStreamController can\'t be given a fully-constructed ReadableStream');

test(function() {
  methodThrows(ReadableStreamController.prototype, 'close', fakeReadableStreamController());
}, 'ReadableStreamController.prototype.close enforces a brand check');

test(function() {
  methodThrows(ReadableStreamController.prototype, 'enqueue', fakeReadableStreamController());
}, 'ReadableStreamController.prototype.enqueue enforces a brand check');

test(function() {
  methodThrows(ReadableStreamController.prototype, 'error', fakeReadableStreamController());
}, 'ReadableStreamController.prototype.error enforces a brand check');

var test6 = async_test('WritableStream.prototype.closed enforces a brand check');
test6.step(function() {
    getterRejects(test6, WritableStream.prototype, 'closed', fakeWritableStream());
    getterRejects(test6, WritableStream.prototype, 'closed', realReadableStream(), true);
});

var test7 = async_test('WritableStream.prototype.ready enforces a brand check');
test7.step(function() {
    getterRejects(test7, WritableStream.prototype, 'ready', fakeWritableStream());
    getterRejects(test7, WritableStream.prototype, 'ready', realReadableStream(), true);
});

test(function() {
    getterThrows(WritableStream.prototype, 'state', fakeWritableStream());
    getterThrows(WritableStream.prototype, 'state', realReadableStream());
}, 'WritableStream.prototype.state enforces a brand check');

var test8 = async_test('WritableStream.prototype.abort enforces a brand check');
test8.step(function() {
    methodRejects(test8, WritableStream.prototype, 'abort', fakeWritableStream());
    methodRejects(test8, WritableStream.prototype, 'abort', realReadableStream(), true);
});

var test9 = async_test('WritableStream.prototype.write enforces a brand check');
test9.step(function() {
    methodRejects(test9, WritableStream.prototype, 'write', fakeWritableStream());
    methodRejects(test9, WritableStream.prototype, 'write', realReadableStream(), true);
});

var test10 = async_test('WritableStream.prototype.close enforces a brand check');
test10.step(function() {
    methodRejects(test10, WritableStream.prototype, 'close', fakeWritableStream());
    methodRejects(test10, WritableStream.prototype, 'close', realReadableStream(), true);
});

test(function() {
    var thisValue = null;
    var returnValue = { 'returned from': 'byteLength getter' };
    var chunk = {
        get byteLength() {
            return returnValue;
        }
    };

    assert_equals(ByteLengthQueuingStrategy.prototype.size.call(thisValue, chunk), returnValue);
}, 'ByteLengthQueuingStrategy.prototype.size should work generically on its this and its arguments');

test(function() {
    var thisValue = null;
    var chunk = {
        get byteLength() {
            throw new TypeError('shouldn\'t be called');
        }
    };

    assert_equals(CountQueuingStrategy.prototype.size.call(thisValue, chunk), 1);
}, 'CountQueuingStrategy.prototype.size should work generically on its this and its arguments');
