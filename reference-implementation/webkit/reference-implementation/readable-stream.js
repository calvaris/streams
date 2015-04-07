require('../resources/testharness');

require('./utils/streams-utils');

test(function() {
    new ReadableStream(); // ReadableStream constructed with no errors.
}, 'ReadableStream can be constructed with no arguments');

test(function() {
    var error = new Error('aaaugh!!');

    assert_throws(error, function() { new ReadableStream({ start() { throw error; } }) }, 'error should be re-thrown');
}, 'ReadableStream: if start throws an error, it should be re-thrown');

var test1 = async_test('ReadableStream: if pull rejects, it should error the stream');
test1.step(function() {
    var error = new Error('pull failure');
    var rs = new ReadableStream({
        pull: function() {
            return Promise.reject(error);
        }
    });

    var reader = rs.getReader();

    var closed = false;
    var read = false;

    reader.closed.catch(test1.step_func(function(e) {
        closed = true;
        assert_false(read);
        assert_equals(e, error, 'closed should reject with the thrown error');
    }));

    reader.read().catch(test1.step_func(function(e) {
        read = true;
        assert_true(closed);
        assert_equals(e, error, 'read() should reject with the thrown error');
        test1.done();
    }));
});

var test6 = async_test('ReadableStream: should only call pull once upon starting the stream');
test6.step(function() {
    var pullCount = 0;
    var startPromise = Promise.resolve();
    var rs = new ReadableStream({
        start: function() {
            return startPromise;
        },
        pull: function() {
            pullCount++;
        }
    });

    startPromise.then(test6.step_func(function() {
        assert_equals(pullCount, 1, 'pull should be called once start finishes');
    }));

    setTimeout(test6.step_func(function() {
        assert_equals(pullCount, 1, 'pull should be called exactly once');
        test6.done();
    }), 50);
});

var test7 = async_test('ReadableStream: should only call pull once for a forever-empty stream, even after reading');
test7.step(function() {
    var pullCount = 0;
    var startPromise = Promise.resolve();
    var rs = new ReadableStream({
        start: function() {
            return startPromise;
        },
        pull: function() {
            pullCount++;
        }
    });

    startPromise.then(test7.step_func(function() {
        assert_equals(pullCount, 1, 'pull should be called once start finishes');
    }));

    rs.getReader().read();

    setTimeout(test7.step_func(function() {
        assert_equals(pullCount, 1, 'pull should be called exactly once');
        test7.done();
    }), 50);
});

var test8 = async_test('ReadableStream: should only call pull once on a non-empty stream read from before start fulfills');
test8.step(function() {
    var pullCount = 0;
    var startPromise = Promise.resolve();
    var rs = new ReadableStream({
        start: function(c) {
            c.enqueue('a');
            return startPromise;
        },
        pull: function() {
            pullCount++;
        }
    });

    startPromise.then(test8.step_func(function() {
        assert_equals(pullCount, 1, 'pull should be called once start finishes');
    }));

    rs.getReader().read().then(test8.step_func(function(r) {
        assert_object_equals(r, { value: 'a', done: false }, 'first read() should return first chunk');
        assert_equals(pullCount, 1, 'pull should not have been called again');
    }));

    assert_equals(pullCount, 0, 'calling read() should not cause pull to be called yet');

    setTimeout(test8.step_func(function() {
        assert_equals(pullCount, 1, 'pull should be called exactly once');
        test8.done();
    }), 50);
});

var test9 = async_test('ReadableStream: should only call pull twice on a non-empty stream read from after start fulfills');
test9.step(function() {
    var pullCount = 0;
    var startPromise = Promise.resolve();
    var rs = new ReadableStream({
        start: function(c) {
            c.enqueue('a');
            return startPromise;
        },
        pull: function() {
            pullCount++;
        }
    });

    startPromise.then(test9.step_func(function() {
        assert_equals(pullCount, 1, 'pull should be called once start finishes');

        rs.getReader().read().then(test9.step_func(function(r) {
            assert_object_equals(r, { value: 'a', done: false }, 'first read() should return first chunk');
            assert_equals(pullCount, 2, 'pull should be called again once read fulfills');
        }));
    }));

    assert_equals(pullCount, 0, 'calling read() should not cause pull to be called yet');

    setTimeout(test9.step_func(function() {
        assert_equals(pullCount, 2, 'pull should be called exactly twice')
        test9.done();
    }), 50);
});

