require('../resources/testharness');

require('./utils/streams-utils');

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

test(function() {
    assert_throws(new RangeError(), function() {
        new ReadableStream({}, {
            size: function() {
                return 1;
            },
            highWaterMark: -1
        });
    }, 'construction should throw a RangeError');
}, 'Readable stream: negative strategy.highWaterMark');

var test2 = async_test('Readable stream: strategy.size returning NaN');
test2.step(function() {
    var theError;
    var startCalled = false;
    var rs = new ReadableStream(
        {
            start: function(c) {
                try {
                    c.enqueue('hi');
                    assert_unreached('enqueue didn\'t throw');
                } catch (error) {
                    startCalled = true;
                    assert_equals(error.constructor, RangeError, 'enqueue should throw a RangeError');
                    theError = error;
                }
            }
        },
        {
            size: function() {
                return NaN;
            },
            highWaterMark: 5
        }
    );

    rs.getReader().closed.catch(test2.step_func(function(e) {
        assert_equals(e, theError, 'closed should reject with the error');
        assert_true(startCalled);
        test2.done();
    }));
});

var test3 = async_test('Readable stream: strategy.size returning -Infinity');
test3.step(function() {
    var theError;
    var startCalled = false;
    var rs = new ReadableStream(
        {
            start: function(c) {
                try {
                    c.enqueue('hi');
                    assert_unreached('enqueue didn\'t throw');
                } catch (error) {
                    startCalled = true;
                    assert_equals(error.constructor, RangeError, 'enqueue should throw a RangeError');
                    theError = error;
                }
            }
        },
        {
            size: function() {
                return -Infinity;
            },
            highWaterMark: 5
        }
    );

    rs.getReader().closed.catch(test3.step_func(function(e) {
        assert_equals(e, theError, 'closed should reject with the error');
        assert_true(startCalled);
        test3.done();
    }));
});

var test4 = async_test('Readable stream: strategy.size returning +Infinity');
test4.step(function() {
    var theError;
    var startCalled = false;
    var rs = new ReadableStream(
        {
            start: function(c) {
                try {
                    c.enqueue('hi');
                    assert_unreached('enqueue didn\'t throw');
                } catch (error) {
                    startCalled = true;
                    assert_equals(error.constructor, RangeError, 'enqueue should throw a RangeError');
                    theError = error;
                }
            }
        },
        {
            size: function() {
                return +Infinity;
            },
            highWaterMark: 5
        }
    );

    rs.getReader().closed.catch(test4.step_func(function(e) {
        assert_equals(e, theError, 'closed should reject with the error');
        assert_true(startCalled);
        test4.done();
    }));
});
