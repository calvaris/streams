require('../resources/testharness');

require('./utils/streams-utils');

// This is updated till https://github.com/whatwg/streams/commit/ec5ffa036308d9f6350d2946560d48cdbf090939

test(function() {
    var theError = new Error('a unique string');

    assert_throws(theError, function() {
        new ReadableStream({}, {
            get size() {
                throw theError;
            },
            highWaterMark: 5
        });
    }, 'construction should re-throw the error');
}, 'Readable stream: throwing strategy.size getter');

var test1 = async_test('Readable stream: throwing strategy.size method');
test1.step(function() {
    var theError = new Error('a unique string');
    var rs = new ReadableStream(
        {
            start: function(c) {
                assert_throws(theError, function() { c.enqueue('a'); }, 'enqueue should throw the error');
            }
        },
        {
            size: function() {
                throw theError;
            },
            highWaterMark: 5
        }
    );

    rs.getReader().closed.catch(test1.step_func(function(e) {
        assert_equals(e, theError, 'closed should reject with the error');
        test1.done();
    }))
});

test(function() {
    var theError = new Error('a unique string');

    assert_throws(theError, function() {
        new ReadableStream({}, {
            size: function() {
                return 1;
            },
            get highWaterMark() {
                throw theError;
            }
        });
    }, 'construction should re-throw the error');
}, 'Readable stream: throwing strategy.highWaterMark getter');

test(function() {
    for (var highWaterMark of [-1, -Infinity]) {
        assert_throws(new RangeError(), function() {
            new ReadableStream({}, {
                size: function() {
                    return 1;
                },
                highWaterMark
            });
        }, 'construction should throw a RangeError for ' + highWaterMark);
    }

    for (var highWaterMark of [NaN, 'foo', {}]) {
        assert_throws(new TypeError(), function() {
            new ReadableStream({}, {
                size: function() {
                    return 1;
                },
                highWaterMark
            });
        }, 'construction should throw a TypeError for ' + highWaterMark);
    }
}, 'Readable stream: invalid strategy.highWaterMark');

var test2 = async_test('Readable stream: invalid strategy.size return value');
test2.step(function() {
    var numberOfCalls = 0;
    var elements = [NaN, -Infinity, +Infinity, -1];
    var theError = [];
    for (var i = 0; i < elements.length; i++) {
        var rs = new ReadableStream({
            start: function(c) {
                try {
                    c.enqueue('hi');
                    assert_unreached('enqueue didn\'t throw');
                } catch (error) {
                    assert_throws(new RangeError(), function() { throw error; }, 'enqueue should throw a RangeError for ' + elements[i]);
                    theError[i] = error;
                }
            }
        },
        {
            size: function() {
                return elements[i];
            },
            highWaterMark: 5
        });

        var catchFunction = function(i, e) {
            assert_equals(e, theError[i], 'closed should reject with the error for ' + elements[i]);
            if (++numberOfCalls, elements.length) {
                test2.done();
            }
        };

        rs.getReader().closed.catch(test2.step_func(catchFunction.bind(this, i)));
    }
});

test(function() {
    var theError = new Error('a unique string');

    assert_throws(theError, function() {
        new WritableStream({}, {
            get size() {
                throw theError;
            },
            highWaterMark: 5
        });
    }, 'construction should re-throw the error');
}, 'Writable stream: throwing strategy.size getter');

var test3 = async_test('Writable stream: throwing strategy.size method');
test3.step(function() {
    var theError = new Error('a unique string');
    var writeCalled = false;
    var ws = new WritableStream({ },
        {
            size: function() {
                throw theError;
            },
            highWaterMark: 5
        }
    ); // Initial construction should not throw.

    ws.write('a').then(
        test3.step_func(function() { assert_unreached('write should not fulfill'); }),
        test3.step_func(function(r) {
            assert_equals(r, theError, 'write should reject with the thrown error');
            writeCalled = true;
        })
    );

    ws.closed.then(
        test3.step_func(function() { assert_unreached('closed should not fulfill'); }),
        test3.step_func(function(r) {
            assert_equals(r, theError, 'closed should reject with the thrown error');
            assert_true(writeCalled);
            test3.done();
        })
    );
});

var test4 = async_test('Writable stream: invalid strategy.size return value');
test4.step(function() {
    var numberOfCalls = 0;
    var elements = [NaN, -Infinity, +Infinity, -1];
    var theError = [];
    var numberOfCalls = 0;
    for (var i = 0; i < elements.length; i++) {
        var ws = new WritableStream({},
        {
            size: function() {
                return elements[i];
            },
            highWaterMark: 5
        });

        var writeFunction = function(i, r) {
            assert_throws(new RangeError(), function() { throw r; }, 'write should reject with a RangeError for ' + elements[i]);
            theError[i] = r;
        };
        ws.write('a').then(
            test4.step_func(function() { assert_unreached('write should not fulfill'); }),
            test4.step_func(writeFunction.bind(this, i))
        );

        var catchFunction = function(i, e) {
            assert_equals(e, theError[i], 'closed should reject with the error for ' + elements[i]);
            if (++numberOfCalls, elements.length) {
                test4.done();
            }
        };

        ws.closed.catch(test4.step_func(catchFunction.bind(this, i)));
    }
});

test(function() {
    var theError = new Error('a unique string');

    assert_throws(theError, function() {
        new WritableStream({}, {
            size: function() {
                return 1;
            },
            get highWaterMark() {
                throw theError;
            }
        });
    }, 'construction should re-throw the error');
}, 'Writable stream: throwing strategy.highWaterMark getter');

test(function() {
    for (var highWaterMark of [-1, -Infinity]) {
        assert_throws(new RangeError(), function() {
            new WritableStream({}, {
                size: function() {
                    return 1;
                },
                highWaterMark
            });
        }, 'construction should throw a RangeError for ' + highWaterMark);
    }

    for (var highWaterMark of [NaN, 'foo', {}]) {
        assert_throws(new TypeError(), function() {
            new WritableStream({}, {
                size: function() {
                    return 1;
                },
                highWaterMark
            });
        }, 'construction should throw a TypeError for ' + highWaterMark);
    }
}, 'Writable stream: invalid strategy.highWaterMark');