var test10 = async_test('ReadableStream: should call pull in reaction to read()ing the last chunk, if not draining');
test10.step(function() {
    var pullCount = 0;
    var controller;
    var startPromise = Promise.resolve();
    var pullPromise = Promise.resolve();
    var rs = new ReadableStream({
        start: function(c) {
            controller = c;
            return startPromise;
        },
        pull: function() {
            ++pullCount;
            return pullPromise;
        }
    });

    var reader = rs.getReader();

    startPromise.then(test10.step_func(function() {
        assert_equals(pullCount, 1, 'pull should have been called once after read');

        controller.enqueue('a');

        return pullPromise.then(test10.step_func(function() {
            assert_equals(pullCount, 2, 'pull should have been called a second time after enqueue');

            return reader.read().then(test10.step_func(function() {
                assert_equals(pullCount, 3, 'pull should have been called a third time after read');
            }));
        }));
    })).catch(test10.step_func(function(e) {
        assert_unreached(e);
    }));

    setTimeout(test10.step_func(function() {
        assert_equals(pullCount, 3, 'pull should be called exactly thrice')
        test10.done();
    }), 50);
});

var test11 = async_test('ReadableStream: should not call pull() in reaction to read()ing the last chunk, if draining');
test11.step(function() {
    var pullCount = 0;
    var controller;
    var startPromise = Promise.resolve();
    var pullPromise = Promise.resolve();
    var rs = new ReadableStream({
        start: function(c) {
            controller = c;
            return startPromise;
        },
        pull: function() {
            ++pullCount;
            return pullPromise;
        }
    });

    var reader = rs.getReader();

    startPromise.then(test11.step_func(function() {
        assert_equals(pullCount, 1, 'pull should have been called once after read');

        controller.enqueue('a');

        return pullPromise.then(test11.step_func(function() {
            assert_equals(pullCount, 2, 'pull should have been called a second time after enqueue');

            controller.close();

            return reader.read().then(test11.step_func(function() {
                assert_equals(pullCount, 2, 'pull should not have been called a third time after read');
            }));
        }));
    })).catch(test11.step_func(function(e) {
        assert_unreached(e)
    }));

    setTimeout(test11.step_func(function() {
        assert_equals(pullCount, 2, 'pull should be called exactly twice')
        test11.done();
    }), 50);
});

var test12 = async_test('ReadableStream: should not call pull until the previous pull call\'s promise fulfills');
test12.step(function() {
    var resolve;
    var returnedPromise;
    var timesCalled = 0;
    var startPromise = Promise.resolve();
    var rs = new ReadableStream({
        start: function(c) {
            c.enqueue('a');
            return startPromise;
        },
        pull: function() {
            ++timesCalled;
            returnedPromise = new Promise(test12.step_func(function(r) { resolve = r; }));
            return returnedPromise;
        }
    });
    var reader = rs.getReader();

    startPromise.then(test12.step_func(function() {
        reader.read().then(test12.step_func(function(result1) {
            assert_equals(timesCalled, 1, 'pull should have been called once after start, but not yet have been called a second time');
            assert_object_equals(result1, { value: 'a', done: false }, 'read() should fulfill with the enqueued value');

            setTimeout(test12.step_func(function() {
                assert_equals(timesCalled, 1, 'after 30 ms, pull should still only have been called once');

                resolve();

                returnedPromise.then(test12.step_func(function() {
                    assert_equals(timesCalled, 2, 'after the promise returned by pull is fulfilled, pull should be called a second time');
                    test12.done();
                }));
            }), 30);
        }))
    })).catch(test12.step_func(function(e) {
        assert_unreached(e)
    }));
});

var test13 = async_test('ReadableStream: should pull after start, and after every read');
test13.step(function() {
    var timesCalled = 0;
    var startPromise = Promise.resolve();
    var rs = new ReadableStream({
        start: function(c) {
            c.enqueue('a');
            c.enqueue('b');
            c.enqueue('c');
            return startPromise;
        },
        pull: function() {
            ++timesCalled;
        },
        strategy: {
            size: function() {
                return 1;
            },
            shouldApplyBackpressure: function() {
                return false;
            }
        }
    });
    var reader = rs.getReader();

    startPromise.then(test13.step_func(function() {
        return reader.read().then(test13.step_func(function(result1) {
            assert_object_equals(result1, { value: 'a', done: false }, 'first chunk should be as expected');

            return reader.read().then(test13.step_func(function(result2) {
                assert_object_equals(result2, { value: 'b', done: false }, 'second chunk should be as expected');

                return reader.read().then(test13.step_func(function(result3) {
                    assert_object_equals(result3, { value: 'c', done: false }, 'third chunk should be as expected');

                    setTimeout(test13.step_func(function() {
                        // Once for after start, and once for every read.
                        assert_equals(timesCalled, 4, 'pull() should be called exactly four times');
                        test13.done();
                    }), 50);
                }));
            }));
        }));
    })).catch(test13.step_func(function(e) { assert_unreached(e); }));
});

var test14 = async_test('ReadableStream: should not call pull after start if the stream is now closed');
test14.step(function() {
    var timesCalled = 0;
    var startPromise = Promise.resolve();
    var rs = new ReadableStream({
        start: function(c) {
            c.enqueue('a');
            c.close();
            return startPromise;
        },
        pull: function() {
            ++timesCalled;
        }
    });

    startPromise.then(test14.step_func(function() {
        assert_equals(timesCalled, 0, 'after start finishes, pull should not have been called');

        var reader = rs.getReader();
        return reader.read().then(test14.step_func(function() {
            assert_equals(timesCalled, 0, 'reading should not have triggered a pull call');

            return reader.closed.then(test14.step_func(function() {
                assert_equals(timesCalled, 0, 'stream should have closed with still no calls to pull');
                test14.done();
            }));
        }));
    })).catch(test14.step_func(function(e) { assert_unreached(e); }));
});

var test15 = async_test('ReadableStream: should call pull after enqueueing from inside pull (with no read requests), if strategy allows');
test15.step(function() {
    var timesCalled = 0;
    var startPromise = Promise.resolve();
    var rs = new ReadableStream({
        start: function() {
            return startPromise;
        },
        pull: function(c) {
            c.enqueue(++timesCalled);
        },
        strategy: {
            size: function() {
                return 1;
            },
            shouldApplyBackpressure: function(size) {
                return size > 3;
            }
        }
    });

    startPromise.then(test15.step_func(function() {
        // after start: size = 0, pull()
        // after enqueue(1): size = 1, pull()
        // after enqueue(2): size = 2, pull()
        // after enqueue(3): size = 3, pull()
        // after enqueue(4): size = 4, do not pull
        assert_equals(timesCalled, 4, 'pull() should have been called four times');
        test15.done();
    }));
});

test(function() {
  var rs = new ReadableStream({
      start: function(c) {
          assert_equals(c.enqueue('a'), true, 'the first enqueue should return true');
          c.close();

          assert_throws(new TypeError(''), function() { c.enqueue('b'); }, 'enqueue after close should throw a TypeError');
      }
  });
}, 'ReadableStream: enqueue should throw when the stream is readable but draining');

test(function() {
    var rs = new ReadableStream({
        start: function(c) {
            c.close();

            assert_throws(new TypeError(), function() { c.enqueue('a'); }, 'enqueue after close should throw a TypeError');
        }
    });
}, 'ReadableStream: enqueue should throw when the stream is closed');

test(function() {
    var expectedError = new Error('i am sad');
    var rs = new ReadableStream({
        start: function(c) {
            c.error(expectedError);

            assert_throws(expectedError, function() { c.enqueue('a'); }, 'enqueue after error should throw that error');
        }
    });
}, 'ReadableStream: enqueue should throw the stored error when the stream is errored');

var test16 = async_test('ReadableStream: should call underlying source methods as methods');
test16.step(function() {
    var startCalled = 0;
    var pullCalled = 0;
    var cancelCalled = 0;
    var strategyCalled = 0;

    function Source() {
    }

    Source.prototype = {
        start: function(c) {
            startCalled++;
            assert_equals(this, theSource, 'start() should be called with the correct this');
            c.enqueue('a');
        },

        pull: function() {
            pullCalled++;
            assert_equals(this, theSource, 'pull() should be called with the correct this');
        },

        cancel: function() {
            cancelCalled++;
            assert_equals(this, theSource, 'cancel() should be called with the correct this');
        },

        get strategy() {
            // Called three times
            strategyCalled++;
            assert_equals(this, theSource, 'strategy getter should be called with the correct this');
            return undefined;
        }
    };

    var theSource = new Source();
    theSource.debugName = 'the source object passed to the constructor'; // makes test failures easier to diagnose
    var rs = new ReadableStream(theSource);

    var reader = rs.getReader();
    reader.read().then(test16.step_func(function() {
        reader.releaseLock();
        rs.cancel();
        assert_equals(startCalled, 1);
        assert_equals(pullCalled, 1);
        assert_equals(cancelCalled, 1);
        assert_equals(strategyCalled, 3);
        test16.done();
    })).catch(test16.step_func(function(e) { assert_unreached(e); } ));
});

test(function() {
  new ReadableStream({
      start: function(c) {
          assert_equals(c.enqueue('a'), true, 'first enqueue should return true');
          assert_equals(c.enqueue('b'), false, 'second enqueue should return false');
          assert_equals(c.enqueue('c'), false, 'third enqueue should return false');
          assert_equals(c.enqueue('d'), false, 'fourth enqueue should return false');
          assert_equals(c.enqueue('e'), false, 'fifth enqueue should return false');
      }
  });
}, 'ReadableStream strategies: the default strategy should return false for all but the first enqueue call');

var test17 = async_test('ReadableStream strategies: the default strategy should continue returning true from enqueue if the chunks are read immediately');
test17.step(function() {
    var controller;
    var rs = new ReadableStream({
        start: function(c) {
            controller = c;
        }
    });
    var reader = rs.getReader();

    assert_equals(controller.enqueue('a'), true, 'first enqueue should return true');

    reader.read().then(test17.step_func(function(result1) {
        assert_object_equals(result1, { value: 'a', done: false }, 'first chunk read should be correct');
        assert_equals(controller.enqueue('b'), true, 'second enqueue should return true');

        return reader.read();
    })).then(test17.step_func(function(result2) {
        assert_object_equals(result2, { value: 'b', done: false }, 'second chunk read should be correct');
        assert_equals(controller.enqueue('c'), true, 'third enqueue should return true');

        return reader.read();
    })).then(test17.step_func(function(result3) {
        assert_object_equals(result3, { value: 'c', done: false }, 'third chunk read should be correct');
        assert_equals(controller.enqueue('d'), true, 'fourth enqueue should return true');

        test17.done();
    })).catch(test17.step_func(function(e) { assert_unreached(e); } ));
});

var test18 = async_test('ReadableStream integration test: adapting a random push source');
test18.step(function() {
    var pullChecked = false;
    var randomSource = new RandomPushSource(8);

    var rs = new ReadableStream({
        start: function(c) {
            assert_equals(typeof c, 'object', 'c should be an object in start');
            assert_equals(typeof c.enqueue, 'function', 'enqueue should be a function in start');
            assert_equals(typeof c.close, 'function', 'close should be a function in start');
            assert_equals(typeof c.error, 'function', 'error should be a function in start');

            randomSource.ondata = test18.step_func(function(chunk) {
                if (!c.enqueue(chunk)) {
                    randomSource.readStop();
                }
            });

            randomSource.onend = c.close.bind(c);
            randomSource.onerror = c.error.bind(c);
        },

        pull: function(c) {
            if (!pullChecked) {
                pullChecked = true;
                assert_equals(typeof c, 'object', 'c should be an object in pull');
                assert_equals(typeof c.enqueue, 'function', 'enqueue should be a function in pull');
                assert_equals(typeof c.close, 'function', 'close should be a function in pull');
            }

            randomSource.readStart();
        }
    });

    readableStreamToArray(rs).then(test18.step_func(function(chunks) {
        assert_equals(chunks.length, 8, '8 chunks should be read');
        for (var i = 0; i < chunks.length; i++) {
            assert_equals(chunks[i].length, 128, 'chunk should have 128 bytes');
        }

        test18.done();
    }), test18.step_func(function(e) { assert_reached(e); }));
});

var test19 = async_test('ReadableStream integration test: adapting a sync pull source');
test19.step(function() {
    var rs = sequentialReadableStream(10);

    readableStreamToArray(rs).then(test19.step_func(function(chunks) {
        assert_equals(rs.source.closed, true, 'source should be closed after all chunks are read');
        assert_array_equals(chunks, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 'the expected 10 chunks should be read');

        test19.done();
    }));
});

var test20 = async_test('ReadableStream integration test: adapting an async pull source');
test20.step(function() {
    var rs = sequentialReadableStream(10, { async: true });

    readableStreamToArray(rs).then(test20.step_func(function(chunks) {
        assert_equals(rs.source.closed, true, 'source should be closed after all chunks are read');
        assert_array_equals(chunks, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 'the expected 10 chunks should be read');

        test20.done();
    }));
});
